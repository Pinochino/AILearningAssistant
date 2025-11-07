import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'

interface ConvertOptions {
  deleteOriginal?: boolean
}

/**
 * Service chịu trách nhiệm chuyển đổi file DOCX sang PDF.
 * Ưu tiên dùng LibreOffice (hoặc soffice CLI).
 * Nếu không có, có thể thay thế bằng thư viện khác sau này.
 */
const docxConverter = {
  /**
   * Convert .docx → .pdf
   * @param inputPath Đường dẫn file .docx
   * @param options Tuỳ chọn (deleteOriginal: xoá file gốc sau khi convert)
   * @returns Đường dẫn file .pdf được tạo
   */
  convertToPdf: async (inputPath: string, options: ConvertOptions = {}): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync(inputPath)) {
          return reject(new Error('Input file not found'))
        }

        const ext = path.extname(inputPath).toLowerCase()
        if (ext !== '.docx') {
          return reject(new Error('Only .docx files are supported'))
        }

        const inputDir = path.dirname(inputPath)
        const outputDir = inputDir
        const fileName = path.basename(inputPath, ext)
        const outputPath = path.join(outputDir, `${fileName}.pdf`)

        // 🔧 Lệnh dùng LibreOffice (CLI)
        // LibreOffice phải được cài trong môi trường server
        const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`

        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error('LibreOffice conversion error:', stderr || error.message)
            return reject(new Error('Failed to convert DOCX to PDF'))
          }

          // Kiểm tra file PDF đã được tạo chưa
          if (!fs.existsSync(outputPath)) {
            console.error('PDF output file not found after conversion')
            return reject(new Error('PDF file not created'))
          }

          // ✅ Xóa file .docx gốc nếu được yêu cầu
          if (options.deleteOriginal) {
            try {
              fs.unlinkSync(inputPath)
              console.log(`🧹 Deleted original DOCX: ${path.basename(inputPath)}`)
            } catch (cleanupErr: any) {
              console.warn(`⚠️ Failed to delete original DOCX: ${cleanupErr.message}`)
            }
          }

          resolve(outputPath)
        })
      } catch (err: any) {
        reject(err)
      }
    })
  }
}

export default docxConverter
