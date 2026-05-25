import { useEffect, useMemo, useState } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import StudentLayout from '../../components/layouts/StudentLayout';
import Button from '../../components/ui/Button';
import { studentPortalApi } from '../../api/services';
import { ui } from '../../theme/tokens';

const DAY_LABELS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StudentTimetablePage() {
  const [data, setData] = useState({ slots: [], section: null });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    studentPortalApi.timetable()
      .then((r) => setData(r.data.data || { slots: [], section: null }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const byDay = useMemo(() => {
    const map = {};
    for (const s of data.slots || []) {
      const d = s.day_of_week ?? 1;
      if (!map[d]) map[d] = [];
      map[d].push(s);
    }
    return map;
  }, [data.slots]);

  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);

  return (
    <StudentLayout>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Calendar className="text-sky-600" size={26} /> Class schedule
        </h1>
        <Button variant="secondary" size="sm" onClick={load}><RefreshCw size={16} /> Refresh</Button>
      </header>

      {loading ? (
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      ) : !data.slots?.length ? (
        <div className={`${ui.card} p-8 text-center`}>
          <p className={ui.muted}>No timetable published for your section yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => (
            <div key={day} className={`${ui.card} overflow-hidden p-0`}>
              <div className="px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase tracking-widest">
                {DAY_LABELS[day] ?? `Day ${day}`}
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {byDay[day].map((s) => (
                  <li key={s.id} className="p-4">
                    <p className="text-xs text-sky-600 font-bold">Period {s.period_number}</p>
                    <p className="font-black text-sm text-slate-900 dark:text-slate-100">{s.subject_name}</p>
                    {s.teacher_name && <p className={`text-xs ${ui.muted}`}>{s.teacher_name}</p>}
                    {(s.start_time || s.end_time) && (
                      <p className={`text-xs ${ui.muted} mt-1`}>{s.start_time?.slice?.(0, 5)} – {s.end_time?.slice?.(0, 5)}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}
