import mongoose from "mongoose";

export async function connectMongo(uri: string) {
    console.log("🔍 Trying to connect MongoDB with URI:", uri); // debug

    try {
        await mongoose.connect(uri);
        console.log("✅ MongoDB connected successfully!");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}
