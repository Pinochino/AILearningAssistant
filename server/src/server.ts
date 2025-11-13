import expressApp from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createRedisClients } from "./config/redis.js";
import { connectMongo } from "./config/mongoose.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import { User } from "./models/User.js";
import { runSeed } from "./data/seed.js";
import { startAIServer } from "./ai-service/server.js";

// Import cron jobs from server-1
import "./crons/ValidatedTokenClean.js";
import "./crons/ForgotPasswordClean.js";

// ESM-compatible __filename/__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root .env reliably when running from src or dist
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function bootstrap() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb+srv://dtumailm_db_user:HhQXlU8VUKU6TRgV@cluster0.tb9bh1l.mongodb.net/ala';
        await connectMongo(mongoUri);
        console.log("✅ MongoDB connected");

        // Run seed to create default roles and users
        await runSeed();
        console.log("✅ Database seeded");

        // Connect to Redis
        const { pubClient, subClient } = await createRedisClients(process.env.REDIS_URL!);
        console.log("✅ Redis connected");

        // Start AI Server
        try {
            const AI_PORT = process.env.AI_SERVICE_PORT || 3001;
            await startAIServer(parseInt(AI_PORT as string));
            console.log(`✅ AI Server started on port ${AI_PORT}`);
        } catch (err: any) {
            console.error("❌ Failed to start AI Server:", err.message);
        }

        // Create HTTP server
        const server = http.createServer(expressApp);

        // Create Socket.IO server
        const io = new Server(server, {
            cors: {
                origin: process.env.CLIENT_URL || "http://localhost:5173",
                credentials: true
            }
        });

        // Use Redis adapter for scaling
        io.adapter(createAdapter(pubClient, subClient));

        // Socket authentication middleware
        io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth?.token ||
                    socket.handshake.headers.authorization?.replace("Bearer ", "");

                if (!token) {
                    return next(new Error("NO_TOKEN"));
                }

                if (!process.env.JWT_SECRET) {
                    throw new Error("JWT_SECRET not configured");
                }

                const payload = jwt.verify(token, process.env.JWT_SECRET) as any;

                // Verify user exists
                const user = await User.findById(payload.id).select('_id username roles');

                if (!user) {
                    return next(new Error("USER_NOT_FOUND"));
                }

                socket.data.user = {
                    id: user._id.toString(),
                    // Map roles array to a string role if available; fallback to 'user'
                    role: Array.isArray((user as any).roles) && (user as any).roles.length > 0 ? 'user' : 'user',
                    firstName: (user as any).username ?? '',
                    lastName: ''
                } as any;

                return next();
            } catch (err) {
                console.error("Socket auth error:", err);
                return next(new Error("INVALID_TOKEN"));
            }
        });

        // Handle socket connections
        io.on("connection", (socket) => {
            // Import and use socket handler
            import("./services/socket-handler.js").then(mod => mod.default(io, socket));
        });

        // Start server
        const PORT = process.env.PORT || 9000;
        server.listen(PORT, () => {
            console.log(`⚡ Server running on port ${PORT}`);
            console.log(`📡 Socket.IO server ready`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

bootstrap();
