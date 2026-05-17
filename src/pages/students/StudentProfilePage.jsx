import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Archive, BookOpen, ClipboardList, FileText, Tag, Users } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Timeline from '../../components/enterprise/Timeline';
import { studentsApi } from '../../api/services';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Users },
  { id: 'academic', label: 'Academic', icon: BookOpen },
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

  const load = () => {
    setLoading(true);
    studentsApi.getOne(id).then((r) => setProfile(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    studentsApi.listTags().then((r) => setAllTags(r.data.data || [])).catch(() => {});
  }, []);

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

  const uploadDocument = async (e) => {
    e.preventDefault();
    if (!docTitle.trim() || !docFile) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      const fileUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(docFile);
      });
      await studentsApi.addDocument(id, {
        title: docTitle,
        file_url: fileUrl,
        doc_type: docFile.type || 'general',
        mime_type: docFile.type,
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
          <Button variant="secondary" onClick={() => studentsApi.archive(id).then(() => navigate('/school-admin/students'))}>
            <Archive size={16} /> Archive
          </Button>
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
          {tab === 'academic' && (
            <ul className="space-y-3">
              {profile.enrollments?.map((e) => (
                <li key={e.id} className="p-4 border border-slate-100 rounded-xl">
                  <p className="font-bold">{e.grade_name} · {e.section_name}</p>
                  <p className="text-xs text-slate-500">{e.academic_year} · {e.status} · {e.enrolled_at && new Date(e.enrolled_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
          {tab === 'guardians' && (
            <ul className="space-y-3">
              {profile.guardians?.length ? profile.guardians.map((g) => (
                <li key={g.id} className="p-4 border border-slate-100 rounded-xl">
                  <p className="font-bold">{g.full_name} {g.is_primary && <span className="text-emerald-600 text-xs">(Primary)</span>}</p>
                  <p className="text-sm text-slate-500">{g.relationship} · {g.phone} · {g.email}</p>
                </li>
              )) : <p className="text-slate-400">No guardians on file.</p>}
            </ul>
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
      </div>
    </AdminLayout>
  );
}
