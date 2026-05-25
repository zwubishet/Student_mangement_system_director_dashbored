import api from './http.js';
import { resolveApiBaseUrl } from './baseUrl.js';

export const authApi = {
  login: (data) => api.post('/auth/session', data),
};

export const catalogApi = {
  getOverview: () => api.get('/catalog/overview'),
  getYears: (params) => api.get('/catalog/years', { params }),
  getCurrentYear: () => api.get('/catalog/years/current'),
  createYear: (data) => api.post('/catalog/years', data),
  updateYear: (id, data) => api.patch(`/catalog/years/${id}`, data),
  setCurrentYear: (id) => api.post(`/catalog/years/${id}/set-current`),
  deleteYear: (id) => api.delete(`/catalog/years/${id}`),
  getTerms: (academicYearId) => api.get('/catalog/terms', { params: { academic_year_id: academicYearId } }),
  getTerm: (id) => api.get(`/catalog/terms/${id}`),
  createTerm: (data) => api.post('/catalog/terms', data),
  updateTerm: (id, data) => api.patch(`/catalog/terms/${id}`, data),
  setCurrentTerm: (id) => api.post(`/catalog/terms/${id}/set-current`),
  deleteTerm: (id) => api.delete(`/catalog/terms/${id}`),
  getGrades: () => api.get('/catalog/grades'),
  createGrade: (data) => api.post('/catalog/grades', data),
  updateGrade: (id, data) => api.patch(`/catalog/grades/${id}`, data),
  deleteGrade: (id) => api.delete(`/catalog/grades/${id}`),
  getSections: (gradeId, params = {}) => api.get('/catalog/sections', { params: { grade_id: gradeId, ...params } }),
  getSection: (id) => api.get(`/catalog/sections/${id}`),
  createSection: (data) => api.post('/catalog/sections', data),
  updateSection: (id, data) => api.patch(`/catalog/sections/${id}`, data),
  deleteSection: (id) => api.delete(`/catalog/sections/${id}`),
  getSubjects: (params) => api.get('/catalog/subjects', { params }),
  createSubject: (data) => api.post('/catalog/subjects', data),
  updateSubject: (id, data) => api.patch(`/catalog/subjects/${id}`, data),
  deleteSubject: (id, { force } = {}) => api.delete(`/catalog/subjects/${id}`, { params: force ? { force: 'true' } : {} }),
  getClasses: (academicYearId) => api.get('/catalog/classes', { params: { academic_year_id: academicYearId } }),
  getClassSubjects: (classId) => api.get(`/catalog/classes/${classId}/subjects`),
  addClassSubject: (data) => api.post('/catalog/class-subjects', data),
  bulkClassSubjects: (data) => api.post('/catalog/class-subjects/bulk', data),
  updateClassSubject: (linkId, data) => api.patch(`/catalog/class-subjects/${linkId}`, data),
  removeClassSubject: (linkId) => api.delete(`/catalog/class-subjects/${linkId}`),
  getTimetable: (params) => api.get('/catalog/timetable', {
    params: typeof params === 'string' || !params ? { class_id: params } : params,
  }),
  addTimetableSlot: (data) => api.post('/catalog/timetable', data),
  deleteTimetableSlot: (id) => api.delete(`/catalog/timetable/${id}`),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
};

export const filesApi = {
  presign: (data) => api.post('/files/presign', data),
  uploadLocal: (data) => api.post('/files/upload-local', data),
  complete: (data) => api.post('/files/complete', data),
  list: (params) => api.get('/files', { params }),
  remove: (id) => api.delete(`/files/${id}`),
};

export const parentsApi = {
  list: (params) => api.get('/parents', { params }),
  search: (q) => api.get('/parents/search', { params: { q } }),
  searchStudents: (q) => api.get('/parents/search-students', { params: { q } }),
  register: (data) => api.post('/parents/register', data),
  linkStudents: (parentId, studentIds) => api.post(`/parents/${parentId}/link-students`, { student_ids: studentIds }),
  byStudent: (studentId) => api.get(`/parents/by-student/${studentId}`),
  getOne: (id) => api.get(`/parents/${id}`),
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
  expiringLicences: (days = 90) => api.get('/teachers/licences/expiring', { params: { days } }),
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
  listContracts: (id) => api.get(`/teachers/${id}/contracts`),
  addContract: (id, data) => api.post(`/teachers/${id}/contracts`, data),
  listLeave: (id) => api.get(`/teachers/${id}/leave`),
  addLeave: (id, data) => api.post(`/teachers/${id}/leave`, data),
  updateLeave: (id, leaveId, data) => api.patch(`/teachers/${id}/leave/${leaveId}`, data),
  listAppraisals: (id) => api.get(`/teachers/${id}/appraisals`),
  addAppraisal: (id, data) => api.post(`/teachers/${id}/appraisals`, data),
  listCpd: (id) => api.get(`/teachers/${id}/cpd`),
  addCpd: (id, data) => api.post(`/teachers/${id}/cpd`, data),
  verifyCpd: (id, cpdId) => api.post(`/teachers/${id}/cpd/${cpdId}/verify`),
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
  listExams: (params) => api.get('/teacher-portal/exams', { params }),
  getMarkSheet: (examId, scheduleId) =>
    api.get(`/teacher-portal/exams/${examId}/schedules/${scheduleId}/marks`),
  saveMarks: (examId, scheduleId, data) =>
    api.post(`/teacher-portal/exams/${examId}/schedules/${scheduleId}/marks`, data),
  submitMarks: (examId, scheduleId) =>
    api.post(`/teacher-portal/exams/${examId}/schedules/${scheduleId}/submit`),
  getNotifications: () => api.get('/teacher-portal/notifications'),
  getMe: () => api.get('/teacher-portal/me'),
  getTimetable: () => api.get('/teacher-portal/timetable'),
  exportRoster: (sectionId) =>
    api.get(`/teacher-portal/sections/${sectionId}/roster/export`, { responseType: 'blob' }),
  getClassReport: (sectionId, params) =>
    api.get(`/teacher-portal/sections/${sectionId}/report-preview`, { params }),
  getGuardianDirectory: (sectionId) =>
    api.get(`/teacher-portal/sections/${sectionId}/guardians`),
};

export const classesApi = {
  list: (params) => api.get('/classes', { params }),
  getOne: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  assignTeacher: (sectionId, payload) =>
    api.post(`/classes/sections/${sectionId}/assign-teacher`, payload),
};

export const gradingApi = {
  getActiveScale: () => api.get('/grading/grading-scales/active'),
  listScaleProfiles: () => api.get('/grading/grading-scales/profiles'),
  createScaleProfile: (data) => api.post('/grading/grading-scales', data),
  activateScale: (id) => api.put(`/grading/grading-scales/${id}/activate`),
  previewGrade: (score, maxScore = 100) =>
    api.get('/grading/grading-scales/preview', { params: { score, max_score: maxScore } }),
  listExamTypes: () => api.get('/grading/exam-types'),
  getTermWeights: (termId, subjectId) =>
    api.get(`/grading/terms/${termId}/assessment-weights`, {
      params: subjectId ? { subject_id: subjectId } : {},
    }),
  setTermWeights: (termId, data) => api.put(`/grading/terms/${termId}/assessment-weights`, data),
  checkScheduleConflicts: (params) => api.get('/grading/exam-schedules/conflicts', { params }),
  markReviewOverview: (examId) => api.get(`/grading/mark-review/exam/${examId}`),
  markReviewReadiness: (examId) => api.get(`/grading/mark-review/exam/${examId}/readiness`),
  lockExamMarks: (examId) => api.post(`/grading/mark-review/exam/${examId}/lock-all`),
  submitMarksGroup: (examId, scheduleId) =>
    api.post(`/grading/mark-review/exam/${examId}/schedules/${scheduleId}/submit`),
  verifyMarksGroup: (examId, scheduleId) =>
    api.post(`/grading/mark-review/exam/${examId}/schedules/${scheduleId}/verify`),
  rejectMarksGroup: (examId, scheduleId, reason) =>
    api.post(`/grading/mark-review/exam/${examId}/schedules/${scheduleId}/reject`, { reason }),
  markEntryProgress: (examId, scheduleId) =>
    api.get(`/grading/mark-entry/exam/${examId}/schedules/${scheduleId}/progress`),
  bulkPreview: (examId, scheduleId, csv) =>
    api.post(`/grading/mark-entry/exam/${examId}/schedules/${scheduleId}/bulk-preview`, { csv }),
  bulkCommit: (examId, scheduleId, csv) =>
    api.post(`/grading/mark-entry/exam/${examId}/schedules/${scheduleId}/bulk-commit`, { csv }),
  listComputedResults: (examId, params) => api.get(`/grading/results/exam/${examId}`, { params }),
  processComputation: () => api.post('/grading/computation-runs/process'),
  computeTerm: (termId) => api.post(`/grading/terms/${termId}/compute`),
  getComputationRun: (runId) => api.get(`/grading/computation-runs/${runId}`),
  downloadReportCard: (studentId, params) =>
    api.get(`/grading/report-card/student/${studentId}`, { params, responseType: 'blob' }),
};

export const examsApi = {
  getOverview: () => api.get('/exams/overview'),
  list: (params) => api.get('/exams', { params }),
  getOne: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.patch(`/exams/${id}`, data),
  remove: (id) => api.delete(`/exams/${id}`),
  listSchedules: (id) => api.get(`/exams/${id}/schedules`),
  addSchedule: (id, data) => api.post(`/exams/${id}/schedules`, data),
  updateSchedule: (id, scheduleId, data) => api.patch(`/exams/${id}/schedules/${scheduleId}`, data),
  deleteSchedule: (id, scheduleId) => api.delete(`/exams/${id}/schedules/${scheduleId}`),
  getMarkSheet: (id, scheduleId) => api.get(`/exams/${id}/schedules/${scheduleId}/marks`),
  submitMarks: (id, scheduleId, data) => api.post(`/exams/${id}/schedules/${scheduleId}/marks`, data),
  verifyMarks: (id, scheduleId) => api.post(`/exams/${id}/schedules/${scheduleId}/verify`),
  getResults: (id, params) => api.get(`/exams/${id}/results`, { params }),
  calculateTermResults: (termId) => api.post(`/exams/terms/${termId}/calculate-results`),
  listGradingScales: (params) => api.get('/exams/grading-scales', { params }),
  upsertGradingScale: (data) => api.post('/exams/grading-scales', data),
  deleteGradingScale: (scaleId) => api.delete(`/exams/grading-scales/${scaleId}`),
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

export const lessonPlansApi = {
  overview: (params) => api.get('/lesson-plans/overview', { params }),
  periodConfigs: () => api.get('/lesson-plans/period-configs'),
  assignments: (params) => api.get('/lesson-plans/assignments', { params }),
  behindSchedule: (params) => api.get('/lesson-plans/behind-schedule', { params }),
  listAnnual: (params) => api.get('/lesson-plans/annual', { params }),
  getAnnual: (id) => api.get(`/lesson-plans/annual/${id}`),
  saveAnnual: (data) => api.post('/lesson-plans/annual', data),
  submitAnnual: (id) => api.post(`/lesson-plans/annual/${id}/submit`),
  reviewAnnual: (id, data) => api.post(`/lesson-plans/annual/${id}/review`, data),
  getUnit: (unitId) => api.get(`/lesson-plans/units/${unitId}`),
  saveWeekly: (unitId, data) => api.post(`/lesson-plans/units/${unitId}/weekly`, data),
  listDaily: (params) => api.get('/lesson-plans/daily', { params }),
  getDaily: (id) => api.get(`/lesson-plans/daily/${id}`),
  saveDaily: (data) => api.post('/lesson-plans/daily', data),
  markTaught: (id) => api.post(`/lesson-plans/daily/${id}/taught`),
  lessonContext: (params) => api.get('/lesson-plans/lesson-context', { params }),
  termReport: (params) => api.get('/lesson-plans/term-report', { params }),
  recordCa: (data) => api.post('/lesson-plans/ca', data),
  bulkCa: (data) => api.post('/lesson-plans/ca/bulk', data),
  deleteCa: (id) => api.delete(`/lesson-plans/ca/${id}`),
  sectionCaSheet: (params) => api.get('/lesson-plans/ca/section-sheet', { params }),
  studentCaSummary: (studentId, params) => api.get(`/lesson-plans/ca/student/${studentId}`, { params }),
};

export const resourcesApi = {
  overview: () => api.get('/resources/overview'),
  categories: () => api.get('/resources/categories'),
  list: (params) => api.get('/resources', { params }),
  getOne: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  review: (id, data) => api.patch(`/resources/${id}/review`, data),
  remove: (id) => api.delete(`/resources/${id}`),
  access: (id, params) => api.get(`/resources/${id}/access`, { params }),
  bookmark: (id) => api.post(`/resources/${id}/bookmark`),
  shareableSections: () => api.get('/resources/share/my-sections'),
  sectionLibrary: (sectionId, params) => api.get(`/resources/section/${sectionId}`, { params }),
  listShares: (id) => api.get(`/resources/${id}/shares`),
  share: (id, data) => api.post(`/resources/${id}/share`, data),
  unshare: (shareId) => api.delete(`/resources/shares/${shareId}`),
  pinShare: (shareId) => api.patch(`/resources/shares/${shareId}/pin`),
};

export const libraryApi = {
  listBooks: (params) => api.get('/library/books', { params }),
  createBook: (data) => api.post('/library/books', data),
  updateBook: (id, data) => api.patch(`/library/books/${id}`, data),
  borrow: (data) => api.post('/library/borrow', data),
  returnBook: (id) => api.patch(`/library/borrow/${id}/return`),
  overdue: () => api.get('/library/overdue'),
  borrowings: () => api.get('/library/borrowings'),
};

export const parentPortalApi = {
  dashboard: () => api.get('/parent-portal/dashboard'),
  profile: () => api.get('/parent-portal/profile'),
  changePassword: (data) => api.post('/parent-portal/change-password', data),
  childDetail: (studentId) => api.get(`/parent-portal/children/${studentId}`),
  childGrades: (studentId, params) => api.get(`/parent-portal/children/${studentId}/grades`, { params }),
  childReportCard: (studentId, params) =>
    api.get(`/parent-portal/children/${studentId}/report-card`, { params, responseType: 'blob' }),
  payInvoiceChapa: (invoiceId) => api.post(`/parent-portal/invoices/${invoiceId}/pay-chapa`),
  verifyChapaPayment: (txRef) => api.get('/parent-portal/payments/chapa/verify', { params: { tx_ref: txRef } }),
};

export const studentPortalApi = {
  dashboard: () => api.get('/student-portal/dashboard'),
  profile: () => api.get('/student-portal/profile'),
  changePassword: (data) => api.post('/student-portal/change-password', data),
  timetable: () => api.get('/student-portal/timetable'),
  attendance: (params) => api.get('/student-portal/attendance', { params }),
  exams: (params) => api.get('/student-portal/exams', { params }),
  reportCard: (params) => api.get('/student-portal/report-card', { params, responseType: 'blob' }),
  fees: () => api.get('/student-portal/fees'),
  announcements: () => api.get('/student-portal/announcements'),
};

/** Platform control plane (SUPER_ADMIN only) */
export const financeApi = {
  getDashboard: () => api.get('/finance/dashboard'),
  listCategories: (params) => api.get('/finance/categories', { params }),
  createCategory: (data) => api.post('/finance/categories', data),
  getSubscriptionMatrix: (params) => api.get('/finance/student-fees/subscriptions', { params }),
  getStudentSubscriptions: (studentId, params) =>
    api.get(`/finance/student-fees/students/${studentId}/subscriptions`, { params }),
  setStudentSubscriptions: (studentId, data) =>
    api.put(`/finance/student-fees/students/${studentId}/subscriptions`, data),
  syncMandatorySubscriptions: (data) => api.post('/finance/student-fees/sync-mandatory', data),
  getBillingSetup: (params) => api.get('/finance/student-fees/billing-setup', { params }),
  previewTermInvoices: (params) => api.get('/finance/student-fees/preview-term', { params }),
  bootstrapFeeBilling: (data) => api.post('/finance/student-fees/bootstrap', data),
  repairTermBilling: () => api.post('/finance/student-fees/repair-term-billing'),
  getStudentBillingRoster: (params) => api.get('/finance/student-fees/billing-roster', { params }),
  createHrReviewRequest: (teacherId, data) =>
    api.post(`/finance/hr-review-requests/teachers/${teacherId}`, data),
  listHrReviewRequests: (params) => api.get('/finance/hr-review-requests', { params }),
  resolveHrReviewRequest: (id, data) => api.post(`/finance/hr-review-requests/${id}/resolve`, data),
  listSchedules: (params) => api.get('/finance/schedules', { params }),
  createSchedule: (data) => api.post('/finance/schedules', data),
  listDiscounts: () => api.get('/finance/discounts'),
  createDiscount: (data) => api.post('/finance/discounts', data),
  listPaymentPlans: () => api.get('/finance/payment-plans'),
  createPaymentPlan: (data) => api.post('/finance/payment-plans', data),
  listFeeStructures: () => api.get('/finance/fee-structures'),
  createFeeStructure: (data) => api.post('/finance/fee-structures', data),
  listInvoices: (params) => api.get('/finance/invoices', { params }),
  generateInvoices: (data) => api.post('/finance/invoices/generate', data),
  generateTermInvoices: (data) => api.post('/finance/invoices/generate-term', data),
  recordPayment: (data) => api.post('/finance/payments/record', data),
  capturePayment: (data) => api.post('/finance/payments', data),
  getLedger: (params) => api.get('/finance/ledger', { params }),
  getPayrollOverview: () => api.get('/finance/payroll/overview'),
  listPayrollStaffRoster: () => api.get('/finance/payroll/staff-roster'),
  listPayrollRuns: (params) => api.get('/finance/payroll/runs', { params }),
  getPayrollRun: (id) => api.get(`/finance/payroll/runs/${id}`),
  listPayrollCandidates: () => api.get('/finance/payroll/candidates'),
  updatePayrollEntry: (runId, entryId, data) =>
    api.patch(`/finance/payroll/runs/${runId}/entries/${entryId}`, data),
  createPayrollRun: (data) => api.post('/finance/payroll/runs', data),
  approvePayrollRun: (id) => api.post(`/finance/payroll/runs/${id}/approve`),
  submitPayrollRun: (id) => api.post(`/finance/payroll/runs/${id}/submit`),
  approvePayrollRun: (id) => api.post(`/finance/payroll/runs/${id}/approve`),
  rejectPayrollRun: (id, data) => api.post(`/finance/payroll/runs/${id}/reject`, data),
  payPayrollRun: (id) => api.post(`/finance/payroll/runs/${id}/pay`),
  getPendingApprovals: () => api.get('/finance/approvals/pending'),
  listFeeRequests: (params) => api.get('/finance/fee-requests', { params }),
  createFeeRequest: (data) => api.post('/finance/fee-requests', data),
  approveFeeRequest: (id) => api.post(`/finance/fee-requests/${id}/approve`),
  rejectFeeRequest: (id, data) => api.post(`/finance/fee-requests/${id}/reject`, data),
  listTeam: () => api.get('/finance/team'),
  createTeamMember: (data) => api.post('/finance/team', data),
};

export const platformApi = {
  getOverview: () => api.get('/platform/overview'),
  getFinanceOverview: () => api.get('/platform/finance/overview'),
  listFinanceTransactions: (params) => api.get('/platform/finance/transactions', { params }),
  listFinanceCommissions: (params) => api.get('/platform/finance/commissions', { params }),
  listFinanceBilling: (params) => api.get('/platform/finance/billing', { params }),
  createSchoolFinanceOfficer: (schoolId, data) =>
    api.post(`/platform/schools/${schoolId}/finance-officers`, data),
  getHealth: () => api.get('/platform/health'),
  getActivity: (params) => api.get('/platform/activity', { params }),
  listUsers: (params) => api.get('/platform/users', { params }),
  listStudents: (params) => api.get('/platform/students', { params }),
  listTeachers: (params) => api.get('/platform/teachers', { params }),
  listSchools: (params) => api.get('/platform/schools', { params }),
  getSchool: (id) => api.get(`/platform/schools/${id}`),
  getSchoolSummary: (id) => api.get(`/platform/schools/${id}/summary`),
  createSchool: (data) => api.post('/platform/schools', data),
  updateSchool: (id, data) => api.patch(`/platform/schools/${id}`, data),
  updateSchoolStatus: (data) => api.post('/platform/schools/status', data),
  listSubscriptions: (params) => api.get('/platform/subscriptions', { params }),
  listPlatformAudit: (params) => api.get('/platform/audit/platform', { params }),
  listTenantAudit: (params) => api.get('/platform/audit/tenants', { params }),
  getSettings: () => api.get('/platform/settings'),
  patchSettings: (data) => api.patch('/platform/settings', data),
  getFeatureFlags: (id) => api.get(`/platform/schools/${id}/features`),
  putFeatureFlags: (id, data) => api.put(`/platform/schools/${id}/features`, data),
};
