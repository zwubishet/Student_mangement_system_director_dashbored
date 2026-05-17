import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentLayout from '../../components/layouts/ParentLayout';
import Badge from '../../components/ui/Badge';
import { parentPortalApi } from '../../api/services';

export default function ParentDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parentPortalApi.dashboard()
      .then((r) => setData(r.data.data))
      .catch(() => setData({ children: [] }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ParentLayout>
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">My children</h1>
        <p className="text-slate-500 text-sm mt-1">Attendance and grades at a glance</p>
      </header>

      {loading ? (
        <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
      ) : (
        <ul className="space-y-4">
          {data?.children?.length ? data.children.map((child) => (
            <li key={child.id}>
              <button
                type="button"
                onClick={() => navigate(`/parent/children/${child.id}`)}
                className="w-full text-left bg-white border border-slate-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-lg text-slate-900">{child.first_name} {child.last_name}</p>
                    <p className="text-sm text-slate-500">{child.admission_number} · {child.grade_name || '—'} · {child.section_name || '—'}</p>
                  </div>
                  <Badge color="green">{child.enrollment_status || 'active'}</Badge>
                </div>
              </button>
            </li>
          )) : (
            <p className="text-slate-400 text-center py-12">No linked students. Contact your school administrator.</p>
          )}
        </ul>
      )}
    </ParentLayout>
  );
}
