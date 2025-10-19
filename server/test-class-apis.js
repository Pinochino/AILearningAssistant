/**
 * Test script for Class & Subject Management APIs
 * Run with: node test-class-apis.js
 */

const BASE_URL = 'http://localhost:3000/api'

// Test data
const testData = {
  teacher: {
    username: 'teacher1',
    email: 'teacher1@example.com',
    password: 'password123'
  },
  student: {
    username: 'student1',
    email: 'student1@example.com',
    password: 'password123'
  },
  subject: {
    name: 'Toán học cao cấp',
    code: 'MATH101',
    description: 'Môn toán học cơ bản',
    credits: 3,
    department: 'Khoa Toán'
  },
  class: {
    name: 'Lớp Toán 101 - Nhóm 1',
    subject: 'Toán học cao cấp',
    description: 'Lớp học toán cơ bản',
    maxStudents: 30,
    schedule: [
      {
        dayOfWeek: 1, // Monday
        startTime: '08:00',
        endTime: '10:00'
      },
      {
        dayOfWeek: 3, // Wednesday
        startTime: '08:00',
        endTime: '10:00'
      }
    ]
  }
}

// Helper function to make HTTP requests
async function makeRequest(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  }
  
  if (token) {
    options.headers.Authorization = `Bearer ${token}`
  }
  
  if (data) {
    options.body = JSON.stringify(data)
  }
  
  try {
    const response = await fetch(url, options)
    const result = await response.json()
    return { status: response.status, data: result }
  } catch (error) {
    console.error(`Error making ${method} request to ${endpoint}:`, error.message)
    return { status: 500, data: { error: error.message } }
  }
}

// Test functions
async function testSubjectCRUD() {
  console.log('\n=== Testing Subject CRUD ===')
  
  // Create subject
  console.log('1. Creating subject...')
  const createResult = await makeRequest('POST', '/subjects', testData.subject)
  console.log('Create subject result:', createResult.status, createResult.data)
  
  if (createResult.status === 201) {
    const subjectId = createResult.data.data._id
    console.log('Subject created with ID:', subjectId)
    
    // Get subject
    console.log('\n2. Getting subject...')
    const getResult = await makeRequest('GET', `/subjects/${subjectId}`)
    console.log('Get subject result:', getResult.status, getResult.data)
    
    // Update subject
    console.log('\n3. Updating subject...')
    const updateResult = await makeRequest('PATCH', `/subjects/${subjectId}`, {
      description: 'Môn toán học cơ bản - đã cập nhật'
    })
    console.log('Update subject result:', updateResult.status, updateResult.data)
    
    return subjectId
  }
  
  return null
}

async function testClassCRUD(teacherId) {
  console.log('\n=== Testing Class CRUD ===')
  
  const classData = {
    ...testData.class,
    teacherId: teacherId
  }
  
  // Create class
  console.log('1. Creating class...')
  const createResult = await makeRequest('POST', '/classes', classData)
  console.log('Create class result:', createResult.status, createResult.data)
  
  if (createResult.status === 201) {
    const classId = createResult.data.data._id
    console.log('Class created with ID:', classId)
    
    // Get class
    console.log('\n2. Getting class...')
    const getResult = await makeRequest('GET', `/classes/${classId}`)
    console.log('Get class result:', getResult.status, getResult.data)
    
    // Update class
    console.log('\n3. Updating class...')
    const updateResult = await makeRequest('PATCH', `/classes/${classId}`, {
      description: 'Lớp học toán cơ bản - đã cập nhật'
    })
    console.log('Update class result:', updateResult.status, updateResult.data)
    
    return classId
  }
  
  return null
}

async function testEnrollmentFlow(classId, studentId) {
  console.log('\n=== Testing Enrollment Flow ===')
  
  // Student requests enrollment
  console.log('1. Student requesting enrollment...')
  const requestResult = await makeRequest('POST', `/classes/${classId}/request-enrollment`, {
    message: 'Tôi muốn đăng ký lớp này để học toán'
  })
  console.log('Request enrollment result:', requestResult.status, requestResult.data)
  
  if (requestResult.status === 201) {
    const enrollmentId = requestResult.data.data._id
    console.log('Enrollment request created with ID:', enrollmentId)
    
    // Get pending enrollments (teacher view)
    console.log('\n2. Getting pending enrollments...')
    const pendingResult = await makeRequest('GET', `/classes/${classId}/pending-enrollments`)
    console.log('Pending enrollments result:', pendingResult.status, pendingResult.data)
    
    // Get student enrollments
    console.log('\n3. Getting student enrollments...')
    const studentEnrollmentsResult = await makeRequest('GET', `/students/${studentId}/enrollments`)
    console.log('Student enrollments result:', studentEnrollmentsResult.status, studentEnrollmentsResult.data)
    
    // Approve enrollment (teacher)
    console.log('\n4. Approving enrollment...')
    const approveResult = await makeRequest('POST', `/enrollments/${enrollmentId}/approve`)
    console.log('Approve enrollment result:', approveResult.status, approveResult.data)
    
    return enrollmentId
  }
  
  return null
}

async function testAvailableClasses(studentId) {
  console.log('\n=== Testing Available Classes ===')
  
  // Get available classes for student
  console.log('1. Getting available classes for student...')
  const availableResult = await makeRequest('GET', `/students/${studentId}/available-classes?page=1&limit=10`)
  console.log('Available classes result:', availableResult.status, availableResult.data)
}

async function testTeacherAssignment(subjectId, teacherId) {
  console.log('\n=== Testing Teacher Assignment ===')
  
  // Assign teacher to subject
  console.log('1. Assigning teacher to subject...')
  const assignResult = await makeRequest('POST', `/subjects/${subjectId}/assign-teacher`, {
    teacherId: teacherId
  })
  console.log('Assign teacher result:', assignResult.status, assignResult.data)
  
  // Get teacher classes
  console.log('\n2. Getting teacher classes...')
  const teacherClassesResult = await makeRequest('GET', `/teachers/${teacherId}/classes`)
  console.log('Teacher classes result:', teacherClassesResult.status, teacherClassesResult.data)
}

// Main test function
async function runTests() {
  console.log('Starting Class & Subject Management API Tests...')
  console.log('Make sure your server is running on http://localhost:3000')
  
  try {
    // Note: In a real test, you would need to:
    // 1. Register/login users to get tokens
    // 2. Use proper authentication headers
    // 3. Handle user creation and role assignment
    
    console.log('\n⚠️  Note: This test script requires:')
    console.log('1. Server running on http://localhost:3000')
    console.log('2. Valid authentication tokens')
    console.log('3. Users with proper roles (Admin/Teacher/Student)')
    console.log('4. Database connection established')
    
    // Mock IDs for testing (replace with real IDs from your database)
    const mockTeacherId = '507f1f77bcf86cd799439011'
    const mockStudentId = '507f1f77bcf86cd799439012'
    
    // Run tests
    const subjectId = await testSubjectCRUD()
    const classId = await testClassCRUD(mockTeacherId)
    
    if (classId) {
      await testEnrollmentFlow(classId, mockStudentId)
    }
    
    await testAvailableClasses(mockStudentId)
    
    if (subjectId) {
      await testTeacherAssignment(subjectId, mockTeacherId)
    }
    
    console.log('\n✅ All tests completed!')
    console.log('\nTo run these tests with real data:')
    console.log('1. Start your server: npm run dev')
    console.log('2. Create users with proper roles')
    console.log('3. Get authentication tokens')
    console.log('4. Update the mock IDs in this script')
    console.log('5. Run: node test-class-apis.js')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests()
}

module.exports = {
  runTests,
  testSubjectCRUD,
  testClassCRUD,
  testEnrollmentFlow,
  testAvailableClasses,
  testTeacherAssignment
}
