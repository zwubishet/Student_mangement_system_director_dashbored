import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Archive, Edit3, FileText, RotateCcw } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Timeline from '../../components/enterprise/Timeline';
import { teachersApi } from '../../api/services';
import { uploadSchoolFile } from '../../utils/uploadFile';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TABS = ['overview', 'assignments', 'qualifications', 'documents', 'availability', 'notes', 'activity'];

export default function TeacherProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [note, setNote] = useState('');
  const [tab, setTab] = useState('overview');
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [qualForm, setQualForm] = useState({ title: '', institution: '', year_obtained: '' });
  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [availSlots, setAvailSlots] = useState([]);

  const load = () => teachersApi.getOne(id).then((r) => {
    const p = r.data.data;
    setProfile(p);
    setEditForm({
      first_name: p.first_name,
      last_name: p.last_name,
      phone: p.phone || '',
      department: p.department || '',
      employment_type: p.employment_type || 'full_time',
      leave_status: p.leave_status || 'active',
      qualification_summary: p.qualification_summary || '',
      address: p.address || '',
    });
    setAvailSlots(p.availability?.length ? p.availability.map((a) => ({
      day_of_week: a.day_of_week,
      start_time: a.start_time?.slice?.(0, 5) || a.start_time,
      end_time: a.end_time?.slice?.(0, 5) || a.end_time,
      is_available: a.is_available,
    })) : [{ day_of_week: 1, start_time: '08:00', end_time: '15:00', is_available: true }]);
  });

  useEffect(() => { load(); }, [id]);

  const saveEdit = async (e) => {
    e.preventDefault();
    await teachersApi.update(id, editForm);
    setShowEdit(false);
    load();
  };

  const addQualification = async (e) => {
    e.preventDefault();
    if (!qualForm.title.trim()) return;
    await teachersApi.addQualification(id, qualForm);
    setQualForm({ title: '', institution: '', year_obtained: '' });
    load();
  };

  const uploadDocument = async (e) => {
    e.preventDefault();
    if (!docTitle.trim() || !docFile) return;
    setUploading(true);
    try {
      const { fileUrl, fileId } = await uploadSchoolFile(docFile, 'teacher_document');
      await teachersApi.addDocument(id, { title: docTitle, file_url: fileUrl, file_id: fileId, doc_type: docFile.type || 'general' });
      setDocTitle('');
      setDocFile(null);
      load();
    } finally {
      setUploading(false);
    }
  };

  const saveAvailability = async () => {
    await teachersApi.setAvailability(id, availSlots);
    load();
  };

  if (!profile) {
    return <AdminLayout><div className="h-64 bg-slate-100 rounded-3xl animate-pulse" /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex flex-wrap items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/school-admin/teachers')}><ArrowLeft size={16} /> Back</Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black">{profile.first_name} {profile.last_name}</h1>
            <p className="text-slate-500 text-sm">{profile.email} · {profile.department || 'No department'}</p>
          </div>
          <Badge color={profile.status === 'active' ? 'green' : 'amber'}>{profile.status}</Badge>
          <Button variant="secondary" onClick={() => setShowEdit(true)}><Edit3 size={16} /> Edit</Button>
          {profile.status === 'archived' ? (
            <Button variant="secondary" onClick={() => teachersApi.restore(id).then(load)}><RotateCcw size={16} /> Restore</Button>
          ) : (
            <Button variant="secondary" onClick={() => teachersApi.archive(id).then(() => navigate('/school-admin/teachers'))}>
              <Archive size={16} /> Archive
            </Button>
          )}
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4"><p className="text-xs text-slate-400 uppercase">Sections</p><p className="text-xl font-black">{profile.workload?.sections ?? 0}</p></div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4"><p className="text-xs text-slate-400 uppercase">Subjects</p><p className="text-xl font-black">{profile.workload?.subjects ?? 0}</p></div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4"><p className="text-xs text-slate-400 uppercase">Employment</p><p className="text-xl font-black capitalize">{profile.employment_type?.replace('_', ' ')}</p></div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4"><p className="text-xs text-slate-400 uppercase">Leave</p><p className="text-xl font-black">{profile.leave_status || '—'}</p></div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-bold capitalize ${tab === t ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{t}</button>
          ))}
        </nav>

        <section className="bg-white border border-slate-100 rounded-3xl p-6">
          {tab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400">Phone</span><p className="font-bold">{profile.phone || '—'}</p></div>
              <div><span className="text-slate-400">Hire date</span><p className="font-bold">{profile.hire_date ? new Date(profile.hire_date).toLocaleDateString() : '—'}</p></div>
              <div><span className="text-slate-400">Address</span><p className="font-bold">{profile.address || '—'}</p></div>
              <div><span className="text-slate-400">Summary</span><p className="font-bold">{profile.qualification_summary || '—'}</p></div>
            </div>
          )}
          {tab === 'assignments' && (
            <ul className="space-y-2">
              {profile.assignments?.length ? profile.assignments.map((a, i) => (
                <li key={i} className="p-3 border border-slate-100 rounded-xl font-medium">{a.grade_name} · {a.section_name} — {a.subject_name}</li>
              )) : <p className="text-slate-400">No assignments.</p>}
            </ul>
          )}
          {tab === 'qualifications' && (
            <div className="space-y-4">
              <form onSubmit={addQualification} className="grid md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl">
                <Input label="Title" value={qualForm.title} onChange={(e) => setQualForm((f) => ({ ...f, title: e.target.value }))} required />
                <Input label="Institution" value={qualForm.institution} onChange={(e) => setQualForm((f) => ({ ...f, institution: e.target.value }))} />
                <Input label="Year" type="number" value={qualForm.year_obtained} onChange={(e) => setQualForm((f) => ({ ...f, year_obtained: e.target.value }))} />
                <div className="flex items-end"><Button type="submit">Add</Button></div>
              </form>
              <ul className="space-y-2">
                {profile.qualifications?.map((q) => (
                  <li key={q.id} className="p-3 border rounded-xl font-bold">{q.title} · {q.institution} ({q.year_obtained || '—'})</li>
                ))}
              </ul>
            </div>
          )}
          {tab === 'documents' && (
            <div className="space-y-4">
              <form onSubmit={uploadDocument} className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl">
                <Input label="Title" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} required />
                <input type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="text-sm" />
                <Button type="submit" loading={uploading}><FileText size={14} className="inline mr-1" /> Upload</Button>
              </form>
              <ul className="space-y-2">
                {profile.documents?.length ? profile.documents.map((d) => (
                  <li key={d.id} className="flex justify-between p-3 border rounded-xl text-sm">
                    <span className="font-bold">{d.title}</span>
                    <a href={d.file_url} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold">Open</a>
                  </li>
                )) : <p className="text-slate-400">No documents.</p>}
              </ul>
            </div>
          )}
          {tab === 'availability' && (
            <div className="space-y-4">
              {availSlots.map((slot, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
                  <Select label="Day" value={String(slot.day_of_week)} onChange={(e) => {
                    const next = [...availSlots];
                    next[i] = { ...next[i], day_of_week: Number(e.target.value) };
                    setAvailSlots(next);
                  }} options={DAYS.map((d, di) => ({ value: String(di), label: d }))} />
                  <Input label="Start" type="time" value={slot.start_time} onChange={(e) => {
                    const next = [...availSlots];
                    next[i] = { ...next[i], start_time: e.target.value };
                    setAvailSlots(next);
                  }} />
                  <Input label="End" type="time" value={slot.end_time} onChange={(e) => {
                    const next = [...availSlots];
                    next[i] = { ...next[i], end_time: e.target.value };
                    setAvailSlots(next);
                  }} />
                  <label className="flex items-center gap-2 text-sm font-bold pb-2">
                    <input type="checkbox" checked={slot.is_available !== false} onChange={(e) => {
                      const next = [...availSlots];
                      next[i] = { ...next[i], is_available: e.target.checked };
                      setAvailSlots(next);
                    }} />
                    Available
                  </label>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setAvailSlots(availSlots.filter((_, j) => j !== i))}>Remove</Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setAvailSlots([...availSlots, { day_of_week: 1, start_time: '08:00', end_time: '15:00', is_available: true }])}>Add slot</Button>
                <Button onClick={saveAvailability}>Save schedule</Button>
              </div>
            </div>
          )}
          {tab === 'notes' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note..." className="flex-1" />
                <Button onClick={async () => { if (!note.trim()) return; await teachersApi.addNote(id, { body: note }); setNote(''); load(); }}>Save</Button>
              </div>
              {profile.notes?.map((n) => <article key={n.id} className="p-3 bg-slate-50 rounded-xl text-sm">{n.body}</article>)}
            </div>
          )}
          {tab === 'activity' && <Timeline items={profile.activity} />}
        </section>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit teacher">
        <form onSubmit={saveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" value={editForm.first_name} onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))} required />
            <Input label="Last name" value={editForm.last_name} onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))} required />
          </div>
          <Input label="Phone" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="Department" value={editForm.department} onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))} />
          <Select label="Employment" value={editForm.employment_type} onChange={(e) => setEditForm((f) => ({ ...f, employment_type: e.target.value }))} options={[{ value: 'full_time', label: 'Full-time' }, { value: 'part_time', label: 'Part-time' }, { value: 'contract', label: 'Contract' }]} />
          <Select label="Leave status" value={editForm.leave_status} onChange={(e) => setEditForm((f) => ({ ...f, leave_status: e.target.value }))} options={[{ value: 'active', label: 'Available' }, { value: 'on_leave', label: 'On leave' }]} />
          <Input label="Qualification summary" value={editForm.qualification_summary} onChange={(e) => setEditForm((f) => ({ ...f, qualification_summary: e.target.value }))} />
          <Input label="Address" value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} />
          <Button type="submit">Save changes</Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
