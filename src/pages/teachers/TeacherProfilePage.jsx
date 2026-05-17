import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Timeline from '../../components/enterprise/Timeline';
import { teachersApi } from '../../api/services';

export default function TeacherProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [note, setNote] = useState('');
  const [tab, setTab] = useState('overview');

  const load = () => teachersApi.getOne(id).then((r) => setProfile(r.data.data));

  useEffect(() => { load(); }, [id]);

  if (!profile) {
    return <AdminLayout><div className="h-64 bg-slate-100 rounded-3xl animate-pulse" /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/school-admin/teachers')}><ArrowLeft size={16} /> Back</Button>
          <div className="flex-1">
            <h1 className="text-2xl font-black">{profile.first_name} {profile.last_name}</h1>
            <p className="text-slate-500 text-sm">{profile.email} · {profile.department || 'No department'}</p>
          </div>
          <Badge color="green">{profile.status}</Badge>
        </header>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border rounded-2xl p-4"><p className="text-xs text-slate-400 uppercase">Sections</p><p className="text-xl font-black">{profile.workload?.sections}</p></div>
          <div className="bg-white border rounded-2xl p-4"><p className="text-xs text-slate-400 uppercase">Subjects</p><p className="text-xl font-black">{profile.workload?.subjects}</p></div>
          <div className="bg-white border rounded-2xl p-4"><p className="text-xs text-slate-400 uppercase">Leave</p><p className="text-xl font-black">{profile.leave_status}</p></div>
        </div>

        <nav className="flex gap-2">
          {['overview', 'assignments', 'qualifications', 'notes', 'activity'].map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-bold capitalize ${tab === t ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>{t}</button>
          ))}
        </nav>

        <section className="bg-white border rounded-3xl p-6">
          {tab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400">Employment</span><p className="font-bold">{profile.employment_type}</p></div>
              <div><span className="text-slate-400">Hire date</span><p className="font-bold">{profile.hire_date || '—'}</p></div>
              <div><span className="text-slate-400">Phone</span><p className="font-bold">{profile.phone || '—'}</p></div>
              <div><span className="text-slate-400">Qualifications</span><p className="font-bold">{profile.qualification_summary || '—'}</p></div>
            </div>
          )}
          {tab === 'assignments' && (
            <ul className="space-y-2">
              {profile.assignments?.map((a, i) => (
                <li key={i} className="p-3 border rounded-xl">{a.grade_name} {a.section_name} — {a.subject_name}</li>
              ))}
            </ul>
          )}
          {tab === 'qualifications' && (
            <ul className="space-y-2">
              {profile.qualifications?.map((q) => (
                <li key={q.id} className="p-3 border rounded-xl font-bold">{q.title} · {q.institution} ({q.year_obtained})</li>
              ))}
            </ul>
          )}
          {tab === 'notes' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note" />
                <Button onClick={async () => { await teachersApi.addNote(id, { body: note }); setNote(''); load(); }}>Save</Button>
              </div>
              {profile.notes?.map((n) => <article key={n.id} className="p-3 bg-slate-50 rounded-xl text-sm">{n.body}</article>)}
            </div>
          )}
          {tab === 'activity' && <Timeline items={profile.activity} />}
        </section>
      </div>
    </AdminLayout>
  );
}
