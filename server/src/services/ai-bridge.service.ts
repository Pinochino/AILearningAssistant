import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class AiBridgeService {
    private AI_SERVICE_URL: string | undefined;

    constructor() {
        this.AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:3001";
    }

    async ask(
        prompt: string, 
        meta: Record<string, any> = {}, 
        retries = 1
    ): Promise<{ 
        answer: string; 
        confidence: number;
        source?: string;
        model?: string;
        error?: string;
        status?: string;
        timestamp?: string;
    }> {
        // ✅ Luôn prepend system prompt (tutor mode + rule chống tục tĩu)
        const tutorPrompt = `
        Bạn là một tutor tận tâm, nhiệm vụ của bạn là giải thích kiến thức một cách rõ ràng, 
        dễ hiểu cho học sinh, sinh viên. Hãy dùng giọng thân thiện và tập trung vào việc dạy học.
        Ở cuối câu trả lời của bạn, có thể thêm phần gợi ý nội dung tiếp theo mà học sinh/ sinh
        viên có thể hỏi.

        ⚠️ Quy tắc bắt buộc:
        - Nếu học sinh/sinh viên hỏi bằng ngôn từ thô tục, thiếu văn hóa, xúc phạm hoặc không phù hợp,
          bạn phải từ chối trả lời một cách lịch sự.
        - Nếu câu hỏi nghiêm túc và phù hợp, hãy trả lời chi tiết, giải thích từng bước dễ hiểu.

        Câu hỏi của học sinh: ${prompt}
        `;

        // ✅ Ưu tiên gọi AI service ngoài (port 3001)
        if (this.AI_SERVICE_URL) {
            try {
                const res = await axios.post(
                    `${this.AI_SERVICE_URL}/ask`,
                    {
                        prompt: tutorPrompt,
                        meta,
                        timestamp: new Date().toISOString(),
                    },
                    { 
                        timeout: 15000, // Reduce timeout for faster fallback
                        validateStatus: () => true // Don't throw on HTTP errors
                    }
                );

                // If successful, return the response
                if (res.status >= 200 && res.status < 300) {
                    return res.data;
                }

                // If we have retries left, try again
                if (retries > 0) {
                    console.warn(`⚠️ AI Service returned ${res.status}, retrying... (${retries} attempts left)`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return this.ask(prompt, meta, retries - 1);
                }

                console.error(`❌ AI Service failed after retries: ${res.status} - ${JSON.stringify(res.data)}`);
            } catch (err: any) {
                if (retries > 0) {
                    console.warn(`⚠️ AI Service error (${err.message}), retrying... (${retries} attempts left)`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return this.ask(prompt, meta, retries - 1);
                }
                console.error("❌ AI Service unreachable:", err.message);
            }
        }

        // If we get here, either AI service is not configured or all retries failed
        console.warn("⚠️ Fallback to direct Gemini call");
        return this.callGemini(tutorPrompt);
    }

    private async callGemini(
        prompt: string, 
        retries = 2, 
        delay = 1000
    ): Promise<{ 
        answer: string; 
        confidence: number;
        source?: string;
        model?: string;
        error?: string;
        status?: string;
        timestamp?: string;
    }> {
        const maxRetries = 3;
        const attempt = maxRetries - retries + 1;
        
        try {
            console.log(`🔍 Gemini API call attempt ${attempt}/${maxRetries}`);
            
            const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_KEY;
            if (!apiKey) {
                console.error("❌ GEMINI_API_KEY is not set in environment variables");
                return {
                    answer: "Xin lỗi, cấu hình dịch vụ AI chưa hoàn chỉnh. Vui lòng liên hệ quản trị viên.",
                    confidence: 0.1
                };
            }

            // Mask API key in logs (show first 5 and last 4 characters)
            const maskedKey = `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`;
            console.log(`🔑 Using Gemini API key: ${maskedKey}`);

            const modelName = process.env.AI_GEMINI_MODEL || "gemini-2.5-flash";
            console.log(`🤖 Using model: ${modelName}`);
            
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: {
                    maxOutputTokens: 2000,
                    temperature: 0.7,
                },
            });

            // Add timeout to prevent hanging (reduced from 20s to 15s)
            const controller = new AbortController();
            const timeoutMs = 15000;
            const timeoutId = setTimeout(() => {
                console.warn(`⏱️ Request timeout after ${timeoutMs}ms`);
                controller.abort();
            }, timeoutMs);
            
            try {
                console.log("📤 Sending request to Gemini API...");
                const result = await model.generateContent(prompt, {
                    signal: controller.signal,
                    timeout: timeoutMs - 1000, // Slightly less than the abort timeout
                });
                
                clearTimeout(timeoutId);
                console.log("✅ Received response from Gemini API");
                
                const text = await result.response.text();
                console.log(`📝 Response length: ${text.length} characters`);
                
                return { 
                    answer: text, 
                    confidence: 0.9,
                    source: 'gemini',
                    model: modelName,
                };
            } catch (err: any) {
                clearTimeout(timeoutId);
                console.error("❌ Gemini API call failed:", {
                    error: err.message,
                    code: err.code,
                    status: err.status,
                    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
                });
                throw err;
            }
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data;
            const errorMessage = err.message || 'Unknown error';
            const isNetworkError = [
                'aborted',
                'timeout',
                'network error',
                'network timeout',
                'ECONNABORTED',
                'ECONNRESET',
                'ETIMEDOUT'
            ].some(term => errorMessage.toLowerCase().includes(term.toLowerCase()));
            
            console.error(`❌ Gemini API error (attempt ${attempt}/${maxRetries}):`, {
                error: errorMessage,
                status,
                isNetworkError,
                code: err.code,
                data: data ? JSON.stringify(data).substring(0, 200) + '...' : null,
                retriesLeft: retries,
                timestamp: new Date().toISOString()
            });

            // If we have retries left and it's a retryable error
            const shouldRetry = isNetworkError || 
                              status === 429 || 
                              status === 503 || 
                              status === 500 || 
                              errorMessage.includes('overloaded') ||
                              errorMessage.includes('aborted');

            if (retries > 0 && shouldRetry) {
                const backoff = Math.min(delay * 2, 10000); // Max 10s backoff
                console.log(`⏳ Retrying in ${backoff}ms... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return this.callGemini(prompt, retries - 1, backoff);
            }

            // Prepare user-friendly error message
            let userMessage = "Xin lỗi, có lỗi xảy ra khi kết nối đến dịch vụ AI.";
            
            if (isNetworkError) {
                userMessage = "Không thể kết nối đến dịch vụ AI. Vui lòng kiểm tra kết nối mạng và thử lại.";
            } else if (status === 429) {
                userMessage = "Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau ít phút.";
            } else if (status === 503 || errorMessage.includes('overloaded')) {
                userMessage = "Dịch vụ AI đang quá tải. Vui lòng thử lại sau ít phút.";
            } else if (errorMessage.includes('API key not valid')) {
                userMessage = "Lỗi xác thực dịch vụ AI. Vui lòng liên hệ quản trị viên.";
                console.error("❌ Invalid API key detected");
            }

            return {
                answer: userMessage,
                confidence: 0.1,
                error: errorMessage,
                status: 'error',
                timestamp: new Date().toISOString()
            };
        }
    }
}

export default new AiBridgeService();
