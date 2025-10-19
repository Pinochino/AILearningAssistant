import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class AiBridgeService {
    private AI_SERVICE_URL: string | undefined;

    constructor() {
        this.AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:3001";
    }

    async ask(prompt: string, meta: Record<string, any> = {}) {
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
                    { timeout: 30000 }
                );
                return res.data;
            } catch (err: any) {
                console.error("❌ AI Service unreachable:", err.message);
                console.warn("⚠️ Fallback to direct Gemini call");
            }
        }

        // ✅ Nếu AI service fail thì fallback sang Gemini
        return this.callGemini(tutorPrompt);
    }

    private async callGemini(prompt: string) {
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
            const modelName = process.env.AI_GEMINI_MODEL || "gemini-2.5-flash";

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            return { answer: text, confidence: 0.9 };
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data;
            console.error(
                "❌ Gemini API error:",
                err.message,
                status ? `status=${status}` : "",
                data ? `body=${JSON.stringify(data)}` : ""
            );
            throw new Error("Failed to get AI response");
        }
    }
}

export default new AiBridgeService();
