import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import { platformApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Loader2 } from 'lucide-react';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

export default function SchoolDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingFlags, setSavingFlags] = useState(false);

  const load = () => {
    setLoading(true);
    platformApi.getSchool(id)
      .then((res) => setSchool(res.data.data))
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
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full border bg-slate-100">{school.status}</span>
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full border bg-violet-50 text-violet-700">{school.plan}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {school.status !== 'active' && (
              <button type="button" onClick={() => setStatus('active')} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase">Activate</button>
            )}
            {school.status === 'active' && (
              <button type="button" onClick={() => setStatus('suspended', 'Suspended by platform admin')} className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black uppercase">Suspend</button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { label: 'Users', value: school.user_count },
            { label: 'Students', value: school.student_count },
            { label: 'Teachers', value: school.teacher_count },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{m.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{m.value ?? 0}</p>
            </div>
          ))}
        </div>

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
