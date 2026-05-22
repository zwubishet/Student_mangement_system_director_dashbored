import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import { platformApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Loader2, Users, GraduationCap, UserCircle, Activity, LayoutDashboard } from 'lucide-react';
import PlatformStatusBadge from '../../components/super-admin/PlatformStatusBadge';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

export default function SchoolDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { enterSchoolWorkspace } = useAuth();
  const [school, setSchool] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingFlags, setSavingFlags] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      platformApi.getSchool(id),
      platformApi.getSchoolSummary(id).catch(() => null),
    ])
      .then(([schoolRes, sumRes]) => {
        setSchool(schoolRes.data.data);
        setSummary(sumRes?.data?.data ?? null);
      })
      .catch(() => toast('School not found', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const setStatus = async (status, suspended_reason) => {
    try {
      await platformApi.updateSchoolStatus({ school_id: id, status, suspended_reason });
      toast(`Status updated to ${status}`, 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const toggleFeature = async (feature, enabled) => {
    const flags = (school.feature_flags || []).map((f) =>
      (f.feature === feature ? { feature, enabled } : { feature: f.feature, enabled: f.enabled })
    );
    if (!flags.find((f) => f.feature === feature)) flags.push({ feature, enabled });
    setSavingFlags(true);
    try {
      await platformApi.putFeatureFlags(id, { features: flags });
      toast('Feature flags updated', 'success');
      load();
    } catch {
      toast('Failed to update features', 'error');
    } finally {
      setSavingFlags(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-violet-600" size={36} /></div>
      </SuperAdminLayout>
    );
  }

  if (!school) {
    return (
      <SuperAdminLayout>
        <p className="text-slate-500">School not found. <Link to="/super-admin/schools" className="text-violet-600 font-bold">Back</Link></p>
      </SuperAdminLayout>
    );
  }

  const addr = school.address || school.school_address;

  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <Link to="/super-admin/schools" className="inline-flex items-center gap-2 text-sm font-bold text-violet-600">
          <ArrowLeft size={16} /> All schools
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900">{school.name}</h1>
            <p className="text-violet-600 font-mono text-sm mt-1">{school.slug}</p>
            <p className="text-slate-500 mt-1">{addr || 'No address'}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <PlatformStatusBadge status={school.status} />
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full border bg-violet-50 text-violet-700">{school.plan}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                enterSchoolWorkspace(id, school.name);
                navigate('/school-admin/dashboard');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-black uppercase hover:bg-violet-700"
            >
              <LayoutDashboard size={16} /> Manage school (full admin)
            </button>
            {school.status !== 'active' && (
              <button type="button" onClick={() => setStatus('active')} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase">Activate</button>
            )}
            {school.status === 'active' && (
              <button type="button" onClick={() => setStatus('suspended', 'Suspended by platform admin')} className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black uppercase">Suspend</button>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Users', value: summary?.counts?.users ?? school.user_count, to: `/super-admin/users?school_id=${id}`, icon: Users },
            { label: 'Students', value: summary?.counts?.students ?? school.student_count, to: `/super-admin/students?school_id=${id}`, icon: GraduationCap },
            { label: 'Teachers', value: summary?.counts?.teachers ?? school.teacher_count, to: `/super-admin/teachers?school_id=${id}`, icon: UserCircle },
            { label: 'Activity', value: summary?.recent_activity?.length ?? 0, to: `/super-admin/activity?school_id=${id}`, icon: Activity, sub: 'Recent events' },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.label}
                to={m.to}
                className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-violet-200 transition-all flex gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">{m.label}</p>
                  <p className="text-2xl font-black text-slate-900">{m.value ?? 0}</p>
                  {m.sub && <p className="text-xs text-slate-500">{m.sub}</p>}
                </div>
              </Link>
            );
          })}
        </div>

        {summary?.recent_activity?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="font-black text-slate-900 mb-3">Recent activity at this school</h2>
            <ul className="space-y-2 text-sm">
              {summary.recent_activity.map((a) => (
                <li key={a.id} className="flex justify-between gap-4 text-slate-600">
                  <span><span className="font-bold text-violet-600">{a.action}</span> · {a.entity}</span>
                  <time className="text-xs text-slate-400 shrink-0">{fmtDate(a.created_at)}</time>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-4">Tenant profile</h2>
          <dl className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              ['Email', school.email],
              ['Phone', school.phone],
              ['City', school.city],
              ['Region', school.region],
              ['Country', school.country],
              ['Timezone', school.timezone],
              ['Grading', school.grading_system],
              ['Max class size', school.max_class_size],
              ['Trial ends', fmtDate(school.trial_ends_at)],
              ['Provisioned', fmtDate(school.provisioned_at)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-50 pb-2">
                <dt className="text-slate-400">{k}</dt>
                <dd className="font-bold text-slate-800">{v ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-4">Feature flags</h2>
          <div className="space-y-3">
            {(school.feature_flags || []).map((f) => (
              <label key={f.feature} className="flex items-center justify-between gap-4 cursor-pointer">
                <span className="font-bold text-slate-800">{f.feature}</span>
                <input
                  type="checkbox"
                  disabled={savingFlags}
                  checked={!!f.enabled}
                  onChange={(e) => toggleFeature(f.feature, e.target.checked)}
                  className="w-10 h-6 accent-violet-600"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
