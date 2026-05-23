import { useCallback, useEffect, useState } from 'react';
import { Plus, Save, Send, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { lessonPlansApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';
import { ETHIOPIA_MONTHS, PLAN_STATUS_COLORS } from './planningConstants';

const emptyMonth = (n) => ({
  month_number: n,
  topic_title: '',
  periods_allocated: 0,
  notes: '',
  sort_order: 0,
});

const emptyUnit = (n) => ({
  unit_number: n,
  unit_title: '',
  periods_allocated: 1,
  general_objectives: '',
  sequence_order: n,
});

export default function AnnualPlanWizard({
  assignment,
  termId,
  teacherId,
  readOnly = false,
  onSaved,
}) {
  const { toast } = useToast();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [totalPeriods, setTotalPeriods] = useState('');
  const [months, setMonths] = useState(ETHIOPIA_MONTHS.map((m) => emptyMonth(m.month_number)));
  const [units, setUnits] = useState([emptyUnit(1)]);

  const loadExisting = useCallback(async () => {
    if (!assignment?.section_id || !assignment?.subject_id || !termId) return;
    setLoading(true);
    try {
      const list = await lessonPlansApi.listAnnual({
        academic_year_id: assignment.academic_year_id,
        teacher_id: teacherId,
        section_id: assignment.section_id,
        subject_id: assignment.subject_id,
      });
      const rows = list.data.data || [];
      const match = rows.find((p) => p.term_id === termId);
      if (!match) {
        setPlan(null);
        setTitle(`${assignment.subject_name} — Annual Plan`);
        setMonths(ETHIOPIA_MONTHS.map((m) => emptyMonth(m.month_number)));
        setUnits([emptyUnit(1)]);
        return;
      }
      const full = await lessonPlansApi.getAnnual(match.id);
      const data = full.data.data;
      setPlan(data);
      setTitle(data.title || '');
      setTotalPeriods(data.total_periods_year || '');
      setMonths(
        data.months?.length
          ? data.months
          : ETHIOPIA_MONTHS.map((m) => emptyMonth(m.month_number))
      );
      setUnits(data.units?.length ? data.units : [emptyUnit(1)]);
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to load annual plan', 'error');
    } finally {
      setLoading(false);
    }
  }, [assignment, termId, teacherId, toast]);

  useEffect(() => { loadExisting(); }, [loadExisting]);

  const save = async (andSubmit = false) => {
    if (!assignment || !termId || !teacherId) return;
    setSaving(true);
    try {
      const payload = {
        id: plan?.id,
        academic_year_id: assignment.academic_year_id,
        term_id: termId,
        section_id: assignment.section_id,
        subject_id: assignment.subject_id,
        teacher_id: teacherId,
        title,
        total_periods_year: Number(totalPeriods) || null,
        months: months.filter((m) => m.topic_title?.trim()),
        units: units.filter((u) => u.unit_title?.trim()),
      };
      const res = await lessonPlansApi.saveAnnual(payload);
      const saved = res.data.data;
      setPlan(saved);
      if (andSubmit && saved?.id) {
        await lessonPlansApi.submitAnnual(saved.id);
        toast('Annual plan submitted to director', 'success');
      } else {
        toast('Annual plan saved', 'success');
      }
      onSaved?.(saved);
      loadExisting();
    } catch (e) {
      toast(e.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!assignment) {
    return <p className={ui.muted}>Select a class assignment from your timetable first.</p>;
  }

  if (loading) {
    return <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />;
  }

  const statusClass = PLAN_STATUS_COLORS[plan?.status] || PLAN_STATUS_COLORS.draft;

  return (
    <div className="space-y-6">
      <div className={`${ui.alertInfo} flex flex-wrap justify-between gap-3`}>
        <div>
          <p className="font-bold text-sm">የዓመት የትምህርት እቅድ — Annual plan</p>
          <p className="text-xs mt-1 opacity-90">
            {assignment.grade_name} {assignment.section_name} · {assignment.subject_name}
          </p>
        </div>
        {plan?.status && (
          <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${statusClass}`}>
            {plan.status}
          </span>
        )}
      </div>

      <div className={`${ui.panel} grid sm:grid-cols-2 gap-4`}>
        <Input label="Plan title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={readOnly} />
        <Input
          label="Total periods (year)"
          type="number"
          value={totalPeriods}
          onChange={(e) => setTotalPeriods(e.target.value)}
          disabled={readOnly}
        />
      </div>

      <section className={ui.panel}>
        <p className={ui.panelTitle}>Monthly topics (MoE syllabus alignment)</p>
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {months.map((m, i) => (
            <div key={m.month_number} className="grid sm:grid-cols-12 gap-2 items-center">
              <span className="sm:col-span-2 text-xs font-bold text-slate-500">
                {ETHIOPIA_MONTHS.find((x) => x.month_number === m.month_number)?.label || `M${m.month_number}`}
              </span>
              <input
                className={`${ui.input} sm:col-span-7`}
                placeholder="Topic for this month"
                value={m.topic_title}
                disabled={readOnly}
                onChange={(e) => {
                  const next = [...months];
                  next[i] = { ...m, topic_title: e.target.value };
                  setMonths(next);
                }}
              />
              <input
                className={`${ui.input} sm:col-span-3`}
                type="number"
                placeholder="Periods"
                value={m.periods_allocated}
                disabled={readOnly}
                onChange={(e) => {
                  const next = [...months];
                  next[i] = { ...m, periods_allocated: Number(e.target.value) || 0 };
                  setMonths(next);
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={ui.panel}>
        <div className="flex justify-between items-center mb-4">
          <p className={ui.panelTitle}>Unit plans (chapters)</p>
          {!readOnly && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setUnits((u) => [...u, emptyUnit(u.length + 1)])}
            >
              <Plus size={14} /> Add unit
            </Button>
          )}
        </div>
        <div className="space-y-4">
          {units.map((u, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex gap-2 items-start">
                <span className="text-xs font-black text-emerald-600 mt-2">U{u.unit_number}</span>
                <div className="flex-1 grid sm:grid-cols-2 gap-2">
                  <Input
                    label="Chapter / unit title"
                    value={u.unit_title}
                    disabled={readOnly}
                    onChange={(e) => {
                      const next = [...units];
                      next[i] = { ...u, unit_title: e.target.value };
                      setUnits(next);
                    }}
                  />
                  <Input
                    label="Periods"
                    type="number"
                    value={u.periods_allocated}
                    disabled={readOnly}
                    onChange={(e) => {
                      const next = [...units];
                      next[i] = { ...u, periods_allocated: Number(e.target.value) || 1 };
                      setUnits(next);
                    }}
                  />
                </div>
                {!readOnly && units.length > 1 && (
                  <button
                    type="button"
                    className="p-2 text-rose-500"
                    onClick={() => setUnits(units.filter((_, j) => j !== i))}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <label className="block">
                <span className={ui.fieldLabel}>General objectives (annual verbs)</span>
                <textarea
                  className={`${ui.input} mt-1 min-h-[60px]`}
                  value={u.general_objectives || ''}
                  disabled={readOnly}
                  onChange={(e) => {
                    const next = [...units];
                    next[i] = { ...u, general_objectives: e.target.value };
                    setUnits(next);
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => save(false)} loading={saving}>
            <Save size={16} /> Save draft
          </Button>
          {plan?.status !== 'submitted' && plan?.status !== 'approved' && (
            <Button variant="secondary" onClick={() => save(true)} loading={saving}>
              <Send size={16} /> Submit to director
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
