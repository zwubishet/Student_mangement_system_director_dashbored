import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Plus, Trash2, User } from 'lucide-react';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { catalogApi, teachersApi } from '../../api/services';

const DAY_LABELS = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
const PERIOD_DEFAULTS = {
  1: { start: '08:00', end: '08:45' },
  2: { start: '08:50', end: '09:35' },
  3: { start: '09:40', end: '10:25' },
  4: { start: '10:45', end: '11:30' },
  5: { start: '11:35', end: '12:20' },
  6: { start: '13:00', end: '13:45' },
  7: { start: '13:50', end: '14:35' },
  8: { start: '14:40', end: '15:25' },
};

const errMsg = (e) => e.response?.data?.message || 'Request failed';

export default function SectionTimetablePanel({
  sectionId,
  sectionName,
  gradeName,
  academicYearId,
  academicYearName,
  linkedClasses = [],
  onNeedClass,
}) {
  const [bundle, setBundle] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    day_of_week: 1,
    period_number: 1,
    subject_id: '',
    teacher_id: '',
    start_time: '08:00',
    end_time: '08:45',
  });

  const classForYear = useMemo(
    () => linkedClasses.find((c) => c.academic_year_id === academicYearId) || bundle?.class,
    [linkedClasses, academicYearId, bundle?.class]
  );

  const load = useCallback(async () => {
    if (!sectionId) return;
    setLoading(true);
    setError('');
    try {
      const [ttRes, subRes, teachRes] = await Promise.all([
        catalogApi.getTimetable({ section_id: sectionId, academic_year_id: academicYearId || undefined }),
        catalogApi.getSubjects(),
        teachersApi.list({ page: 1, limit: 200, status: 'active' }),
      ]);
      setBundle(ttRes.data.data);
      setSubjects(subRes.data.data || []);
      setTeachers(teachRes.data.data || []);
    } catch (e) {
      setError(errMsg(e));
      setBundle(null);
    } finally {
      setLoading(false);
    }
  }, [sectionId, academicYearId]);

  useEffect(() => { load(); }, [load]);

  const slots = bundle?.slots || [];

  const grid = useMemo(() => {
    const map = {};
    for (const s of slots) {
      const key = `${s.day_of_week}-${s.period_number}`;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [slots]);

  const handlePeriodChange = (period) => {
    const d = PERIOD_DEFAULTS[period] || PERIOD_DEFAULTS[1];
    setForm((f) => ({ ...f, period_number: period, start_time: d.start, end_time: d.end }));
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!classForYear?.id) {
      setError('Create a class instance for this section and year first.');
      onNeedClass?.();
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await catalogApi.addTimetableSlot({
        class_id: classForYear.id,
        subject_id: form.subject_id,
        teacher_id: form.teacher_id || null,
        day_of_week: Number(form.day_of_week),
        period_number: Number(form.period_number),
        start_time: form.start_time,
        end_time: form.end_time,
      });
      setSuccess('Period added to timetable.');
      setShowForm(false);
      setForm((f) => ({ ...f, subject_id: '', teacher_id: '' }));
      await load();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Remove this timetable period?')) return;
    try {
      await catalogApi.deleteTimetableSlot(slotId);
      setSuccess('Period removed.');
      await load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  if (loading) {
    return <div className="h-40 bg-slate-50 rounded-2xl border animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="text-emerald-600" size={18} />
            Class timetable
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {gradeName} · Section {sectionName}
            {academicYearName ? ` · ${academicYearName}` : ''}
            {' '}— weekly teaching periods (not exam schedules).
          </p>
        </div>
        <Badge color="blue">{slots.length} period{slots.length === 1 ? '' : 's'}</Badge>
      </div>

      {error && <p className="text-sm text-rose-700 bg-rose-50 px-3 py-2 rounded-xl">{error}</p>}
      {success && <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl">{success}</p>}

      {!classForYear ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-900">
          <p className="font-bold">No class for {academicYearName || 'this year'}</p>
          <p className="mt-1 text-amber-800/90">Create a class instance first, then add Mon–Sat period slots here.</p>
          {onNeedClass && (
            <Button size="sm" className="mt-3" onClick={onNeedClass}>
              <Plus size={14} /> Create class for year
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500">
            Timetable applies to class: <strong>{classForYear.academic_year}</strong>
            {classForYear.enrolled_count != null && ` · ${classForYear.enrolled_count} students`}
          </p>

          {!showForm ? (
            <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} /> Add period</Button>
          ) : (
            <form onSubmit={handleAddSlot} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
              <p className="text-xs font-black uppercase text-slate-400">New period</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Select
                  label="Day"
                  value={String(form.day_of_week)}
                  onChange={(e) => setForm((f) => ({ ...f, day_of_week: Number(e.target.value) }))}
                  options={Object.entries(DAY_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                />
                <Select
                  label="Period #"
                  value={String(form.period_number)}
                  onChange={(e) => handlePeriodChange(Number(e.target.value))}
                  options={[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ value: String(n), label: `Period ${n}` }))}
                />
                <Input label="Start" type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
                <Input label="End" type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Select
                  label="Subject"
                  required
                  value={form.subject_id}
                  onChange={(e) => setForm((f) => ({ ...f, subject_id: e.target.value }))}
                  options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                  placeholder="Select subject"
                />
                <Select
                  label="Teacher"
                  value={form.teacher_id}
                  onChange={(e) => setForm((f) => ({ ...f, teacher_id: e.target.value }))}
                  options={[{ value: '', label: '— Unassigned —' }, ...teachers.map((t) => ({
                    value: t.user_id || t.id,
                    label: `${t.first_name} ${t.last_name}`,
                  }))]}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" loading={saving} size="sm">Save period</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {slots.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-2xl border border-dashed">
              No periods yet. Add Mathematics on Monday Period 1, etc.
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase">
                    <th className="p-2 text-left w-20">Period</th>
                    {[1, 2, 3, 4, 5, 6].map((d) => (
                      <th key={d} className="p-2 text-center">{DAY_LABELS[d]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                    <tr key={period} className="border-t border-slate-100 dark:border-slate-800 dark:border-slate-800">
                      <td className="p-2 text-xs font-bold text-slate-500 bg-slate-50">P{period}</td>
                      {[1, 2, 3, 4, 5, 6].map((day) => {
                        const cell = grid[`${day}-${period}`] || [];
                        return (
                          <td key={day} className="p-1 align-top min-w-[100px]">
                            {cell.map((slot) => (
                              <div
                                key={slot.id}
                                className="mb-1 p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-xs group relative"
                              >
                                <p className="font-bold text-emerald-900 truncate">{slot.subject_name}</p>
                                <p className="text-slate-600 truncate flex items-center gap-0.5">
                                  <User size={10} />
                                  {slot.teacher_first_name
                                    ? `${slot.teacher_first_name} ${slot.teacher_last_name?.[0] || ''}.`
                                    : 'TBA'}
                                </p>
                                <p className="text-slate-400 flex items-center gap-0.5">
                                  <Clock size={10} />
                                  {slot.start_time?.slice?.(0, 5)}–{slot.end_time?.slice?.(0, 5)}
                                </p>
                                <button
                                  type="button"
                                  title="Remove"
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-rose-500"
                                  onClick={() => handleDelete(slot.id)}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <ul className="space-y-2 lg:hidden">
            {slots.map((s) => (
              <li key={s.id} className="flex justify-between items-start p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm">
                <div>
                  <p className="font-bold">{DAY_LABELS[s.day_of_week]} · Period {s.period_number}</p>
                  <p>{s.subject_name} · {s.teacher_first_name || 'TBA'} {s.teacher_last_name || ''}</p>
                  <p className="text-xs text-slate-400">{s.start_time?.slice?.(0, 5)} – {s.end_time?.slice?.(0, 5)}</p>
                </div>
                <button type="button" className="text-rose-500" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
