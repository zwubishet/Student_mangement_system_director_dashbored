/** Deep links between Academic Setup and Classes */

export const ACADEMIC_SETUP = '/school-admin/academic-setup';
export const CLASSES = '/school-admin/classes';

export function academicSetupUrl({ tab = 'grades', gradeId, sectionId } = {}) {
  const params = new URLSearchParams();
  if (tab) params.set('tab', tab);
  if (gradeId) params.set('gradeId', gradeId);
  if (sectionId) params.set('sectionId', sectionId);
  const q = params.toString();
  return q ? `${ACADEMIC_SETUP}?${q}` : ACADEMIC_SETUP;
}

export function classesUrl({ gradeId, sectionId, academicYearId, openCreate } = {}) {
  const params = new URLSearchParams();
  if (gradeId) params.set('gradeId', gradeId);
  if (sectionId) params.set('sectionId', sectionId);
  if (academicYearId) params.set('yearId', academicYearId);
  if (openCreate) params.set('create', '1');
  const q = params.toString();
  return q ? `${CLASSES}?${q}` : CLASSES;
}

export function parseAcademicSetupSearch(search) {
  const p = new URLSearchParams(search);
  return {
    tab: p.get('tab') || 'years',
    gradeId: p.get('gradeId') || '',
    sectionId: p.get('sectionId') || '',
  };
}

export function parseClassesSearch(search) {
  const p = new URLSearchParams(search);
  return {
    gradeId: p.get('gradeId') || '',
    sectionId: p.get('sectionId') || '',
    yearId: p.get('yearId') || '',
    openCreate: p.get('create') === '1',
  };
}
