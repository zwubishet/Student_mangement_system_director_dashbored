import { useEffect, useMemo, useState } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import Button from '../../components/ui/Button';
import { teacherPortalApi } from '../../api/services';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TeacherTimetablePage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    teacherPortalApi.getTimetable()
      .then((r) => setSlots(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const byDay = useMemo(() => {
    const map = {};
    for (const s of slots) {
      const d = s.day_of_week ?? 1;
      if (!map[d]) map[d] = [];
      map[d].push(s);
    }
    return map;
  }, [slots]);

  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);

  return (
    <TeacherLayout title="My timetable" subtitle="Read-only schedule from academic setup">
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Calendar className="text-emerald-600" size={26} /> Timetable
          </h1>
          <Button variant="secondary" size="sm" onClick={load}><RefreshCw size={16} /> Refresh</Button>
        </header>

        {loading ? (
          <div className="h-48 bg-white rounded-3xl border animate-pulse" />
        ) : slots.length === 0 ? (
          <div className="bg-slate-50 border rounded-2xl p-8 text-center text-slate-500 text-sm">
            No timetable slots assigned to you yet. Ask the school admin to configure the class timetable.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {days.map((day) => (
              <div key={day} className="bg-white border rounded-2xl overflow-hidden">
                <div className="px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase tracking-widest">
                  {DAY_LABELS[day] ?? `Day ${day}`}
                </div>
                <ul className="divide-y divide-slate-50">
                  {byDay[day].map((s) => (
                    <li key={s.id} className="p-4">
                      <p className="text-xs text-emerald-600 font-bold">Period {s.period_number}</p>
                      <p className="font-black text-sm">{s.subject_name}</p>
                      <p className="text-xs text-slate-500">{s.grade_name} · {s.class_name || s.section_name}</p>
                      {(s.start_time || s.end_time) && (
                        <p className="text-xs text-slate-400 mt-1">{s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
