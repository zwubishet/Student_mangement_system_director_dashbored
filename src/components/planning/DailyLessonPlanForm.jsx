import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { ui } from '../../theme/tokens';

const EMPTY = {
  plan_date: new Date().toISOString().slice(0, 10),
  duration_minutes: 50,
  unit_title: '',
  sub_unit: '',
  topic: '',
  students_male: '',
  students_female: '',
  general_objective: '',
  specific_objectives_text: '',
  materials_text: '',
  pre_knowledge: '',
  introduction: '',
  main_activity: '',
  practice_activity: '',
  closure_summary: '',
  assessment_method: '',
  homework: '',
};

export function planToForm(p) {
  if (!p) return { ...EMPTY };
  const objs = Array.isArray(p.specific_objectives) ? p.specific_objectives : [];
  const mats = Array.isArray(p.materials) ? p.materials : [];
  return {
    ...EMPTY,
    ...p,
    plan_date: p.plan_date?.slice?.(0, 10) || p.plan_date,
    specific_objectives_text: objs.join('\n'),
    materials_text: mats.join('\n'),
  };
}

export function formToPayload(form, meta) {
  return {
    ...meta,
    ...form,
    students_male: Number(form.students_male) || 0,
    students_female: Number(form.students_female) || 0,
    duration_minutes: Number(form.duration_minutes) || 50,
    specific_objectives: form.specific_objectives_text
      .split('\n').map((s) => s.trim()).filter(Boolean),
    materials: form.materials_text.split('\n').map((s) => s.trim()).filter(Boolean),
  };
}

export default function DailyLessonPlanForm({ initial, meta, onSave, onMarkTaught, saving }) {
  const [form, setForm] = useState(() => planToForm(initial));
  const field = (k) => ({
    value: form[k] ?? '',
    onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })),
  });

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSave?.(formToPayload(form, meta));
      }}
    >
      <div className={ui.alertInfo}>
        <p className="text-sm font-bold">Ethiopian daily plan (የዕለት ትምህርት እቅድ)</p>
        <p className="text-xs mt-1 opacity-90">Typical 50 min: Introduction 5 · Main 30 · Practice 10 · Closure 5</p>
      </div>

      <section className={`${ui.panel} space-y-3`}>
        <p className={ui.mutedXs}>I. Header</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Input label="Date" type="date" required {...field('plan_date')} />
          <Input label="Duration (min)" type="number" {...field('duration_minutes')} />
          <Input label="Period #" type="number" {...field('period_number')} />
          <Input label="Unit" {...field('unit_title')} />
          <Input label="Sub-unit" {...field('sub_unit')} />
          <Input label="Topic" required {...field('topic')} />
          <Input label="Male students" type="number" {...field('students_male')} />
          <Input label="Female students" type="number" {...field('students_female')} />
        </div>
      </section>

      <section className={`${ui.panel} space-y-3`}>
        <p className={ui.mutedXs}>II. Objectives</p>
        <label className="block">
          <span className={ui.fieldLabel}>General objective (unit level)</span>
          <textarea className={`${ui.input} mt-1`} rows={2} {...field('general_objective')} />
        </label>
        <label className="block">
          <span className={ui.fieldLabel}>Specific objectives (one per line — Bloom verbs)</span>
          <textarea className={`${ui.input} mt-1 min-h-[80px]`} {...field('specific_objectives_text')} placeholder="Students will be able to…" />
        </label>
      </section>

      <section className={`${ui.panel} space-y-3`}>
        <p className={ui.mutedXs}>III–IV. Materials & pre-knowledge</p>
        <label className="block">
          <span className={ui.fieldLabel}>Teaching materials (one per line)</span>
          <textarea className={`${ui.input} mt-1`} {...field('materials_text')} placeholder="Textbook p.12&#10;Chart…" />
        </label>
        <label className="block">
          <span className={ui.fieldLabel}>Pre-knowledge / review</span>
          <textarea className={`${ui.input} mt-1`} rows={2} {...field('pre_knowledge')} />
        </label>
      </section>

      <section className={`${ui.panel} space-y-3`}>
        <p className={ui.mutedXs}>V–VIII. Lesson flow</p>
        {[
          ['introduction', 'Introduction (~5 min)', 2],
          ['main_activity', 'Main activity (~30 min)', 3],
          ['practice_activity', 'Practice / application (~10 min)', 2],
          ['closure_summary', 'Closure / summary (~5 min)', 2],
        ].map(([key, label, rows]) => (
          <label key={key} className="block">
            <span className={ui.fieldLabel}>{label}</span>
            <textarea className={`${ui.input} mt-1`} rows={rows} {...field(key)} />
          </label>
        ))}
      </section>

      <section className={`${ui.panel} space-y-3`}>
        <p className={ui.mutedXs}>IX. Assessment & homework</p>
        <Input label="Assessment method" {...field('assessment_method')} />
        <label className="block">
          <span className={ui.fieldLabel}>Homework</span>
          <textarea className={`${ui.input} mt-1`} rows={2} {...field('homework')} />
        </label>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={saving}>Save plan</Button>
        {initial?.id && onMarkTaught && (
          <Button type="button" variant="secondary" onClick={() => onMarkTaught(initial.id)} loading={saving}>
            Mark as taught
          </Button>
        )}
      </div>
    </form>
  );
}
