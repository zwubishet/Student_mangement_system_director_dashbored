import { jsPDF } from 'jspdf';

/**
 * Client-side PDF fallback when server PDF is unavailable.
 * @param {object} profile - student profile from API
 * @param {object} template - optional school PDF template
 * @param {'id_card'|'profile'} type
 */
export function downloadStudentPdfClient(profile, template = {}, type = 'id_card') {
  const brand = template.primary_color || '#059669';
  const header = template.header_text || profile.school_name || 'School';
  const footer = template.footer_text || '';

  if (type === 'id_card') {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [86, 54] });
    doc.setTextColor(brand);
    doc.setFontSize(9);
    doc.text(header, 43, 8, { align: 'center' });
    doc.setTextColor('#0f172a');
    doc.setFontSize(12);
    doc.text(template.title || 'STUDENT ID CARD', 43, 16, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`${profile.first_name} ${profile.last_name}`, 43, 24, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor('#475569');
    doc.text(`Admission: ${profile.admission_number || '—'}`, 43, 30, { align: 'center' });
    const enr = profile.active_enrollment;
    doc.text(`${enr?.grade_name || '—'} · ${enr?.section_name || '—'}`, 43, 36, { align: 'center' });
    if (footer) doc.text(footer, 43, 48, { align: 'center' });
    doc.save(`id-${profile.admission_number || profile.id}.pdf`);
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.setTextColor(brand);
  doc.text(header, 14, 20);
  doc.setTextColor('#0f172a');
  doc.setFontSize(12);
  doc.text(`Student: ${profile.first_name} ${profile.last_name}`, 14, 32);
  doc.setFontSize(10);
  doc.text(`Admission #: ${profile.admission_number || '—'}`, 14, 40);
  doc.text(`Email: ${profile.email || '—'}`, 14, 48);
  doc.text(`Phone: ${profile.phone || '—'}`, 14, 56);
  doc.text(`Status: ${profile.lifecycle_status || 'active'}`, 14, 64);
  if (footer) doc.text(footer, 14, 280);
  doc.save(`profile-${profile.admission_number || profile.id}.pdf`);
}
