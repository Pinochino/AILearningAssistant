import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { create } from "express-handlebars";
// import passport from "./configs/passport";

// Register mongoose models first (must happen before routes/controllers import)
import "./models/announcement.model.js";

// Import routes (these may import controllers that use models)
import messagesRoutes from "./routes/messages.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import announcementsRoutes from "./routes/announcements.routes.js";
import authRouter from "./routers/authRouter";
import userRouter from "./routers/userRouter";

// Import server-1 routes
// import authRouter from "./routers/authRouter";
// import userRouter from "./routers/userRouter";
// import fileRouter from "./routers/fileRouter";
// import emailRouter from "./routers/emailRouter";
// import xlsxRouter from "./routers/xlsxRouter";
// import roleRouter from "./routers/roleRouter";

// ESM-compatible __filename/__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// Handlebars configuration
const hbs = create({
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials')
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = new Set([
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // allow non-browser clients
        if (allowedOrigins.has(origin)) return callback(null, true);
        return callback(new Error(`CORS: Origin not allowed: ${origin}`));
    },
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/preview', express.static(path.join(__dirname, 'public', 'uploads')));

// Cookie parser
app.use(cookieParser());

// Passport initialization (disabled to avoid type issues from external module)
// app.use(passport.initialize());

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "ATIUI Messaging & Notifications Service"
    });
});

// API routes
app.use("/api/messages", messagesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/announcements", announcementsRoutes);

// Server-1 API routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
// app.use("/api/files", fileRouter);
// app.use("/api/email", emailRouter);
// app.use("/api/excel", xlsxRouter);
// app.use("/api/roles", roleRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global error handler:", error);

    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Invalid JSON" });
    }

    res.status(500).json({
        error: "Internal server error",
        ...(process.env.NODE_ENV === "development" && { details: error.message })
    });
});

export default app;
