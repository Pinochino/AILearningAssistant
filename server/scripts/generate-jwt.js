import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import fs from 'fs';

// Lấy path tuyệt đối tới project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn tới file .env
const envPath = path.resolve(__dirname, '../.env');

// Kiểm tra xem file .env có tồn tại không
if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found at:', envPath);
    process.exit(1);
}

// Load .env file
const result = dotenv.config({ path: envPath, override: true, encoding: 'utf8' });
if (result.error) {
    console.error('❌ Error loading .env file:', result.error);
    process.exit(1);
}

// Kiểm tra các biến môi trường cần thiết
if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env file');
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined in .env file');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher", "admin"], required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema, 'users');

const generateTokens = async () => {
    try {
        const jwtSecret = process.env.JWT_SECRET;

        let users = await User.find({}).lean();
        let source = 'mongoose:users';

        if (!users || users.length === 0) {
            const db = mongoose.connection.db;
            const collections = await db.listCollections().toArray();
            const candidate = collections.find(c => /users?/i.test(c.name));
            if (!candidate) {
                console.error('No user collection found (looked for /users?/).');
                return;
            }
            const coll = db.collection(candidate.name);
            users = await coll.find({}).toArray();
            source = `native:${candidate.name}`;
        }

        if (!users || users.length === 0) {
            console.error('No users found.');
            return;
        }

        console.error(`✅ Found ${users.length} users from ${source}. Generating tokens...\n`);

        users.forEach((user, idx) => {
            const id = (user._id && user._id.toString) ? user._id.toString() : String(user._id);
            const email = user.email || user.username || user.user || '';
            const role = user.role || 'student';
            const firstName = user.firstName || user.givenName || user.name?.first || '';
            const lastName = user.lastName || user.familyName || user.name?.last || '';

            const token = jwt.sign(
                { id, email, role, firstName, lastName },
                jwtSecret,
                { expiresIn: '24h' }
            );

            // In rõ ràng từng block
            console.log(`--- USER ${idx + 1} ---`);
            console.log(`ID       : ${id}`);
            console.log(`Email    : ${email}`);
            console.log(`Role     : ${role}`);
            console.log(`Name     : ${firstName} ${lastName}`);
            console.log(`Token    : ${token}`);
            console.log(); // dòng trống giữa các user
        });
    } catch (error) {
        console.error('❌ Error generating tokens:', error);
    }
};

const main = async () => {
    await connectDB();
    await generateTokens();
    await mongoose.connection.close();
};

main().catch(console.error);

export { generateTokens };
