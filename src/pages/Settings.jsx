import { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { settingsApi } from '../api/services';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [scales, setScales] = useState([]);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [scaleForm, setScaleForm] = useState({});
  const [savingScale, setSavingScale] = useState(false);

  useEffect(() => {
    settingsApi.get().then((r) => { setSettings(r.data.data); setForm(r.data.data); });
    settingsApi.listGradeScales().then((r) => setScales(r.data.data));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await settingsApi.update(form);
      setMsg('Settings saved successfully.');
    } catch { setMsg('Failed to save settings.'); }
    finally { setSaving(false); }
  };

  const handleCreateScale = async (e) => {
    e.preventDefault();
    setSavingScale(true);
    try {
      await settingsApi.createGradeScale({ ...scaleForm, min_score: Number(scaleForm.min_score), max_score: Number(scaleForm.max_score), gpa_points: Number(scaleForm.gpa_points) });
      const r = await settingsApi.listGradeScales();
      setScales(r.data.data);
      setShowScaleModal(false); setScaleForm({});
    } catch {} finally { setSavingScale(false); }
  };

  const handleDeleteScale = async (id) => {
    await settingsApi.deleteGradeScale(id);
    setScales((s) => s.filter((x) => x.id !== id));
  };

  const field = (key) => ({ value: form[key] || '', onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) });
  const sf = (key) => ({ value: scaleForm[key] || '', onChange: (e) => setScaleForm((f) => ({ ...f, [key]: e.target.value })) });

  if (!settings) return <AdminLayout><div className="h-32 bg-slate-50 rounded-2xl animate-pulse" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-3xl">
        <h1 className="text-2xl font-black text-slate-900">Settings</h1>

        {/* School Profile */}
        <section className="bg-white border border-slate-100 rounded-3xl p-7">
          <h2 className="text-base font-black text-slate-800 mb-5">School Profile</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="School Name" {...field('name')} />
              <Input label="Email" type="email" {...field('email')} />
            </div>
            <Input label="Address" {...field('school_address')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Phone" {...field('phone')} />
              <Input label="Timezone" {...field('timezone')} />
            </div>
            {msg && <p className={`text-sm font-medium ${msg.includes('success') ? 'text-emerald-600' : 'text-rose-500'}`}>{msg}</p>}
            <Button type="submit" loading={saving}><Save size={15} /> Save Changes</Button>
          </form>
        </section>

        {/* Grade Scales */}
        <section className="bg-white border border-slate-100 rounded-3xl p-7">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-black text-slate-800">Grade Scales</h2>
            <Button size="sm" onClick={() => setShowScaleModal(true)}><Plus size={14} /> Add Scale</Button>
          </div>
          {scales.length === 0 ? (
            <p className="text-slate-400 text-sm">No grade scales configured.</p>
          ) : (
            <div className="space-y-2">
              {scales.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Badge color="blue">{s.grade_letter}</Badge>
                    <span className="text-sm font-bold text-slate-700">{s.name}</span>
                    <span className="text-xs text-slate-400">{s.min_score}–{s.max_score}%</span>
                    {s.gpa_points && <span className="text-xs text-slate-400">GPA: {s.gpa_points}</span>}
                  </div>
                  <button onClick={() => handleDeleteScale(s.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal open={showScaleModal} onClose={() => setShowScaleModal(false)} title="Add Grade Scale" size="sm">
        <form onSubmit={handleCreateScale} className="space-y-4">
          <Input label="Name (e.g. Excellent)" required {...sf('name')} />
          <Input label="Grade Letter (e.g. A)" required {...sf('grade_letter')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Score %" type="number" required {...sf('min_score')} />
            <Input label="Max Score %" type="number" required {...sf('max_score')} />
          </div>
          <Input label="GPA Points" type="number" step="0.1" {...sf('gpa_points')} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={savingScale}>Add Scale</Button>
            <Button type="button" variant="secondary" onClick={() => setShowScaleModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
