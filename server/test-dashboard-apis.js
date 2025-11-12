/**
 * Test script để verify các API endpoints cho Dashboard
 * Chạy: node test-dashboard-apis.js
 */

const BASE_URL = 'http://localhost:9000/api';

// Test credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const TEACHER_EMAIL = 'teacher1@example.com';
const STUDENT_EMAIL = 'student1@example.com';
const PASSWORD = '123456';

let adminToken = '';
let teacherToken = '';
let studentToken = '';
let teacherId = '';
let studentId = '';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', token = '', body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// Test 1: Login as Admin
async function testAdminLogin() {
  console.log('\n🔐 Test 1: Admin Login');
  const result = await apiCall('/auth/login', 'POST', '', {
    email: ADMIN_EMAIL,
    password: PASSWORD,
  });
  
  if (result.status === 200 && result.data?.data?.accessToken) {
    adminToken = result.data.data.accessToken;
    console.log('✅ Admin login successful');
    return true;
  } else {
    console.log('❌ Admin login failed:', result.data?.message);
    return false;
  }
}

// Test 2: Login as Teacher
async function testTeacherLogin() {
  console.log('\n🔐 Test 2: Teacher Login');
  const result = await apiCall('/auth/login', 'POST', '', {
    email: TEACHER_EMAIL,
    password: PASSWORD,
  });
  
  if (result.status === 200 && result.data?.data?.accessToken) {
    teacherToken = result.data.data.accessToken;
    teacherId = result.data.data.user._id || result.data.data.user.id;
    console.log('✅ Teacher login successful, ID:', teacherId);
    return true;
  } else {
    console.log('❌ Teacher login failed:', result.data?.message);
    return false;
  }
}

// Test 3: Login as Student
async function testStudentLogin() {
  console.log('\n🔐 Test 3: Student Login');
  const result = await apiCall('/auth/login', 'POST', '', {
    email: STUDENT_EMAIL,
    password: PASSWORD,
  });
  
  if (result.status === 200 && result.data?.data?.accessToken) {
    studentToken = result.data.data.accessToken;
    studentId = result.data.data.user._id || result.data.data.user.id;
    console.log('✅ Student login successful, ID:', studentId);
    return true;
  } else {
    console.log('❌ Student login failed:', result.data?.message);
    return false;
  }
}

// Test 4: Get all users (Admin Dashboard)
async function testGetAllUsers() {
  console.log('\n📊 Test 4: Get All Users (Admin Dashboard)');
  const result = await apiCall('/users/list', 'GET', adminToken);
  
  if (result.status === 200 && result.data?.data) {
    const users = Array.isArray(result.data.data) ? result.data.data : [];
    console.log(`✅ Found ${users.length} users`);
    
    // Count by role
    const students = users.filter(u => {
      const roles = u.roles || [];
      return roles.some(r => {
        const name = typeof r === 'string' ? r : r?.name;
        return name?.toLowerCase() === 'student';
      });
    });
    
    const teachers = users.filter(u => {
      const roles = u.roles || [];
      return roles.some(r => {
        const name = typeof r === 'string' ? r : r?.name;
        return name?.toLowerCase() === 'teacher';
      });
    });
    
    const admins = users.filter(u => {
      const roles = u.roles || [];
      return roles.some(r => {
        const name = typeof r === 'string' ? r : r?.name;
        return name?.toLowerCase().includes('admin');
      });
    });
    
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Teachers: ${teachers.length}`);
    console.log(`   - Admins: ${admins.length}`);
    return true;
  } else {
    console.log('❌ Get users failed:', result.data?.message);
    return false;
  }
}

// Test 5: Get all classes (Admin Dashboard)
async function testGetAllClasses() {
  console.log('\n📚 Test 5: Get All Classes (Admin Dashboard)');
  const result = await apiCall('/classes', 'GET', adminToken);
  
  if (result.status === 200 && result.data?.data) {
    const classes = result.data.data.classes || [];
    console.log(`✅ Found ${classes.length} classes`);
    if (classes.length > 0) {
      console.log(`   Example: ${classes[0].name} (${classes[0].enrolledCount || 0} students)`);
    }
    return true;
  } else {
    console.log('❌ Get classes failed:', result.data?.message);
    return false;
  }
}

// Test 6: Get all subjects (Admin Dashboard)
async function testGetAllSubjects() {
  console.log('\n📖 Test 6: Get All Subjects (Admin Dashboard)');
  const result = await apiCall('/subjects', 'GET', adminToken);
  
  if (result.status === 200 && result.data?.data) {
    const subjects = Array.isArray(result.data.data) ? result.data.data : [];
    console.log(`✅ Found ${subjects.length} subjects`);
    if (subjects.length > 0) {
      console.log(`   Example: ${subjects[0].name} (${subjects[0].code})`);
    }
    return true;
  } else {
    console.log('❌ Get subjects failed:', result.data?.message);
    return false;
  }
}

// Test 7: Get teacher's classes (Teacher Dashboard)
async function testGetTeacherClasses() {
  console.log('\n👨‍🏫 Test 7: Get Teacher Classes (Teacher Dashboard)');
  const result = await apiCall(`/teachers/${teacherId}/classes`, 'GET', teacherToken);
  
  if (result.status === 200 && result.data?.data) {
    const classes = result.data.data.classes || [];
    console.log(`✅ Teacher has ${classes.length} classes`);
    classes.forEach(c => {
      console.log(`   - ${c.name}: ${c.enrolledCount || 0} students`);
    });
    return true;
  } else {
    console.log('❌ Get teacher classes failed:', result.data?.message);
    return false;
  }
}

// Test 8: Get student's enrollments (Student Dashboard)
async function testGetStudentEnrollments() {
  console.log('\n👨‍🎓 Test 8: Get Student Enrollments (Student Dashboard)');
  const result = await apiCall(`/students/${studentId}/enrollments?status=approved`, 'GET', studentToken);
  
  if (result.status === 200 && result.data?.data) {
    const enrollments = Array.isArray(result.data.data) ? result.data.data : [];
    console.log(`✅ Student has ${enrollments.length} enrollments`);
    enrollments.forEach(e => {
      const className = e.classId?.name || 'Unknown';
      console.log(`   - ${className}`);
    });
    return true;
  } else {
    console.log('❌ Get student enrollments failed:', result.data?.message);
    return false;
  }
}

// Test 9: Count users by role (New API)
async function testCountByRole() {
  console.log('\n🔢 Test 9: Count Users by Role (New API)');
  
  const roles = ['STUDENT', 'TEACHER', 'ADMIN'];
  for (const role of roles) {
    const result = await apiCall(`/users/count-by-role/${role}`, 'GET', adminToken);
    if (result.status === 200 && result.data?.data) {
      console.log(`✅ ${role}: ${result.data.data.count} users`);
    } else {
      console.log(`❌ Count ${role} failed:`, result.data?.message);
    }
  }
  return true;
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Dashboard API Tests...\n');
  console.log('=' .repeat(60));
  
  try {
    // Login tests
    await testAdminLogin();
    await testTeacherLogin();
    await testStudentLogin();
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 ADMIN DASHBOARD TESTS');
    console.log('=' .repeat(60));
    
    // Admin dashboard tests
    await testGetAllUsers();
    await testGetAllClasses();
    await testGetAllSubjects();
    await testCountByRole();
    
    console.log('\n' + '=' .repeat(60));
    console.log('👨‍🏫 TEACHER DASHBOARD TESTS');
    console.log('=' .repeat(60));
    
    // Teacher dashboard tests
    await testGetTeacherClasses();
    
    console.log('\n' + '=' .repeat(60));
    console.log('👨‍🎓 STUDENT DASHBOARD TESTS');
    console.log('=' .repeat(60));
    
    // Student dashboard tests
    await testGetStudentEnrollments();
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ All tests completed!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run tests
runAllTests();
