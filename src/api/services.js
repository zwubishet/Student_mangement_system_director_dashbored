import api from './http.js';
import { resolveApiBaseUrl } from './baseUrl.js';

export const authApi = {
  login: (data) => api.post('/auth/session', data),
};

export const catalogApi = {
  getYears: (params) => api.get('/catalog/years', { params }),
  createYear: (data) => api.post('/catalog/years', data),
  createTerm: (data) => api.post('/catalog/terms', data),
  getTerms: (academicYearId) => api.get('/catalog/terms', { params: { academic_year_id: academicYearId } }),
  getGrades: () => api.get('/catalog/grades'),
  getSections: (gradeId) => api.get('/catalog/sections', { params: { grade_id: gradeId } }),
  getSubjects: () => api.get('/catalog/subjects'),
  getClasses: (academicYearId) => api.get('/catalog/classes', { params: { academic_year_id: academicYearId } }),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
};

export const filesApi = {
  presign: (data) => api.post('/files/presign', data),
  complete: (data) => api.post('/files/complete', data),
  list: () => api.get('/files'),
};

export const parentsApi = {
  list: (params) => api.get('/parents', { params }),
  register: (data) => api.post('/parents/register', data),
  byStudent: (studentId) => api.get(`/parents/by-student/${studentId}`),
};

export const studentsApi = {
  stats: () => api.get('/students/stats'),
  list: (params) => api.get('/students', { params }),
  getOne: (id) => api.get(`/students/${id}`),
  analytics: (id) => api.get(`/students/${id}/analytics`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.patch(`/students/${id}`, data),
  archive: (id) => api.post(`/students/${id}/archive`),
  restore: (id) => api.post(`/students/${id}/restore`),
  remove: (id) => api.delete(`/students/${id}`),
  bulk: (data) => api.post('/students/bulk', data),
  addNote: (id, data) => api.post(`/students/${id}/notes`, data),
  addGuardian: (id, data) => api.post(`/students/${id}/guardians`, data),
  updateGuardian: (id, guardianId, data) => api.patch(`/students/${id}/guardians/${guardianId}`, data),
  deleteGuardian: (id, guardianId) => api.delete(`/students/${id}/guardians/${guardianId}`),
  transfer: (id, data) => api.post(`/students/${id}/enrollment/transfer`, data),
  promote: (id, data) => api.post(`/students/${id}/enrollment/promote`, data),
  withdraw: (id, data) => api.post(`/students/${id}/enrollment/withdraw`, data),
  exportCsv: (params) => api.get('/students/export', { params, responseType: 'blob' }),
  exportIdCard: (id) => api.get(`/students/${id}/export/id-card`, { responseType: 'blob' }),
  exportProfile: (id) => api.get(`/students/${id}/export/profile`, { responseType: 'blob' }),
  importRows: (rows) => api.post('/students/import', { rows }),
  listTags: () => api.get('/students/tags'),
  createTag: (data) => api.post('/students/tags', data),
  assignTag: (studentId, tagId) => api.post(`/students/${studentId}/tags/${tagId}`),
  removeTag: (studentId, tagId) => api.delete(`/students/${studentId}/tags/${tagId}`),
  addDocument: (id, data) => api.post(`/students/${id}/documents`, data),
  getMedical: (id) => api.get(`/students/${id}/medical`),
  updateMedical: (id, data) => api.put(`/students/${id}/medical`, data),
};

export const teachersApi = {
  stats: () => api.get('/teachers/stats'),
  departments: () => api.get('/teachers/departments'),
  list: (params) => api.get('/teachers', { params }),
  getOne: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.patch(`/teachers/${id}`, data),
  archive: (id) => api.post(`/teachers/${id}/archive`),
  restore: (id) => api.post(`/teachers/${id}/restore`),
  remove: (id) => api.delete(`/teachers/${id}`),
  bulk: (data) => api.post('/teachers/bulk', data),
  addNote: (id, data) => api.post(`/teachers/${id}/notes`, data),
  addQualification: (id, data) => api.post(`/teachers/${id}/qualifications`, data),
  addDocument: (id, data) => api.post(`/teachers/${id}/documents`, data),
  setAvailability: (id, slots) => api.put(`/teachers/${id}/availability`, { slots }),
  exportCsv: (params) => api.get('/teachers/export', { params, responseType: 'blob' }),
  importRows: (rows) => api.post('/teachers/import', { rows }),
};

export const teacherPortalApi = {
  dashboard: () => api.get('/teacher-portal/dashboard'),
  getClasses: () => api.get('/teacher-portal/classes'),
  getClass: (sectionId) => api.get(`/teacher-portal/classes/${sectionId}`),
  getStudents: (params) => api.get('/teacher-portal/students', { params }),
  getStudent: (studentId) => api.get(`/teacher-portal/students/${studentId}`),
  getAttendance: (sectionId, date) => api.get(`/teacher-portal/sections/${sectionId}/attendance`, { params: { date } }),
  markAttendance: (sectionId, data) => api.post(`/teacher-portal/sections/${sectionId}/attendance`, data),
};

export const classesApi = {
  list: (params) => api.get('/classes', { params }),
  getOne: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  assignTeacher: (sectionId, payload) =>
    api.post(`/classes/sections/${sectionId}/assign-teacher`, payload),
};

export const examsApi = {
  list: (params) => api.get('/exams', { params }),
  getOne: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  getResults: (id, params) => api.get(`/exams/${id}/results`, { params }),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.patch('/settings', data),
  listGradeScales: () => api.get('/settings/grade-scales'),
  createGradeScale: (data) => api.post('/settings/grade-scales', data),
  deleteGradeScale: (id) => api.delete(`/settings/grade-scales/${id}`),
  listUsers: (params) => api.get('/settings/users', { params }),
  toggleUserStatus: (id) => api.patch(`/settings/users/${id}/toggle-status`),
  listPdfTemplates: () => api.get('/settings/pdf-templates'),
  upsertPdfTemplate: (key, data) => api.put(`/settings/pdf-templates/${key}`, data),
};

export const notificationsApi = {
  list: (params) => api.get('/notifications', { params }),
  sendSms: (data) => api.post('/notifications/sms', data),
  processQueue: (limit = 50) => api.post('/notifications/process', { limit }),
  notifyGuardians: (studentId, message) =>
    api.post(`/notifications/students/${studentId}/notify-guardians`, { message }),
};

export const parentPortalApi = {
  dashboard: () => api.get('/parent-portal/dashboard'),
  childDetail: (studentId) => api.get(`/parent-portal/children/${studentId}`),
};
