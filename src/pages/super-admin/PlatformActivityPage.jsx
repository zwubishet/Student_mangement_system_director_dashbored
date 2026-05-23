import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import PlatformPageHeader from '../../components/super-admin/PlatformPageHeader';
import PlatformFilterBar from '../../components/super-admin/PlatformFilterBar';
import { platformApi } from '../../api/services';
import { Loader2, Building2, Shield } from 'lucide-react';

const fmtTime = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

export default function PlatformActivityPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [schoolId, setSchoolId] = useState(searchParams.get('school_id') || '');

  const load = useCallback(() => {
    setLoading(true);
    platformApi.getActivity({ school_id: schoolId || undefined, limit: 80 })
      .then((res) => setItems(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <PlatformPageHeader
          title="System activity"
          subtitle="Everything happening across schools — logins, changes, provisioning"
        />
        <PlatformFilterBar showSearch={false} schoolId={schoolId} onSchoolChange={setSchoolId} />
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-violet-600" size={32} /></div>
          ) : items.length === 0 ? (
            <p className="p-12 text-center text-slate-400 text-sm">No recent activity.</p>
          ) : (
            <ul className="divide-y divide-slate-50 dark:divide-slate-800 dark:divide-slate-800">
              {items.map((item) => (
                <li key={`${item.source}-${item.id}`} className="flex gap-4 p-4 hover:bg-slate-50/80">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.source === 'platform' ? 'bg-violet-100 text-violet-600' : 'bg-sky-100 text-sky-600'
                  }`}>
                    {item.source === 'platform' ? <Shield size={16} /> : <Building2 size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      <span className="text-violet-600">{item.action}</span>
                      {' · '}
                      <span className="text-slate-600 font-medium">{item.entity}</span>
                      {item.entity_id && (
                        <span className="text-slate-400 font-normal"> #{String(item.entity_id).slice(0, 8)}</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.actor_email || 'System'}
                      {item.school_name && (
                        <>
                          {' · '}
                          <Link to={`/super-admin/schools/${item.school_id}`} className="text-violet-600 hover:underline">
                            {item.school_name}
                          </Link>
                        </>
                      )}
                      {item.source === 'platform' && ' · Platform'}
                    </p>
                  </div>
                  <time className="text-xs text-slate-400 shrink-0">{fmtTime(item.created_at)}</time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
}
