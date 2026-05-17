import { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { settingsApi, notificationsApi } from '../api/services';

const PDF_KEYS = [
  { key: 'id_card', label: 'Student ID card' },
  { key: 'profile', label: 'Student profile' },
  { key: 'report_card', label: 'Report card' },
];

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [scales, setScales] = useState([]);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [scaleForm, setScaleForm] = useState({});
  const [savingScale, setSavingScale] = useState(false);
  const [pdfTemplates, setPdfTemplates] = useState({});
  const [activePdfKey, setActivePdfKey] = useState('id_card');
  const [savingPdf, setSavingPdf] = useState(false);
  const [smsForm, setSmsForm] = useState({ recipient_phone: '', message_body: '' });
  const [smsLog, setSmsLog] = useState([]);

  useEffect(() => {
    settingsApi.get().then((r) => { setSettings(r.data.data); setForm(r.data.data); });
    settingsApi.listGradeScales().then((r) => setScales(r.data.data));
    settingsApi.listPdfTemplates().then((r) => {
      const map = {};
      (r.data.data || []).forEach((t) => { map[t.template_key] = t; });
      setPdfTemplates(map);
    }).catch(() => {});
    notificationsApi.list({ limit: 20 }).then((r) => setSmsLog(r.data.data?.rows || r.data.data || [])).catch(() => {});
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
  const pdfForm = pdfTemplates[activePdfKey] || { template_key: activePdfKey, primary_color: '#059669' };
  const pdfField = (key) => ({
    value: pdfForm[key] ?? '',
    onChange: (e) => setPdfTemplates((m) => ({
      ...m,
      [activePdfKey]: { ...pdfForm, [key]: e.target.value },
    })),
  });

  const savePdfTemplate = async (e) => {
    e.preventDefault();
    setSavingPdf(true);
    try {
      await settingsApi.upsertPdfTemplate(activePdfKey, pdfForm);
      setMsg('PDF template saved.');
    } catch {
      setMsg('Failed to save PDF template.');
    } finally {
      setSavingPdf(false);
    }
  };

  const sendTestSms = async (e) => {
    e.preventDefault();
    try {
      await notificationsApi.sendSms({ phone: smsForm.recipient_phone, message: smsForm.message_body });
      const r = await notificationsApi.list({ limit: 20 });
      setSmsLog(r.data.data?.rows || r.data.data || []);
      setSmsForm({ recipient_phone: '', message_body: '' });
    } catch {
      setMsg('SMS send failed. Check SMS_ENABLED and provider env vars.');
    }
  };

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
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={!!form.sms_enabled} onChange={(e) => setForm((f) => ({ ...f, sms_enabled: e.target.checked }))} />
                Enable SMS notifications
              </label>
              <Input label="SMS sender ID" {...field('sms_sender_id')} />
            </div>
            {msg && <p className={`text-sm font-medium ${msg.includes('success') ? 'text-emerald-600' : 'text-rose-500'}`}>{msg}</p>}
            <Button type="submit" loading={saving}><Save size={15} /> Save Changes</Button>
          </form>
        </section>

        <section className="bg-white border border-slate-100 rounded-3xl p-7">
          <h2 className="text-base font-black text-slate-800 mb-5">PDF templates</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {PDF_KEYS.map((k) => (
              <button
                key={k.key}
                type="button"
                onClick={() => setActivePdfKey(k.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${activePdfKey === k.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                {k.label}
              </button>
            ))}
          </div>
          <form onSubmit={savePdfTemplate} className="space-y-4">
            <Input label="Title" {...pdfField('title')} />
            <Input label="Header text" {...pdfField('header_text')} />
            <Input label="Footer text" {...pdfField('footer_text')} />
            <Input label="Brand color" {...pdfField('primary_color')} placeholder="#059669" />
            <Button type="submit" loading={savingPdf}>Save template</Button>
          </form>
        </section>

        <section className="bg-white border border-slate-100 rounded-3xl p-7">
          <h2 className="text-base font-black text-slate-800 mb-5">SMS</h2>
          <form onSubmit={sendTestSms} className="space-y-4 mb-6">
            <Input label="Phone" value={smsForm.recipient_phone} onChange={(e) => setSmsForm((f) => ({ ...f, recipient_phone: e.target.value }))} placeholder="+251..." required />
            <Input label="Message" value={smsForm.message_body} onChange={(e) => setSmsForm((f) => ({ ...f, message_body: e.target.value }))} required />
            <Button type="submit">Send test SMS</Button>
          </form>
          {smsLog.length > 0 && (
            <ul className="space-y-2 text-sm">
              {smsLog.slice(0, 10).map((row) => (
                <li key={row.id} className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="font-medium truncate max-w-[200px]">{row.recipient_phone}</span>
                  <Badge color={row.status === 'sent' ? 'green' : row.status === 'failed' ? 'red' : 'amber'}>{row.status}</Badge>
                </li>
              ))}
            </ul>
          )}
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
