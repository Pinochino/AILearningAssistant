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
  maxStudents: number;
  schedule: ClassSchedule[];
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

  async getById(id: string) {
    return apiRequest<Class>(`/classes/${id}`);
  },

  async create(data: Omit<Class, '_id' | 'createdAt' | 'updatedAt'>) {
    return apiRequest<Class>('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
    return apiRequest<ClassEnrollment[]>(`/classes/${classId}/pending-enrollments`);
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