// Test authentication
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dtumailm_db_user:HhQXlU8VUKU6TRgV@cluster0.tb9bh1l.mongodb.net/ala');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { 
        type: String, 
        enum: ["student", "teacher", "admin"], 
        required: true 
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Test authentication
const testAuth = async () => {
    try {
        const jwtSecret = process.env.JWT_SECRET || '1fec25c76bf1a8d5573eb9b9668276f8';
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2ZmNThlZWIwNWM2ZjdiMDM3NGFiMiIsImVtYWlsIjoic3R1ZGVudDFAYXRpdWkuY29tIiwicm9sZSI6InN0dWRlbnQiLCJmaXJzdE5hbWUiOiJMZSIsImxhc3ROYW1lIjoiVmFuIEMiLCJpYXQiOjE3NTg0NTkyODQsImV4cCI6MTc1ODU0NTY4NH0.l-xRJkDMKgOOftoEQV6zs21UdJ9vEwbNiTgAGkT25J4';
        
        console.log('🔍 Testing JWT token...');
        const decoded = jwt.verify(token, jwtSecret);
        console.log('✅ Token decoded successfully:', { id: decoded.id, email: decoded.email, role: decoded.role });
        
        console.log('🔍 Looking for user in database...');
        const user = await User.findById(decoded.id).select('_id role firstName lastName isActive');
        console.log('✅ User found:', user ? { id: user._id, email: user.email, role: user.role, isActive: user.isActive } : 'null');
        
        if (!user) {
            console.log('❌ User not found!');
            console.log('🔍 Searching by email...');
            const userByEmail = await User.findOne({ email: decoded.email });
            console.log('User by email:', userByEmail ? { id: userByEmail._id, email: userByEmail.email } : 'null');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

// Main function
const main = async () => {
    await connectDB();
    await testAuth();
    await mongoose.connection.close();
    console.log('✅ Test completed!');
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testAuth };