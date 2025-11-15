// Test script to verify new API endpoints
const axios = require('axios');

const baseURL = 'http://localhost:9000/api';

// Test token (you'll need to replace this with a valid token)
const testToken = 'your-test-token-here';

const testEndpoints = async () => {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test materials endpoint
    console.log('1. Testing GET /api/materials');
    try {
      const materialsResponse = await axios.get(`${baseURL}/materials`, {
        headers: {
          'Authorization': `Bearer ${testToken}`
        }
      });
      console.log('✅ Materials endpoint works');
      console.log('Response:', materialsResponse.data);
    } catch (error) {
      console.log('❌ Materials endpoint failed');
      console.log('Error:', error.response?.data || error.message);
    }
    
    console.log('\n');
    
    // Test quizzes endpoint
    console.log('2. Testing GET /api/quizzes');
    try {
      const quizzesResponse = await axios.get(`${baseURL}/quizzes`, {
        headers: {
          'Authorization': `Bearer ${testToken}`
        }
      });
      console.log('✅ Quizzes endpoint works');
      console.log('Response:', quizzesResponse.data);
    } catch (error) {
      console.log('❌ Quizzes endpoint failed');
      console.log('Error:', error.response?.data || error.message);
    }
    
    console.log('\n');
    
    // Test flashcard sets endpoint
    console.log('3. Testing GET /api/flashcard-sets');
    try {
      const flashcardsResponse = await axios.get(`${baseURL}/flashcard-sets`, {
        headers: {
          'Authorization': `Bearer ${testToken}`
        }
      });
      console.log('✅ Flashcard sets endpoint works');
      console.log('Response:', flashcardsResponse.data);
    } catch (error) {
      console.log('❌ Flashcard sets endpoint failed');
      console.log('Error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Test script error:', error.message);
  }
};

// Instructions
console.log('To run this test:');
console.log('1. Make sure your server is running on port 9000');
console.log('2. Replace testToken with a valid JWT token from your application');
console.log('3. Run: node test-api.js');
console.log('\n');

testEndpoints();
