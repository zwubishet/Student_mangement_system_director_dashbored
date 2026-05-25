import { useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import StudentLayout from '../../components/layouts/StudentLayout';
import Badge from '../../components/ui/Badge';
import { studentPortalApi } from '../../api/services';
import { ui } from '../../theme/tokens';

const statusColor = (s) => {
  if (s === 'present') return 'green';
  if (s === 'absent') return 'red';
  if (s === 'late') return 'amber';
  return 'gray';
};

export default function StudentAttendancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentPortalApi.attendance({ days: 60 })
      .then((r) => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <StudentLayout>
      <header className="mb-6">
        <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <ClipboardCheck className="text-emerald-600" size={26} /> Attendance
        </h1>
        <p className={`${ui.muted} text-sm mt-1`}>Last {data?.days ?? 60} days</p>
      </header>

      {loading ? (
        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      ) : (
        <>
          <div className={`${ui.card} p-5 mb-6 flex flex-wrap gap-6`}>
            <div>
              <p className={ui.mutedXs}>Attendance rate</p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {data?.summary?.rate != null ? `${data.summary.rate}%` : '—'}
              </p>
            </div>
            <div>
              <p className={ui.mutedXs}>Present</p>
              <p className="text-2xl font-black">{data?.summary?.present ?? 0}</p>
            </div>
            <div>
              <p className={ui.mutedXs}>Total marked</p>
              <p className="text-2xl font-black">{data?.summary?.total ?? 0}</p>
            </div>
          </div>

          {data?.by_status?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {data.by_status.map((r) => (
                <Badge key={r.status} color={statusColor(r.status)}>
                  {r.status}: {r.count}
                </Badge>
              ))}
            </div>
          )}

          <div className={`${ui.card} overflow-hidden`}>
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 font-black text-sm">Recent days</div>
            {!data?.recent?.length ? (
              <p className={`p-6 text-sm ${ui.muted}`}>No attendance records yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent.map((row) => (
                  <li key={row.date} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <Badge color={statusColor(row.status)}>{row.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </StudentLayout>
  );
}
