import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { settingsApi, notificationsApi } from '../api/services';
import GradingScalePanel from '../components/academic/GradingScalePanel';

const PDF_KEYS = [
  { key: 'id_card', label: 'Student ID card' },
  { key: 'profile', label: 'Student profile' },
  { key: 'report_card', label: 'Report card' },
];

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [pdfTemplates, setPdfTemplates] = useState({});
  const [activePdfKey, setActivePdfKey] = useState('id_card');
  const [savingPdf, setSavingPdf] = useState(false);
  const [smsForm, setSmsForm] = useState({ recipient_phone: '', message_body: '' });
  const [smsLog, setSmsLog] = useState([]);

  useEffect(() => {
    settingsApi.get().then((r) => { setSettings(r.data.data); setForm(r.data.data); });
    settingsApi.listPdfTemplates().then((r) => {
      const map = {};
      (r.data.data || []).forEach((t) => { map[t.template_key] = t; });
      setPdfTemplates(map);
    }).catch(() => {});
    notificationsApi.list({ limit: 20 }).then((r) => setSmsLog(r.data.data?.rows || r.data.data || [])).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const payload = {
        name: form.name,
        school_address: form.school_address,
        phone: form.phone,
        email: form.email || null,
        logo_url: form.logo_url || null,
        timezone: form.timezone,
        academic_year_format: form.academic_year_format,
        sms_enabled: !!form.sms_enabled,
        sms_sender_id: form.sms_sender_id || null,
      };
      const res = await settingsApi.update(payload);
      setSettings(res.data.data);
      setForm(res.data.data);
      setMsg('Settings saved successfully.');
    } catch (err) {
      const details = err.response?.data?.details;
      setMsg(
        err.response?.data?.message
        || (details?.length ? details.map((d) => d.message).join(', ') : 'Failed to save settings.')
      );
    } finally {
      setSaving(false);
    }
  };

  const field = (key) => ({ value: form[key] || '', onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) });
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
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Settings</h1>

        {/* School Profile */}
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-7">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100 mb-5">School Profile</h2>
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
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
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

        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-7">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100 mb-5">PDF templates</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {PDF_KEYS.map((k) => (
              <button
                key={k.key}
                type="button"
                onClick={() => setActivePdfKey(k.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${activePdfKey === k.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
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

        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-7">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100 mb-5">SMS</h2>
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

        <GradingScalePanel />
      </div>
    </AdminLayout>
  );
}
