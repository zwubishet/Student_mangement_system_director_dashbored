import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Archive, BarChart3, BookOpen, ClipboardList, Download, Edit3, FileText, HeartPulse, MessageSquare, RotateCcw, Tag, Users } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Timeline from '../../components/enterprise/Timeline';
import ProfileAnalytics from '../../components/enterprise/ProfileAnalytics';
import { studentsApi, parentsApi, notificationsApi, settingsApi } from '../../api/services';
import { downloadStudentPdfClient } from '../../utils/studentPdfClient';
import StudentMedicalForm from '../../components/students/StudentMedicalForm';
import { useCatalog } from '../../hooks/useCatalog';
import { uploadSchoolFile } from '../../utils/uploadFile';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'academic', label: 'Academic', icon: BookOpen },
  { id: 'medical', label: 'Medical', icon: HeartPulse },
  { id: 'guardians', label: 'Guardians', icon: Users },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'tags', label: 'Tags', icon: Tag },
  { id: 'notes', label: 'Notes', icon: ClipboardList },
  { id: 'activity', label: 'Activity', icon: ClipboardList },
];

export default function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('overview');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [guardianForm, setGuardianForm] = useState({ full_name: '', relationship: '', phone: '', email: '', is_primary: false });
  const [analytics, setAnalytics] = useState(null);
  const [linkedParents, setLinkedParents] = useState([]);
  const [showEnroll, setShowEnroll] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ section_id: '', academic_year_id: '' });
  const [enrollSections, setEnrollSections] = useState([]);
  const [smsMessage, setSmsMessage] = useState('');
  const [pdfTemplate, setPdfTemplate] = useState(null);
  const { years, grades, loadCatalog, loadSections } = useCatalog();

  const load = () => {
    setLoading(true);
    studentsApi.getOne(id).then((r) => {
      const p = r.data.data;
      setProfile(p);
      setEditForm({
        first_name: p.first_name,
        last_name: p.last_name,
        phone: p.phone || '',
        gender: p.gender || '',
        address: p.address || '',
        nationality: p.nationality || '',
        blood_group: p.blood_group || '',
        emergency_contact_name: p.emergency_contact_name || '',
        emergency_contact_phone: p.emergency_contact_phone || '',
      });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    loadCatalog();
    studentsApi.listTags().then((r) => setAllTags(r.data.data || [])).catch(() => {});
    studentsApi.analytics(id).then((r) => setAnalytics(r.data.data)).catch(() => {});
    parentsApi.byStudent(id).then((r) => setLinkedParents(r.data.data || [])).catch(() => {});
    settingsApi.listPdfTemplates().then((r) => {
      const tpl = (r.data.data || []).find((t) => t.template_key === 'id_card');
      setPdfTemplate(tpl || null);
    }).catch(() => {});
  }, [id, loadCatalog]);
  useEffect(() => {
    if (!enrollForm.grade_id) { setEnrollSections([]); return undefined; }
    let c = false;
    loadSections(enrollForm.grade_id).then((rows) => { if (!c) setEnrollSections(rows); });
    return () => { c = true; };
  }, [enrollForm.grade_id, loadSections]);

  const addNote = async () => {
    if (!note.trim()) return;
    await studentsApi.addNote(id, { body: note });
    setNote('');
    load();
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;
    await studentsApi.createTag({ name: newTagName.trim() });
    const res = await studentsApi.listTags();
    setAllTags(res.data.data || []);
    setNewTagName('');
  };

  const toggleTag = async (tagId, assigned) => {
    if (assigned) await studentsApi.removeTag(id, tagId);
    else await studentsApi.assignTag(id, tagId);
    load();
  };

  const downloadBlob = async (fn, filename, clientType) => {
    try {
      const res = await fn(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      downloadStudentPdfClient(profile, pdfTemplate || {}, clientType);
    }
  };

  const uploadDocument = async (e) => {
    e.preventDefault();
    if (!docTitle.trim() || !docFile) return;
    setUploading(true);
    try {
      const { fileUrl, fileId } = await uploadSchoolFile(docFile, 'student_document');
      await studentsApi.addDocument(id, {
        title: docTitle,
        file_url: fileUrl,
        file_id: fileId,
        doc_type: docFile.type || 'general',
      });
      setDocTitle('');
      setDocFile(null);
      load();
    } finally {
      setUploading(false);
    }
  };

  if (loading || !profile) {
    return (
      <AdminLayout>
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/school-admin/students')}><ArrowLeft size={16} /> Back</Button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-900">{profile.first_name} {profile.last_name}</h1>
            <p className="text-slate-500 text-sm">{profile.admission_number} · {profile.email}</p>
          </div>
          <Badge color="green">{profile.lifecycle_status}</Badge>
          <Button variant="secondary" onClick={() => downloadBlob(studentsApi.exportIdCard, `id-${profile.admission_number}.pdf`, 'id_card')}><Download size={16} /> ID card</Button>
          <Button variant="secondary" onClick={() => downloadBlob(studentsApi.exportProfile, `profile-${profile.admission_number}.pdf`, 'profile')}>Profile PDF</Button>
          <Button variant="secondary" onClick={() => setShowEnroll(true)}>Transfer</Button>
          <Button variant="secondary" onClick={() => setShowEdit(true)}><Edit3 size={16} /> Edit</Button>
          {profile.lifecycle_status === 'archived' ? (
            <Button variant="secondary" onClick={() => studentsApi.restore(id).then(load)}><RotateCcw size={16} /> Restore</Button>
          ) : (
            <Button variant="secondary" onClick={() => studentsApi.archive(id).then(() => navigate('/school-admin/students'))}>
              <Archive size={16} /> Archive
            </Button>
          )}
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase">Avg exam score</p>
            <p className="text-xl font-black mt-1">{profile.exam_summary?.avg_score ?? '—'}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase">Exams taken</p>
            <p className="text-xl font-black mt-1">{profile.exam_summary?.exam_count ?? 0}</p>
          </div>
        </div>

        <nav className="flex gap-2 border-b border-slate-100 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold ${tab === t.id ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <section className="bg-white border border-slate-100 rounded-3xl p-6">
          {tab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div><span className="text-slate-400">Gender</span><p className="font-bold">{profile.gender || '—'}</p></div>
              <div><span className="text-slate-400">DOB</span><p className="font-bold">{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : '—'}</p></div>
              <div><span className="text-slate-400">Phone</span><p className="font-bold">{profile.phone || '—'}</p></div>
              <div><span className="text-slate-400">Emergency</span><p className="font-bold">{profile.emergency_contact_name} {profile.emergency_contact_phone}</p></div>
            </div>
          )}
          {tab === 'analytics' && <ProfileAnalytics analytics={analytics} />}
          {tab === 'medical' && <StudentMedicalForm studentId={id} initial={profile.medical} />}
          {tab === 'academic' && (
            <div className="space-y-4">
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setShowEnroll(true)}>Transfer / promote</Button>
              <Button size="sm" variant="secondary" onClick={async () => { if (window.confirm('Withdraw student from active enrollment?')) { await studentsApi.withdraw(id, {}); load(); } }}>Withdraw</Button>
            </div>
            <ul className="space-y-3">
              {profile.enrollments?.map((e) => (
                <li key={e.id} className="p-4 border border-slate-100 rounded-xl">
                  <p className="font-bold">{e.grade_name} · {e.section_name}</p>
                  <p className="text-xs text-slate-500">{e.academic_year} · {e.status} · {e.enrolled_at && new Date(e.enrolled_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
            </div>
          )}
          {tab === 'guardians' && (
            <div className="space-y-4">
              <form
                className="grid md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!guardianForm.full_name.trim()) return;
                  await studentsApi.addGuardian(id, guardianForm);
                  setGuardianForm({ full_name: '', relationship: '', phone: '', email: '', is_primary: false });
                  load();
                }}
              >
                <Input label="Full name" value={guardianForm.full_name} onChange={(e) => setGuardianForm((f) => ({ ...f, full_name: e.target.value }))} required />
                <Input label="Relationship" value={guardianForm.relationship} onChange={(e) => setGuardianForm((f) => ({ ...f, relationship: e.target.value }))} />
                <Input label="Phone" value={guardianForm.phone} onChange={(e) => setGuardianForm((f) => ({ ...f, phone: e.target.value }))} />
                <Input label="Email" value={guardianForm.email} onChange={(e) => setGuardianForm((f) => ({ ...f, email: e.target.value }))} />
                <label className="flex items-center gap-2 text-sm font-bold md:col-span-2">
                  <input type="checkbox" checked={guardianForm.is_primary} onChange={(e) => setGuardianForm((f) => ({ ...f, is_primary: e.target.checked }))} />
                  Primary guardian
                </label>
                <Button type="submit">Add guardian</Button>
              </form>
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><MessageSquare size={14} /> SMS guardians</p>
                <div className="flex gap-2">
                  <Input value={smsMessage} onChange={(e) => setSmsMessage(e.target.value)} placeholder="Message to guardian phones..." />
                  <Button type="button" size="sm" onClick={async () => {
                    if (!smsMessage.trim()) return;
                    await notificationsApi.notifyGuardians(id, smsMessage.trim());
                    setSmsMessage('');
                    window.alert('SMS queued for guardians.');
                  }}>Send</Button>
                </div>
              </div>
              {linkedParents.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Linked parent accounts</p>
                  <ul className="space-y-2">
                    {linkedParents.map((p) => (
                      <li key={p.id} className="p-3 bg-emerald-50 rounded-xl text-sm">{p.first_name} {p.last_name} · {p.phone}</li>
                    ))}
                  </ul>
                </div>
              )}
              <ul className="space-y-3">
                {profile.guardians?.length ? profile.guardians.map((g) => (
                  <li key={g.id} className="p-4 border border-slate-100 rounded-xl flex justify-between gap-2">
                    <div>
                      <p className="font-bold">{g.full_name} {g.is_primary && <span className="text-emerald-600 text-xs">(Primary)</span>}</p>
                      <p className="text-sm text-slate-500">{g.relationship} · {g.phone} · {g.email}</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={async () => {
                      if (window.confirm('Remove guardian?')) { await studentsApi.deleteGuardian(id, g.id); load(); }
                    }}>Remove</Button>
                  </li>
                )) : <p className="text-slate-400">No guardians on file.</p>}
              </ul>
            </div>
          )}
          {tab === 'documents' && (
            <div className="space-y-4">
              <form onSubmit={uploadDocument} className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl">
                <Input label="Document title" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} required />
                <input type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="text-sm" />
                <Button type="submit" loading={uploading}>Upload</Button>
              </form>
              <ul className="space-y-2">
                {profile.documents?.length ? profile.documents.map((d) => (
                  <li key={d.id} className="flex justify-between items-center p-3 border rounded-xl text-sm">
                    <span className="font-bold">{d.title}</span>
                    <a href={d.file_url} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold">Open</a>
                  </li>
                )) : <p className="text-slate-400">No documents uploaded.</p>}
              </ul>
            </div>
          )}
          {tab === 'tags' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="New tag name" />
                <Button type="button" onClick={createTag}>Create tag</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((t) => {
                  const assigned = profile.tags?.some((pt) => pt.id === t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id, assigned)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border ${assigned ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600'}`}
                      style={assigned ? {} : { borderColor: t.color }}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {tab === 'notes' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add internal note..." />
                <Button onClick={addNote}>Save</Button>
              </div>
              {profile.notes?.map((n) => (
                <article key={n.id} className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm">{n.body}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                </article>
              ))}
            </div>
          )}
          {tab === 'activity' && <Timeline items={profile.activity} />}
        </section>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit student">
        <form onSubmit={async (e) => { e.preventDefault(); await studentsApi.update(id, editForm); setShowEdit(false); load(); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" value={editForm.first_name} onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))} required />
            <Input label="Last name" value={editForm.last_name} onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))} required />
          </div>
          <Input label="Phone" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
          <Select label="Gender" value={editForm.gender} onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
          <Input label="Address" value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} />
          <Input label="Nationality" value={editForm.nationality} onChange={(e) => setEditForm((f) => ({ ...f, nationality: e.target.value }))} />
          <Input label="Blood group" value={editForm.blood_group} onChange={(e) => setEditForm((f) => ({ ...f, blood_group: e.target.value }))} />
          <Input label="Emergency contact" value={editForm.emergency_contact_name} onChange={(e) => setEditForm((f) => ({ ...f, emergency_contact_name: e.target.value }))} />
          <Input label="Emergency phone" value={editForm.emergency_contact_phone} onChange={(e) => setEditForm((f) => ({ ...f, emergency_contact_phone: e.target.value }))} />
          <Button type="submit">Save changes</Button>
        </form>
      </Modal>
      </div>
    </AdminLayout>
  );
}
