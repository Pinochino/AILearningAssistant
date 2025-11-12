const mongoose = require('mongoose');
require('dotenv').config();

async function listTeachers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    
    const User = mongoose.model('User', new mongoose.Schema({}), 'users');
    
    // Find all teachers (trying different role formats)
    const teachers = await User.find({
      $or: [
        { 'roles': 'teacher' },
        { 'roles': { $in: ['teacher'] } },
        { 'role': 'teacher' },
        { 'roles.0.name': 'teacher' },
        { 'roles.0': 'teacher' }
      ]
    }, 'name username email _id roles');

    console.log('Found teachers:', JSON.stringify(teachers, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listTeachers();
