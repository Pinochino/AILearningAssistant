// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Helper function to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============ TYPES ============

export interface ClassSchedule {
  dayOfWeek: number; // 0-6
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

export interface UserBasicInfo {
  _id: string;
  username: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Class {
  _id: string;
  name: string;
  subject: string;
  grade?: string; // Lớp/Ngành - có thể để trống
  teacherId: string | UserBasicInfo; // Can be string ID or populated user object
  studentIds: string[];
  students?: Array<{
    _id: string;
    username: string;
    fullName?: string;
    name?: string;
    email?: string;
    studentId?: string;
  }>;
  enrollments?: Array<{
    _id: string;
    studentId: string | UserBasicInfo;
    status: 'pending' | 'approved' | 'rejected';
    message?: string;
    requestedAt: string;
  }>;
  maxStudents: number;
  schedule: ClassSchedule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  department: string;
  teacherId?: string;
  prerequisites?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassEnrollment {
  _id: string;
  classId: string;
  studentId: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

// Helper function to handle API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; message?: string }> {
  const token = localStorage.getItem('accessToken');

  console.log('API Request:', {
    endpoint,
    method: options.method || 'GET',
    hasToken: !!token,
    token: token ? `${token.substring(0, 20)}...` : 'No token'
  });

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    console.log('API Response:', {
      endpoint,
      status: response.status,
      ok: response.ok,
      data
    });

    if (!response.ok) {
      // Log detailed error for debugging
      console.error('API Error Details:', {
        status: response.status,
        message: data.message,
        errors: data.errors,
        error: data.error
      });
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }

    // Backend returns { success: true, data: {...} }
    if (data.success === false) {
      throw new Error(data.message || 'Server error');
    }

    return data;
  } catch (error) {
    console.error('API Request Failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
}

// Subject API
export const subjectApi = {
  async getAll(params?: { department?: string; credits?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.department) queryParams.append('department', params.department);
    if (params?.credits) queryParams.append('credits', params.credits.toString());

    const query = queryParams.toString();
    return apiRequest<Subject[]>(`/subjects${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return apiRequest<Subject>(`/subjects/${id}`);
  },

  async create(data: Omit<Subject, '_id' | 'createdAt' | 'updatedAt'>) {
    return apiRequest<Subject>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Subject>) {
    return apiRequest<Subject>(`/subjects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiRequest<void>(`/subjects/${id}`, {
      method: 'DELETE',
    });
  },

  async assignTeacher(id: string, teacherId: string) {
    return apiRequest<Subject>(`/subjects/${id}/assign-teacher`, {
      method: 'POST',
      body: JSON.stringify({ teacherId }),
    });
  },
};

// Class API
export const classApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    subject?: string;
    teacherId?: string;
    dayOfWeek?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.subject) queryParams.append('subject', params.subject);
    if (params?.teacherId) queryParams.append('teacherId', params.teacherId);
    if (params?.dayOfWeek !== undefined) queryParams.append('dayOfWeek', params.dayOfWeek.toString());

    // Add populate parameter to get teacher details
    queryParams.append('populate', 'teacherId');

    const query = queryParams.toString();
    return apiRequest<PaginatedResponse<Class>>(`/classes${query ? `?${query}` : ''}`);
  },

  async getById(id: string, params?: { populate?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.populate) {
      queryParams.append('populate', params.populate);
    }
    const query = queryParams.toString();
    return apiRequest<Class>(`/classes/${id}${query ? `?${query}` : ''}`);
  },

  async create(data: Omit<Class, '_id' | 'createdAt' | 'updatedAt'>) {
    return apiRequest<Class>('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async approveEnrollment(enrollmentId: string) {
    return apiRequest<{ success: boolean; message?: string }>(
      `/enrollments/${enrollmentId}/approve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  },
  async update(id: string, data: Partial<Class>) {
    return apiRequest<Class>(`/classes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiRequest<void>(`/classes/${id}`, {
      method: 'DELETE',
    });
  },

  async enrollStudent(classId: string, studentId: string) {
    return apiRequest<Class>(`/classes/${classId}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  },

  async unenrollStudent(classId: string, studentId: string) {
    return apiRequest<void>(`/classes/${classId}/enroll/${studentId}`, {
      method: 'DELETE',
    });
  },

  async requestEnrollment(classId: string, message?: string) {
    return apiRequest<ClassEnrollment>(`/classes/${classId}/request-enrollment`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  async getPendingEnrollments(classId: string) {
    console.log('Fetching pending enrollments for class:', classId);
    const token = localStorage.getItem('accessToken');
    console.log('Current token:', token ? `${token.substring(0, 20)}...` : 'No token found');

    return apiRequest<ClassEnrollment[]>(`/classes/${classId}/pending-enrollments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
};

// Enrollment API
export const enrollmentApi = {
  async getStudentEnrollments(studentId: string, status?: 'pending' | 'approved' | 'rejected') {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);

    const query = queryParams.toString();
    return apiRequest<ClassEnrollment[]>(`/students/${studentId}/enrollments${query ? `?${query}` : ''}`);
  },

  async approve(enrollmentId: string) {
    return apiRequest<ClassEnrollment>(`/enrollments/${enrollmentId}/approve`, {
      method: 'POST',
    });
  },

  async reject(enrollmentId: string, reason?: string) {
    return apiRequest<ClassEnrollment>(`/enrollments/${enrollmentId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async getAvailableClasses(studentId: string, params?: {
    page?: number;
    limit?: number;
    subject?: string;
    dayOfWeek?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.subject) queryParams.append('subject', params.subject);
    if (params?.dayOfWeek !== undefined) queryParams.append('dayOfWeek', params.dayOfWeek.toString());

    const query = queryParams.toString();
    return apiRequest<PaginatedResponse<Class>>(`/students/${studentId}/available-classes${query ? `?${query}` : ''}`);
  },
};

// Student API
export const studentApi = {
  async getEnrolledClasses(studentId: string) {
    return apiRequest<ClassEnrollment[]>(
      `/students/${studentId}/enrollments?status=approved`,
      { method: 'GET' }
    );
  },

  async getClassSchedule(studentId: string) {
    return apiRequest<{ classes: Class[] }>(
      `/students/${studentId}/schedule`,
      { method: 'GET' }
    );
  },

  async getUpcomingAssignments(studentId: string) {
    return apiRequest<Array<{
      _id: string;
      title: string;
      dueDate: string;
      classId: string;
      status: 'pending' | 'submitted' | 'late' | 'graded';
    }>>(
      `/students/${studentId}/assignments/upcoming`,
      { method: 'GET' }
    );
  },
};

// User API
export const userApi = {
  getById: async (id: string) => {
    return apiRequest<UserBasicInfo>(`/users/detail/${id}`);
  },
  search: async (query: string) => {
    return apiRequest<UserBasicInfo[]>(`/users/search?q=${encodeURIComponent(query)}`);
  },
  updateProfile: async (userId: string, data: Partial<UserBasicInfo>) => {
    return apiRequest<UserBasicInfo>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  getCurrentUser: async () => {
    return apiRequest<UserBasicInfo>('/users/me');
  }
};

// Teacher API
export const teacherApi = {
  async getClasses(teacherId: string, params?: {
    page?: number;
    limit?: number;
    subject?: string;
    dayOfWeek?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.subject) queryParams.append('subject', params.subject);
    if (params?.dayOfWeek !== undefined) queryParams.append('dayOfWeek', params.dayOfWeek.toString());

    const query = queryParams.toString();
    return apiRequest<PaginatedResponse<Class>>(`/teachers/${teacherId}/classes${query ? `?${query}` : ''}`);
  },
};