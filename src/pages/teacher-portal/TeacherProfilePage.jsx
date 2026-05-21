import { useEffect, useState } from 'react';
import { User, Briefcase, GraduationCap, Calendar, Award } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import Badge from '../../components/ui/Badge';
import { teacherPortalApi } from '../../api/services';

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'assignments', label: 'Teaching load', icon: Briefcase },
  { id: 'leave', label: 'Leave', icon: Calendar },
  { id: 'cpd', label: 'CPD', icon: Award },
];

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-bold uppercase">{label}</p>
      <p className="text-sm font-bold text-slate-800 mt-0.5">{value ?? '—'}</p>
    </div>
  );
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    teacherPortalApi.getMe()
      .then((r) => setProfile(r.data.data))
      .catch((e) => setError(e.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <TeacherLayout><div className="h-64 bg-white rounded-3xl border animate-pulse" /></TeacherLayout>;
  }

  if (error || !profile) {
    return <TeacherLayout title="My profile"><p className="text-rose-600">{error || 'Not found'}</p></TeacherLayout>;
  }

  const sp = profile.staff_profile || profile;
  const licenceExpiry = sp.licence_expiry_date || profile.licence_expiry_date;

  return (
    <TeacherLayout title="My profile" subtitle={profile.email}>
      <div className="space-y-6 max-w-4xl">
        <header className="flex flex-wrap items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-black">
            {(profile.first_name?.[0] || 'T').toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black">{profile.first_name} {profile.last_name}</h1>
            <p className="text-slate-500 text-sm">{profile.department || 'Faculty'} · {profile.employment_type || sp.employment_type}</p>
            <div className="flex gap-2 mt-2">
              <Badge color="green">{profile.status || 'active'}</Badge>
              {licenceExpiry && (
                <Badge color="blue">Licence exp. {licenceExpiry.slice(0, 10)}</Badge>
              )}
            </div>
          </div>
        </header>

        <nav className="flex gap-2 border-b pb-2 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
                tab === t.id ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </nav>

        {tab === 'overview' && (
          <section className="bg-white border rounded-3xl p-6 grid sm:grid-cols-2 gap-4">
            <InfoRow label="Staff ID" value={sp.staff_id_number || profile.staff_id_number} />
            <InfoRow label="Hire date" value={profile.hire_date?.slice?.(0, 10)} />
            <InfoRow label="Phone" value={profile.phone} />
            <InfoRow label="Licence" value={sp.teaching_licence_number} />
            <InfoRow label="Highest degree" value={sp.highest_degree} />
            <InfoRow label="Subject" value={sp.degree_subject} />
            <InfoRow label="Experience (years)" value={sp.years_of_experience} />
            <InfoRow label="City" value={sp.city || profile.city} />
          </section>
        )}

        {tab === 'assignments' && (
          <section className="bg-white border rounded-3xl p-6">
            <p className="text-sm text-slate-500 mb-4">
              {profile.workload?.sections ?? profile.assignments?.length} section(s) ·{' '}
              {profile.workload?.subjects ?? new Set((profile.assignments || []).map((a) => a.subject_id)).size} subject(s)
            </p>
            <ul className="space-y-2">
              {(profile.assignments || []).map((a) => (
                <li key={a.id} className="flex justify-between p-3 bg-slate-50 rounded-xl text-sm">
                  <span className="font-bold">{a.grade_name} {a.section_name} — {a.subject_name}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === 'leave' && (
          <section className="bg-white border rounded-3xl p-6">
            {(profile.leave_records || []).length === 0 ? (
              <p className="text-slate-400 text-sm">No leave records.</p>
            ) : (
              <ul className="space-y-2">
                {profile.leave_records.map((l) => (
                  <li key={l.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
                    <span className="font-bold">{l.leave_type} · {l.start_date?.slice(0, 10)} – {l.end_date?.slice(0, 10)}</span>
                    <Badge color={l.status === 'approved' ? 'green' : l.status === 'rejected' ? 'red' : 'amber'}>{l.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'cpd' && (
          <section className="bg-white border rounded-3xl p-6">
            {(profile.cpd_records || []).length === 0 ? (
              <p className="text-slate-400 text-sm">No CPD entries on file.</p>
            ) : (
              <ul className="space-y-2">
                {profile.cpd_records.map((c) => (
                  <li key={c.id} className="p-3 bg-slate-50 rounded-xl text-sm">
                    <p className="font-bold">{c.title || c.activity_type}</p>
                    <p className="text-xs text-slate-500">{c.provider} · {c.hours}h · {c.completed_date?.slice(0, 10)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </TeacherLayout>
  );
}
