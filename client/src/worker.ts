import { pipeline, env, AutoTokenizer, SpeechT5ForTextToSpeech, SpeechT5HifiGan, Tensor } from '@xenova/transformers'
import encodeWAV from './utils/encodeWAV'

// Disable local models
env.allowLocalModels = false;
env.useBrowserCache = false;

// Whisper
// Define model factories
// Ensures only one model is created of each type
class PipelineFactory {
  static task = null
  static model = null
  static quantized = null
  static instance = null

  constructor(tokenizer, model, quantized) {
    this.tokenizer = tokenizer
    this.model = model
    this.quantized = quantized
  }

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, {
        quantized: this.quantized,
        progress_callback,

        // For medium models, we need to load the `no_attentions` revision to avoid running out of memory
        revision: this.model.includes('/whisper-medium') ? 'no_attentions' : 'main'
      })
    }

    return this.instance
  }
}

self.addEventListener('message', async (event) => {
  const message = event.data

  // Do some work...
  // TODO use message data
  let transcript = await transcribe(
    message.audio,
    message.model,
    message.multilingual,
    message.quantized,
    message.subtask,
    message.language
  )
  if (transcript === null) return

  // Send the result back to the main thread
  self.postMessage({
    status: 'complete',
    task: 'automatic-speech-recognition',
    data: transcript
  })
})

class AutomaticSpeechRecognitionPipelineFactory extends PipelineFactory {
  static task = 'automatic-speech-recognition'
  static model = null
  static quantized = null
}

const transcribe = async (audio: any, model: any, multilingual: any, quantized: any, subtask: any, language: string) => {
  const isDistilWhisper = model.startsWith('distil-whisper/')

  let modelName = model
  if (!isDistilWhisper && !multilingual) {
    modelName += '.en'
  }

  const p = AutomaticSpeechRecognitionPipelineFactory
  if (p.model !== modelName || p.quantized !== quantized) {
    // Invalidate model if different
    p.model = modelName
    p.quantized = quantized

    if (p.instance !== null) {
      ;(await p.getInstance()).dispose()
      p.instance = null
    }
  }

  // Load transcriber model
  let transcriber = await p.getInstance((data) => {
    self.postMessage(data)
  })

  const time_precision =
    transcriber.processor.feature_extractor.config.chunk_length / transcriber.model.config.max_source_positions

  // Storage for chunks to be processed. Initialise with an empty chunk.
  let chunks_to_process = [
    {
      tokens: [],
      finalised: false
    }
  ]

  // TODO: Storage for fully-processed and merged chunks
  // let decoded_chunks = [];

  function chunk_callback(chunk) {
    let last = chunks_to_process[chunks_to_process.length - 1]

    // Overwrite last chunk with new info
    Object.assign(last, chunk)
    last.finalised = true

    // Create an empty chunk after, if it not the last chunk
    if (!chunk.is_last) {
      chunks_to_process.push({
        tokens: [],
        finalised: false
      })
    }
  }

  // Inject custom callback function to handle merging of chunks
  function callback_function(item) {
    let last = chunks_to_process[chunks_to_process.length - 1]

    // Update tokens of last chunk
    last.tokens = [...item[0].output_token_ids]

    // Merge text chunks
    // TODO optimise so we don't have to decode all chunks every time
    let data = transcriber.tokenizer._decode_asr(chunks_to_process, {
      time_precision: time_precision,
      return_timestamps: true,
      force_full_sequences: false
    })

    self.postMessage({
      status: 'update',
      task: 'automatic-speech-recognition',
      data: data
    })
  }

  // Actually run transcription
  let output = await transcriber(audio, {
    // Greedy
    top_k: 0,
    do_sample: false,

    // Sliding window
    chunk_length_s: isDistilWhisper ? 20 : 30,
    stride_length_s: isDistilWhisper ? 3 : 5,

    // Language and task
    language: language,
    task: subtask,

    // Return timestamps
    return_timestamps: true,
    force_full_sequences: false,

    // Callback functions
    callback_function: callback_function, // after each generation step
    chunk_callback: chunk_callback // after each chunk is processed
  }).catch((error) => {
    self.postMessage({
      status: 'error',
      task: 'automatic-speech-recognition',
      data: error
    })
    return null
  })

  return output
}



// Text-To-Speech-Client
// Use the Singleton pattern to enable lazy construction of the pipeline.
class MyTextToSpeechPipeline {
  static BASE_URL = 'https://huggingface.co/datasets/Xenova/cmu-arctic-xvectors-extracted/resolve/main/'

  static model_id = 'Xenova/speecht5_tts'
  static vocoder_id = 'Xenova/speecht5_hifigan'

  static tokenizer_instance = null
  static model_instance = null
  static vocoder_instance = null

  static async getInstance(progress_callback = null) {
    if (this.tokenizer_instance === null) {
      this.tokenizer = AutoTokenizer.from_pretrained(this.model_id, { progress_callback })
    }

    if (this.model_instance === null) {
      this.model_instance = SpeechT5ForTextToSpeech.from_pretrained(this.model_id, {
        dtype: 'fp32',
        progress_callback
      })
    }

    if (this.vocoder_instance === null) {
      this.vocoder_instance = SpeechT5HifiGan.from_pretrained(this.vocoder_id, {
        dtype: 'fp32',
        progress_callback
      })
    }

    return new Promise(async (resolve, reject) => {
      const result = await Promise.all([this.tokenizer, this.model_instance, this.vocoder_instance])
      self.postMessage({
        status: 'ready'
      })
      resolve(result)
    })
  }

  static async getSpeakerEmbeddings(speaker_id) {
    // e.g., `cmu_us_awb_arctic-wav-arctic_a0001`
    const speaker_embeddings_url = `${this.BASE_URL}${speaker_id}.bin`
    const speaker_embeddings = new Tensor(
      'float32',
      new Float32Array(await (await fetch(speaker_embeddings_url)).arrayBuffer()),
      [1, 512]
    )
    return speaker_embeddings
  }
}

// Mapping of cached speaker embeddings
const speaker_embeddings_cache = new Map()

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  // Load the pipeline
  const [tokenizer, model, vocoder] = await MyTextToSpeechPipeline.getInstance((x) => {
    // We also add a progress callback so that we can track model loading.
    self.postMessage(x)
  })

  // Tokenize the input
  const { input_ids } = tokenizer(event.data.text)

  // Load the speaker embeddings
  let speaker_embeddings = speaker_embeddings_cache.get(event.data.speaker_id)
  if (speaker_embeddings === undefined) {
    speaker_embeddings = await MyTextToSpeechPipeline.getSpeakerEmbeddings(event.data.speaker_id)
    speaker_embeddings_cache.set(event.data.speaker_id, speaker_embeddings)
  }

  // Generate the waveform
  const { waveform } = await model.generate_speech(input_ids, speaker_embeddings, { vocoder })

  // Encode the waveform as a WAV file
  const wav = encodeWAV(waveform.data)

  // Send the output back to the main thread
  self.postMessage({
    status: 'complete',
    output: new Blob([wav], { type: 'audio/wav' })
  })
})




/**
 * This class uses the Singleton pattern to ensure that only one instance of the
 * pipeline is loaded. This is because loading the pipeline is an expensive
 * operation and we don't want to do it every time we want to translate a sentence.
 */
class MyTranslationPipeline {
  static task: any = 'translation';
  static model = 'Xenova/nllb-200-distilled-600M';
  static instance: any = null;

  static async getInstance(progress_callback: any = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  // Retrieve the translation pipeline. When called for the first time,
  // this will load the pipeline and save it for future use.
  let translator = await MyTranslationPipeline.getInstance((x: any) => {
    // We also add a progress callback to the pipeline so that we can
    // track model loading.
    self.postMessage(x);
  });

  // Actually perform the translation
  let output = await translator(event.data.text, {
    tgt_lang: event.data.tgt_lang,
    src_lang: event.data.src_lang,

    // Allows for partial output
    callback_function: (x: any) => {
      self.postMessage({
        status: 'update',
        output: translator.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true })
      });
    }
  });

  // Send the output back to the main thread
  self.postMessage({
    status: 'complete',
    output: output,
  });
});