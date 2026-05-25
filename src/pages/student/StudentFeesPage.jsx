import { useEffect, useState } from 'react';
import { Banknote, Receipt } from 'lucide-react';
import StudentLayout from '../../components/layouts/StudentLayout';
import Badge from '../../components/ui/Badge';
import { studentPortalApi } from '../../api/services';
import { ui } from '../../theme/tokens';

const ETB = new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 });

const statusColor = (s) => {
  if (s === 'paid') return 'green';
  if (s === 'partial') return 'amber';
  return 'gray';
};

export default function StudentFeesPage() {
  const [data, setData] = useState({ invoices: [], total_balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentPortalApi.fees()
      .then((r) => setData(r.data.data || { invoices: [], total_balance: 0 }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <StudentLayout>
      <header className="mb-6">
        <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Receipt className="text-amber-600" size={26} /> Fee invoices
        </h1>
        <p className={`${ui.muted} text-sm mt-1`}>Read-only view. Pay through your parent account or at the finance office.</p>
      </header>

      {loading ? (
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      ) : (
        <>
          <div className={`${ui.card} p-5 mb-6 flex items-center gap-4`}>
            <Banknote className="text-amber-500" size={32} />
            <div>
              <p className={ui.mutedXs}>Total outstanding</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {ETB.format(Number(data.total_balance || 0))}
              </p>
            </div>
          </div>

          {!data.invoices?.length ? (
            <div className={`${ui.card} p-8 text-center`}>
              <p className={ui.muted}>No invoices on your account.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {data.invoices.map((inv) => (
                <li key={inv.id} className={`${ui.card} p-5`}>
                  <div className="flex flex-wrap justify-between gap-3 mb-3">
                    <div>
                      <p className="font-black text-slate-900 dark:text-slate-100">
                        {inv.academic_year || 'Year'}{inv.term ? ` · ${inv.term}` : ''}
                      </p>
                      {inv.due_date && (
                        <p className={`text-xs ${ui.muted}`}>Due {new Date(inv.due_date).toLocaleDateString()}</p>
                      )}
                    </div>
                    <Badge color={statusColor(inv.status)}>{inv.status}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                    <div>
                      <p className={ui.mutedXs}>Billed</p>
                      <p className="font-bold">{ETB.format(Number(inv.amount))}</p>
                    </div>
                    <div>
                      <p className={ui.mutedXs}>Paid</p>
                      <p className="font-bold">{ETB.format(Number(inv.total_paid || 0))}</p>
                    </div>
                    <div>
                      <p className={ui.mutedXs}>Balance</p>
                      <p className="font-bold text-amber-600">{ETB.format(Number(inv.balance || 0))}</p>
                    </div>
                  </div>
                  {Array.isArray(inv.line_items) && inv.line_items.length > 0 && (
                    <ul className={`text-xs ${ui.muted} border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1`}>
                      {inv.line_items.map((li, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{li.name}</span>
                          <span>{ETB.format(Number(li.amount))}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </StudentLayout>
  );
}
