import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ESM-compatible __filename/__dirname and load root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.AI_GEMINI_MODEL || 'gemini-2.5-flash';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

async function callGeminiRobust(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

    // 1) Try SDK first (usually selects correct backend)
    if (genAI) {
        try {
            const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (e: any) {
            // fall through to HTTP attempts
            console.warn("SDK call failed, trying HTTP endpoints:", e?.message || e);
        }
    }

    // 2) Try HTTP endpoints across versions/models
    const attempts = [
        { url: `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, version: 'v1', model: GEMINI_MODEL },
        { url: `https://generativelanguage.googleapis.com/v1/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, version: 'v1', model: 'gemini-flash-latest' },
        { url: `https://generativelanguage.googleapis.com/v1/models/gemini-pro-latest:generateContent?key=${GEMINI_API_KEY}`, version: 'v1', model: 'gemini-pro-latest' },
        { url: `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, version: 'v1beta', model: GEMINI_MODEL },
        { url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, version: 'v1beta', model: 'gemini-2.5-flash' },
        { url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, version: 'v1beta', model: 'gemini-2.0-flash' }
    ];

    for (const att of attempts) {
        try {
            const resp = await axios.post(att.url, { contents: [{ parts: [{ text: prompt }] }] }, { timeout: 30000 });
            const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (typeof text === 'string' && text.length) return text;
            throw new Error("Empty response text");
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data;
            console.warn(`Attempt failed (${att.version}/${att.model})`, status ? `status=${status}` : "", data ? `body=${JSON.stringify(data)}` : "");
            // try next
        }
    }

    throw new Error("All Gemini attempts failed (v1/v1beta, multiple models)");
}

// Health endpoint (must be at top-level)
app.get("/health", (req, res) => {
    res.json({ status: "OK", service: "AI Service", port: PORT });
});

// Debug endpoint: list models from both v1 and v1beta to diagnose 404s
app.get("/models", async (req, res) => {
    try {
        const results: any = {};
        try {
            const v1 = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`);
            results.v1 = v1.data;
        } catch (e: any) {
            results.v1Error = e?.response?.data || e?.message;
        }
        try {
            const v1b = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
            results.v1beta = v1b.data;
        } catch (e: any) {
            results.v1betaError = e?.response?.data || e?.message;
        }
        res.json(results);
    } catch (e: any) {
        res.status(500).json({ error: "Failed to list models", details: e?.message });
    }
});

app.post("/ask", async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Missing prompt" });

        const answer = await callGeminiRobust(prompt);

        res.json({
            answer,
            confidence: 0.9,
        });
    } catch (err: any) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        console.error("❌ Error calling Gemini:", err.message, status ? `status=${status}` : "", data ? `body=${JSON.stringify(data)}` : "");
        res.status(500).json({ error: "AI service failed", details: status || err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🤖 AI Service is running at http://localhost:${PORT}`);
});
