// Check users in database
const mongoose = require('mongoose');

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

// Check users
const checkUsers = async () => {
    try {
        const users = await User.find({});
        console.log('👥 Users in database:');
        console.log('─'.repeat(80));
        
        users.forEach(user => {
            console.log(`ID: ${user._id}`);
            console.log(`Email: ${user.email}`);
            console.log(`Name: ${user.firstName} ${user.lastName}`);
            console.log(`Role: ${user.role}`);
            console.log(`Active: ${user.isActive}`);
            console.log('─'.repeat(80));
        });
        
    } catch (error) {
        console.error('❌ Error checking users:', error);
    }
};

// Main function
const main = async () => {
    await connectDB();
    await checkUsers();
    await mongoose.connection.close();
    console.log('✅ Check completed!');
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { checkUsers };
