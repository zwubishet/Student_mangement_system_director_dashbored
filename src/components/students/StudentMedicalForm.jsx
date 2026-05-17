import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { studentsApi } from '../../api/services';

const empty = {
  allergies: '',
  medications: '',
  chronic_conditions: '',
  blood_group: '',
  insurance_provider: '',
  insurance_number: '',
  physician_name: '',
  physician_phone: '',
  emergency_notes: '',
  last_checkup_date: '',
  vaccination_notes: '',
};

export default function StudentMedicalForm({ studentId, initial }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        ...empty,
        ...initial,
        last_checkup_date: initial.last_checkup_date?.slice?.(0, 10) || '',
      });
    } else {
      studentsApi.getMedical(studentId).then((r) => {
        const m = r.data.data;
        if (m) {
          setForm({
            ...empty,
            ...m,
            last_checkup_date: m.last_checkup_date?.slice?.(0, 10) || '',
          });
        }
      }).catch(() => {});
    }
  }, [studentId, initial]);

  const field = (key) => ({
    value: form[key] || '',
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await studentsApi.updateMedical(studentId, form);
      setMsg('Medical record saved.');
    } catch {
      setMsg('Failed to save medical record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Allergies" {...field('allergies')} />
        <Input label="Medications" {...field('medications')} />
        <Input label="Chronic conditions" {...field('chronic_conditions')} />
        <Input label="Blood group" {...field('blood_group')} />
        <Input label="Insurance provider" {...field('insurance_provider')} />
        <Input label="Insurance number" {...field('insurance_number')} />
        <Input label="Physician name" {...field('physician_name')} />
        <Input label="Physician phone" {...field('physician_phone')} />
        <Input label="Last checkup" type="date" {...field('last_checkup_date')} />
      </div>
      <label className="block text-sm font-bold text-slate-700">Emergency notes</label>
      <textarea
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm min-h-[80px]"
        value={form.emergency_notes}
        onChange={(e) => setForm((f) => ({ ...f, emergency_notes: e.target.value }))}
      />
      <label className="block text-sm font-bold text-slate-700">Vaccination notes</label>
      <textarea
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm min-h-[80px]"
        value={form.vaccination_notes}
        onChange={(e) => setForm((f) => ({ ...f, vaccination_notes: e.target.value }))}
      />
      {msg && <p className={`text-sm font-medium ${msg.includes('saved') ? 'text-emerald-600' : 'text-rose-500'}`}>{msg}</p>}
      <Button type="submit" loading={saving}>Save medical record</Button>
    </form>
  );
}
