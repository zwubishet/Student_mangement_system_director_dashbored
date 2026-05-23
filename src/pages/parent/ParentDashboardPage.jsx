import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, GraduationCap, Settings } from 'lucide-react';
import ParentLayout from '../../components/layouts/ParentLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { parentPortalApi } from '../../api/services';
import { ui } from '../../theme/tokens';

const ETB = new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 });

export default function ParentDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parentPortalApi.dashboard()
      .then((r) => setData(r.data.data))
      .catch(() => setData({ parent: null, children: [] }))
      .finally(() => setLoading(false));
  }, []);

  const totalFees = (data?.children || []).reduce((s, c) => s + Number(c.fee_balance || 0), 0);

  return (
    <ParentLayout>
      <header className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">My children</h1>
          <p className={`${ui.muted} text-sm mt-1`}>
            Welcome{data?.parent?.first_name ? `, ${data.parent.first_name}` : ''} — attendance, grades, and school fees
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/parent/account')}>
          <Settings size={16} /> Account & password
        </Button>
      </header>

      {loading ? (
        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      ) : (
        <>
          {data?.children?.length > 0 && (
            <div className={`${ui.card} p-5 mb-6 flex flex-wrap items-center justify-between gap-4`}>
              <div className="flex items-center gap-3">
                <Banknote className="text-amber-500" size={28} />
                <div>
                  <p className={`${ui.mutedXs}`}>Total outstanding fees</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{ETB.format(totalFees)}</p>
                </div>
              </div>
              <p className={`text-xs ${ui.muted} max-w-xs`}>Pay at the school finance office. Contact admin for invoice details.</p>
            </div>
          )}

          <ul className="space-y-4">
            {data?.children?.length ? data.children.map((child) => (
              <li key={child.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/parent/children/${child.id}`)}
                  className={`w-full text-left ${ui.card} p-5 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-md transition-all`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                        <GraduationCap className="text-emerald-600" size={20} />
                      </div>
                      <div>
                        <p className="font-black text-lg text-slate-900 dark:text-slate-100">{child.first_name} {child.last_name}</p>
                        <p className={`text-sm ${ui.muted}`}>
                          {child.admission_number} · {child.grade_name || '—'} · {child.section_name || '—'}
                        </p>
                        {Number(child.fee_balance) > 0 && (
                          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">
                            Outstanding: {ETB.format(Number(child.fee_balance))}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge color="green">{child.enrollment_status || 'active'}</Badge>
                  </div>
                </button>
              </li>
            )) : (
              <div className={`${ui.card} p-12 text-center`}>
                <p className={ui.muted}>No linked students yet.</p>
                <p className={`text-sm ${ui.muted} mt-2`}>Ask your school administrator to link your parent account to your child.</p>
              </div>
            )}
          </ul>
        </>
      )}
    </ParentLayout>
  );
}
