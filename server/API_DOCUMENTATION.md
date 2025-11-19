# API Documentation - Class & Subject Management

## Tổng quan
Hệ thống quản lý lớp học và môn học với đầy đủ chức năng CRUD và hệ thống đăng ký chờ duyệt.

## Các tính năng chính

### 1. CRUD Lớp học (Admin/Teacher)
- ✅ Tạo lớp học mới
- ✅ Xem danh sách lớp học (có phân trang và lọc)
- ✅ Xem chi tiết lớp học
- ✅ Cập nhật thông tin lớp học
- ✅ Xóa lớp học (soft delete)

### 2. CRUD Môn học, phân công giáo viên
- ✅ Tạo môn học mới
- ✅ Xem danh sách môn học (có lọc theo khoa, tín chỉ)
- ✅ Xem chi tiết môn học
- ✅ Cập nhật thông tin môn học
- ✅ Xóa môn học (soft delete)
- ✅ Phân công giáo viên cho môn học

### 3. Học sinh đăng ký lớp và chờ duyệt
- ✅ Học sinh xem danh sách lớp có thể đăng ký
- ✅ Học sinh gửi yêu cầu đăng ký lớp
- ✅ Xem trạng thái đăng ký của học sinh
- ✅ Giáo viên xem danh sách yêu cầu đăng ký chờ duyệt
- ✅ Giáo viên duyệt/từ chối yêu cầu đăng ký

## API Endpoints

### Class Management

#### GET /classes
Lấy danh sách lớp học với phân trang và lọc
- **Query params:**
  - `page` (optional): Số trang (default: 1)
  - `limit` (optional): Số lượng mỗi trang (default: 10, max: 100)
  - `subject` (optional): Lọc theo tên môn học
  - `teacherId` (optional): Lọc theo ID giáo viên
  - `dayOfWeek` (optional): Lọc theo ngày trong tuần (0-6)

#### GET /classes/:id
Lấy thông tin chi tiết lớp học theo ID

#### POST /classes
Tạo lớp học mới (Admin/Teacher)
- **Body:**
  ```json
  {
    "name": "string (1-100 chars)",
    "subject": "string",
    "description": "string (optional, max 500 chars)",
    "teacherId": "ObjectId",
    "maxStudents": "number (1-100)",
    "schedule": [
      {
        "dayOfWeek": "number (0-6)",
        "startTime": "string (HH:MM)",
        "endTime": "string (HH:MM)"
      }
    ]
  }
  ```

#### PATCH /classes/:id
Cập nhật thông tin lớp học (Admin/Teacher)
- **Body:** Các trường cần cập nhật (tất cả optional)

#### DELETE /classes/:id
Xóa lớp học (soft delete) (Admin/Teacher)

#### POST /classes/:id/enroll
Đăng ký học sinh trực tiếp vào lớp (Admin/Teacher)
- **Body:**
  ```json
  {
    "studentId": "ObjectId"
  }
  ```

#### DELETE /classes/:id/enroll/:studentId
Hủy đăng ký học sinh khỏi lớp (Admin/Teacher)

### Subject Management

#### GET /subjects
Lấy danh sách môn học với lọc
- **Query params:**
  - `department` (optional): Lọc theo khoa
  - `credits` (optional): Lọc theo số tín chỉ

#### GET /subjects/:id
Lấy thông tin chi tiết môn học theo ID

#### POST /subjects
Tạo môn học mới (Admin/Teacher)
- **Body:**
  ```json
  {
    "name": "string (1-100 chars)",
    "code": "string (1-20 chars, unique)",
    "description": "string (optional, max 1000 chars)",
    "credits": "number (1-10)",
    "department": "string",
    "prerequisites": ["ObjectId"] (optional)
  }
  ```

#### PATCH /subjects/:id
Cập nhật thông tin môn học (Admin/Teacher)

#### DELETE /subjects/:id
Xóa môn học (soft delete) (Admin/Teacher)

#### POST /subjects/:id/assign-teacher
Phân công giáo viên cho môn học (Admin)
- **Body:**
  ```json
  {
    "teacherId": "ObjectId"
  }
  ```

### Enrollment Management (Hệ thống đăng ký chờ duyệt)

#### POST /classes/:id/request-enrollment
Học sinh gửi yêu cầu đăng ký lớp
- **Body:**
  ```json
  {
    "message": "string (optional, max 500 chars)"
  }
  ```

#### GET /classes/:id/pending-enrollments
Giáo viên xem danh sách yêu cầu đăng ký chờ duyệt

#### GET /students/:id/enrollments
Xem danh sách đăng ký của học sinh
- **Query params:**
  - `status` (optional): Lọc theo trạng thái (pending/approved/rejected)

#### POST /enrollments/:id/approve
Giáo viên duyệt yêu cầu đăng ký

#### POST /enrollments/:id/reject
Giáo viên từ chối yêu cầu đăng ký
- **Body:**
  ```json
  {
    "reason": "string (optional, max 500 chars)"
  }
  ```

#### GET /students/:id/available-classes
Học sinh xem danh sách lớp có thể đăng ký
- **Query params:**
  - `page`, `limit`: Phân trang
  - `subject`: Lọc theo môn học
  - `dayOfWeek`: Lọc theo ngày trong tuần

### Teacher Management

#### GET /teachers/:id/classes
Xem danh sách lớp do giáo viên dạy
- **Query params:** Tương tự GET /classes

## Models

### Class
```typescript
{
  _id: ObjectId,
  name: string,
  subject: string,
  description?: string,
  teacherId: ObjectId (ref: User),
  students: ObjectId[] (ref: User),
  schedule: [{
    dayOfWeek: number (0-6),
    startTime: string (HH:MM),
    endTime: string (HH:MM)
  }],
  maxStudents: number (1-100),
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Subject
```typescript
{
  _id: ObjectId,
  name: string,
  code: string (unique),
  description?: string,
  credits: number (1-10),
  department: string,
  teacherId?: ObjectId (ref: User),
  prerequisites: ObjectId[] (ref: Subject),
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### ClassEnrollment
```typescript
{
  _id: ObjectId,
  classId: ObjectId (ref: Class),
  studentId: ObjectId (ref: User),
  status: 'pending' | 'approved' | 'rejected',
  message?: string,
  requestedAt: Date,
  reviewedAt?: Date,
  reviewedBy?: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication & Authorization
- Tất cả endpoints đều yêu cầu authentication
- Một số endpoints yêu cầu authorization (Admin/Teacher roles)
- Student chỉ có thể xem và đăng ký lớp của mình
- Teacher chỉ có thể quản lý lớp của mình
- Admin có quyền quản lý tất cả

## Error Handling
Tất cả API đều trả về format chuẩn:
```json
{
  "success": boolean,
  "message": string,
  "data": any (optional),
  "errors": array (optional, cho validation errors)
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
