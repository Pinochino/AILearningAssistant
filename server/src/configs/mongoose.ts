import mongoose from "mongoose";

export async function connectMongo(url: string) {
    console.log("🔍 Trying to connect MongoDB with URL:", url); // debug

    try {
        await mongoose.connect(url);
        console.log("✅ MongoDB connected successfully!");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}
