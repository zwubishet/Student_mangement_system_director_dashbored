import { useCallback, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { lessonPlansApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

export default function WeeklyPlansEditor({ annualPlan, readOnly = false }) {
  const { toast } = useToast();
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUnits(annualPlan?.units || []);
    if (annualPlan?.units?.[0]?.id) setSelectedUnitId(annualPlan.units[0].id);
  }, [annualPlan]);

  const loadWeeks = useCallback(async () => {
    if (!selectedUnitId) return;
    setLoading(true);
    try {
      const res = await lessonPlansApi.getUnit(selectedUnitId);
      const data = res.data.data;
      const existing = data.weekly_plans || [];
      setWeeks(
        existing.length
          ? existing
          : [{ week_number: 1, week_start_date: '', topics_summary: '', status: 'planned' }]
      );
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to load weekly plans', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedUnitId, toast]);

  useEffect(() => { loadWeeks(); }, [loadWeeks]);

  const addWeek = () => {
    setWeeks((w) => [
      ...w,
      { week_number: w.length + 1, week_start_date: '', topics_summary: '', status: 'planned' },
    ]);
  };

  const save = async () => {
    if (!selectedUnitId) return;
    setSaving(true);
    try {
      await lessonPlansApi.saveWeekly(selectedUnitId, {
        weeks: weeks.map((w, i) => ({
          week_number: w.week_number || i + 1,
          week_start_date: w.week_start_date || null,
          topics_summary: w.topics_summary,
          status: w.status || 'planned',
        })),
      });
      toast('Weekly plans saved', 'success');
      loadWeeks();
    } catch (e) {
      toast(e.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!annualPlan?.id) {
    return <p className={ui.muted}>Save an annual plan with units before adding weekly plans.</p>;
  }

  return (
    <div className="space-y-4">
      <Select
        label="Unit (chapter)"
        value={selectedUnitId}
        onChange={(e) => setSelectedUnitId(e.target.value)}
        options={units.map((u) => ({
          value: u.id,
          label: `Unit ${u.unit_number}: ${u.unit_title}`,
        }))}
      />

      {loading ? (
        <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      ) : (
        <div className={`${ui.panel} space-y-3`}>
          {weeks.map((w, i) => (
            <div
              key={i}
              className="grid sm:grid-cols-12 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
            >
              <span className="sm:col-span-1 text-xs font-black text-slate-500 pt-2">W{w.week_number}</span>
              <input
                type="date"
                className={`${ui.input} sm:col-span-2`}
                value={w.week_start_date?.slice?.(0, 10) || w.week_start_date || ''}
                disabled={readOnly}
                onChange={(e) => {
                  const next = [...weeks];
                  next[i] = { ...w, week_start_date: e.target.value };
                  setWeeks(next);
                }}
              />
              <input
                className={`${ui.input} sm:col-span-6`}
                placeholder="Topics / activities this week"
                value={w.topics_summary || ''}
                disabled={readOnly}
                onChange={(e) => {
                  const next = [...weeks];
                  next[i] = { ...w, topics_summary: e.target.value };
                  setWeeks(next);
                }}
              />
              <select
                className={`${ui.select} sm:col-span-3`}
                value={w.status || 'planned'}
                disabled={readOnly}
                onChange={(e) => {
                  const next = [...weeks];
                  next[i] = { ...w, status: e.target.value };
                  setWeeks(next);
                }}
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          ))}
          {!readOnly && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="secondary" onClick={addWeek}>Add week</Button>
              <Button size="sm" onClick={save} loading={saving}>
                <Save size={14} /> Save weekly plan
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
