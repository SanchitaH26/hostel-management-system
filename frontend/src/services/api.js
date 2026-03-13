import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({ baseURL: BASE_URL });

// ─── Auth ──────────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);

// ─── Complaints (Student) ──────────────────────────────────────────
export const submitComplaint      = (studentId, data) => api.post(`/complaints/${studentId}`, data);
export const getStudentComplaints = (studentId)       => api.get(`/complaints/student/${studentId}`);

// ─── Complaints (Admin) ────────────────────────────────────────────
export const getAllComplaints = ()                         => api.get('/complaints');
export const getStats        = ()                         => api.get('/complaints/stats');
export const updateStatus    = (id, status, remark = '') =>
  api.put(`/complaints/${id}/status?status=${status}&remark=${encodeURIComponent(remark)}`);
export const deleteComplaint = (id)                       => api.delete(`/complaints/${id}`);
export const getByStatus     = (status)                   => api.get(`/complaints/status/${status}`);
