// JWT Token Generator for Testing
// Run with: node scripts/generate-jwt.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// User Schema (simplified)
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
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Generate JWT tokens
const generateTokens = async () => {
    try {
        // Use the actual User model from the app
        const UserModel = mongoose.model('User');
        const RoleModel = mongoose.model('Role');
        
        const users = await UserModel.find({}).populate('roles');
        const jwtSecret = process.env.JWT_ACCESS_KEY;
        
        console.log('🔑 Generating JWT tokens for testing...\n');
        
        if (users.length === 0) {
            console.log('❌ No users found in database');
            return;
        }
        
        for (const user of users) {
            // Get role names
            let roleNames = [];
            if (user.roles && user.roles.length > 0) {
                roleNames = user.roles.map(role => role.name);
            }
            
            const token = jwt.sign(
                {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                    roles: roleNames
                },
                jwtSecret,
                { expiresIn: '24h' }
            );
            
            console.log(`👤 USER: ${user.username || 'N/A'}`);
            console.log(`📧 Email: ${user.email}`);
            console.log(`🆔 ID: ${user._id.toString()}`);
            console.log(`🎭 Roles: ${roleNames.join(', ') || 'No roles'}`);
            console.log(`🔑 Token: ${token}`);
            console.log('─'.repeat(80));
        }
        
        console.log('\n📋 How to use:')
        console.log('1. Copy the token above');
        console.log('2. Open browser console (F12)');
        console.log('3. Run: localStorage.clear();');
        console.log('4. Run: localStorage.setItem("accessToken", "YOUR_TOKEN");');
        console.log('5. Run: location.reload();');
        console.log('\nOr use one-liner:')
        console.log('localStorage.clear();localStorage.setItem("accessToken","YOUR_TOKEN");location.reload();');
        
    } catch (error) {
        console.error('❌ Error generating tokens:', error);
    }
};

// Main function
const main = async () => {
    await connectDB();
    await generateTokens();
    await mongoose.connection.close();
    console.log('\n✅ Token generation completed!');
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { generateTokens };