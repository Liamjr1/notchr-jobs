import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', data),
};

// Jobs
export const jobsAPI = {
  getJobs: (params?: Record<string, string>) =>
    api.get('/jobs', { params }),

  getJobBySlug: (slug: string) =>
    api.get(`/jobs/${slug}`),

  getFeaturedJobs: () =>
    api.get('/jobs/featured'),

  getCategories: () =>
    api.get('/jobs/categories'),

  getEmployerJobs: () =>
    api.get('/jobs/employer'),

  createJob: (data: Record<string, unknown>) =>
    api.post('/jobs', data),

  updateJob: (id: string, data: Record<string, unknown>) =>
    api.patch(`/jobs/${id}`, data),

  deleteJob: (id: string) =>
    api.delete(`/jobs/${id}`),
};

// Applications
export const applicationsAPI = {
  apply: (data: { jobId: string; coverLetter?: string; resumeUrl?: string }) =>
    api.post('/applications', data),

  getMyApplications: (params?: Record<string, string>) =>
    api.get('/applications/my', { params }),

  getJobApplications: (jobId: string) =>
    api.get(`/applications/job/${jobId}`),

  updateStatus: (id: string, data: { status: string; notes?: string; interviewDate?: string }) =>
    api.patch(`/applications/${id}/status`, data),

  withdraw: (id: string) =>
    api.patch(`/applications/${id}/withdraw`),
};

// Users
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),

  updateProfile: (data: Record<string, unknown>) =>
    api.patch('/users/profile', data),

  saveJob: (jobId: string) =>
    api.post(`/users/saved-jobs/${jobId}`),

  getSavedJobs: () =>
    api.get('/users/saved-jobs'),
};

// Companies
export const companiesAPI = {
  getCompanies: (params?: Record<string, string>) =>
    api.get('/companies', { params }),

  getCompanyBySlug: (slug: string) =>
    api.get(`/companies/${slug}`),

  createCompany: (data: Record<string, unknown>) =>
    api.post('/companies', data),

  updateCompany: (id: string, data: Record<string, unknown>) =>
    api.patch(`/companies/${id}`, data),

  getMyCompanies: () =>
    api.get('/companies/my/companies'),
};

export default api;