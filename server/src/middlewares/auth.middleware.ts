import { Request, Response, NextFunction, RequestHandler } from "express";
import path from "path";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
        firstName: string;
        lastName: string;
    };
}

export const authMiddleware: RequestHandler = async (req: any, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Expect JWT_SECRET to be loaded at process boot (must match signing key)
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("Auth middleware debug: JWT_SECRET missing in process.env");
            return res.status(500).json({ error: "Server auth config missing" });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, secret) as any;
        } catch (e: any) {
            console.error("Auth middleware verify error:", {
                name: e?.name,
                message: e?.message,
                tokenPreview: token?.slice(0, 16) + "...",
            });
            return res.status(401).json({ error: "Invalid token" });
        }

        // Get user from database (server-1 schema) and derive role name from populated roles
        const populatedUser: any = await User.findById(decoded.id)
            .populate('roles', 'name')
            .select('_id username roles');

        if (!populatedUser) {
            return res.status(401).json({ error: "User not found" });
        }

        // Prefer DB role if present, otherwise fall back to JWT role claim
        let roleNameRaw = Array.isArray(populatedUser.roles) && populatedUser.roles.length > 0
            ? (populatedUser.roles[0]?.name || 'student')
            : (decoded?.role || 'student');

        // Normalize common role variants to canonical lower-case
        const norm = String(roleNameRaw).toLowerCase();
        const map: Record<string, string> = {
            'admin': 'admin', 'administrator': 'admin',
            'teacher': 'teacher', 'instructor': 'teacher',
            'user': 'student'
        };
        const roleName = map[norm] || norm;

        (req as any).user = {
            id: populatedUser._id.toString(),
            role: roleName,
            firstName: populatedUser.username || '',
            lastName: ''
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({ error: "Invalid token" });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const allowed = roles.map(r => String(r).toLowerCase());
        if (!allowed.includes(String(req.user.role).toLowerCase())) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }

        next();
    };
};

export const requireTeacherOrAdmin = requireRole(['teacher', 'admin']);
export const requireAdmin = requireRole(['admin']);
