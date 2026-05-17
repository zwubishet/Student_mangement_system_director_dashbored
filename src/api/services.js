import api from './http.js';
import { resolveApiBaseUrl } from './baseUrl.js';

export const authApi = {
  login: (data) => api.post('/auth/session', data),
};

export const catalogApi = {
  getYears: () => api.get('/catalog/years'),
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

export const studentsApi = {
  stats: () => api.get('/students/stats'),
  list: (params) => api.get('/students', { params }),
  getOne: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.patch(`/students/${id}`, data),
  archive: (id) => api.post(`/students/${id}/archive`),
  restore: (id) => api.post(`/students/${id}/restore`),
  remove: (id) => api.delete(`/students/${id}`),
  bulk: (data) => api.post('/students/bulk', data),
  addNote: (id, data) => api.post(`/students/${id}/notes`, data),
  addGuardian: (id, data) => api.post(`/students/${id}/guardians`, data),
  exportCsv: (params) => api.get('/students/export', { params, responseType: 'blob' }),
  importRows: (rows) => api.post('/students/import', { rows }),
  listTags: () => api.get('/students/tags'),
  createTag: (data) => api.post('/students/tags', data),
  assignTag: (studentId, tagId) => api.post(`/students/${studentId}/tags/${tagId}`),
  removeTag: (studentId, tagId) => api.delete(`/students/${studentId}/tags/${tagId}`),
  addDocument: (id, data) => api.post(`/students/${id}/documents`, data),
};

export const teachersApi = {
  stats: () => api.get('/teachers/stats'),
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
};
