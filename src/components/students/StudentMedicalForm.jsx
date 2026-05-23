import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { studentsApi } from '../../api/services';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'];

const empty = {
  allergies: '',
  conditions: '',
  medications: '',
  chronic_conditions: '',
  blood_type: '',
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
          const allergyList = m.allergies_list || m.allergies_arr;
          const condList = m.conditions_list || m.conditions;
          setForm({
            ...empty,
            ...m,
            blood_type: m.blood_type || m.blood_type_enum || m.blood_group || '',
            allergies: Array.isArray(allergyList) ? allergyList.join(', ') : (m.allergies || ''),
            conditions: Array.isArray(condList) ? condList.join(', ') : (m.chronic_conditions || ''),
            medications: Array.isArray(m.medications) ? JSON.stringify(m.medications, null, 2) : (m.medications || ''),
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
      let medications = form.medications;
      if (typeof medications === 'string' && medications.trim().startsWith('[')) {
        try { medications = JSON.parse(medications); } catch { /* keep string */ }
      }
      await studentsApi.updateMedical(studentId, {
        ...form,
        blood_type: form.blood_type || form.blood_group,
        allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        conditions: (form.conditions || form.chronic_conditions || '').split(',').map((s) => s.trim()).filter(Boolean),
        medications,
      });
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
        <Input label="Allergies (comma-separated)" {...field('allergies')} />
        <Input label="Conditions (comma-separated)" {...field('conditions')} />
        <label className="block text-sm font-bold text-slate-700 md:col-span-2">Medications (JSON array)</label>
        <textarea
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm min-h-[80px] md:col-span-2 font-mono"
          value={form.medications}
          onChange={(e) => setForm((f) => ({ ...f, medications: e.target.value }))}
          placeholder='[{"name":"Ventolin","dosage":"2 puffs","frequency":"as needed"}]'
        />
        <Select
          label="Blood type"
          value={form.blood_type || form.blood_group || ''}
          onChange={(e) => setForm((f) => ({ ...f, blood_type: e.target.value, blood_group: e.target.value }))}
          options={BLOOD_TYPES.map((b) => ({ value: b, label: b }))}
        />
        <Input label="Insurance provider" {...field('insurance_provider')} />
        <Input label="Insurance number" {...field('insurance_number')} />
        <Input label="Physician name" {...field('physician_name')} />
        <Input label="Physician phone" {...field('physician_phone')} />
        <Input label="Last checkup" type="date" {...field('last_checkup_date')} />
      </div>
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Emergency notes</label>
      <textarea
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm min-h-[80px]"
        value={form.emergency_notes}
        onChange={(e) => setForm((f) => ({ ...f, emergency_notes: e.target.value }))}
      />
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Vaccination notes</label>
      <textarea
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm min-h-[80px]"
        value={form.vaccination_notes}
        onChange={(e) => setForm((f) => ({ ...f, vaccination_notes: e.target.value }))}
      />
      {msg && <p className={`text-sm font-medium ${msg.includes('saved') ? 'text-emerald-600' : 'text-rose-500'}`}>{msg}</p>}
      <Button type="submit" loading={saving}>Save medical record</Button>
    </form>
  );
}
