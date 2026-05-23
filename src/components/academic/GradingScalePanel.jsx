import { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { gradingApi } from '../../api/services';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

const DEFAULT_BANDS = [
  { letter_grade: 'A', display_label: 'Excellent', min_score: 90, max_score: 100, grade_points: 4, is_pass: true, sort_order: 1 },
  { letter_grade: 'B', display_label: 'Very Good', min_score: 80, max_score: 89.99, grade_points: 3, is_pass: true, sort_order: 2 },
  { letter_grade: 'C', display_label: 'Good', min_score: 70, max_score: 79.99, grade_points: 2, is_pass: true, sort_order: 3 },
  { letter_grade: 'D', display_label: 'Satisfactory', min_score: 60, max_score: 69.99, grade_points: 1, is_pass: true, sort_order: 4 },
  { letter_grade: 'F', display_label: 'Fail', min_score: 0, max_score: 59.99, grade_points: 0, is_pass: false, sort_order: 5 },
];

const errMsg = (e) => e.response?.data?.message || 'Request failed';

export default function GradingScalePanel() {
  const [scale, setScale] = useState({ profile: null, bands: [] });
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewScore, setPreviewScore] = useState('75');
  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bands, setBands] = useState(DEFAULT_BANDS);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [activeRes, profRes] = await Promise.all([
        gradingApi.getActiveScale(),
        gradingApi.listScaleProfiles(),
      ]);
      setScale(activeRes.data.data || { bands: [] });
      setProfiles(profRes.data.data || []);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runPreview = async () => {
    const res = await gradingApi.previewGrade(previewScore, 100);
    setPreview(res.data.data);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    try {
      await gradingApi.createScaleProfile({
        name: 'Ethiopian Standard',
        scale_type: 'percentage',
        boundary_rule: 'inclusive_max',
        activate: true,
        bands: bands.map((b, i) => ({
          ...b,
          min_score: Number(b.min_score),
          max_score: Number(b.max_score),
          grade_points: Number(b.grade_points),
          sort_order: i + 1,
        })),
      });
      setShowModal(false);
      await load();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const updateBand = (idx, key, val) => {
    setBands((prev) => prev.map((b, i) => (i === idx ? { ...b, [key]: val } : b)));
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-800">Grading scale (Ethiopian)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Used for all exams via <code className="text-emerald-600">/api/v1/grading/grading-scales</code>
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={load}><RefreshCw size={14} /></Button>
          <Button size="sm" onClick={() => { setBands(DEFAULT_BANDS); setShowModal(true); }}>
            <Plus size={14} /> New version
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-xl">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-400 animate-pulse">Loading scale…</p>
      ) : (
        <>
          {scale.profile && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Active: <strong>{scale.profile.name}</strong> v{scale.profile.version}
              {scale.profile.is_active && <Badge color="green" className="ml-2">Active</Badge>}
            </p>
          )}

          <div className="overflow-x-auto border rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-2 text-left">Grade</th>
                  <th className="p-2 text-left">Label</th>
                  <th className="p-2">Range %</th>
                  <th className="p-2">GPA</th>
                  <th className="p-2">Pass</th>
                </tr>
              </thead>
              <tbody>
                {(scale.bands || []).map((b) => (
                  <tr key={b.id || b.letter_grade} className="border-t">
                    <td className="p-2 font-bold">{b.letter_grade || b.label}</td>
                    <td className="p-2">{b.display_label || b.description || '—'}</td>
                    <td className="p-2 text-center">{b.min_score} – {b.max_score}</td>
                    <td className="p-2 text-center">{b.grade_points ?? '—'}</td>
                    <td className="p-2 text-center">{b.is_pass === false ? 'No' : 'Yes'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!scale.bands?.length && (
              <p className="p-4 text-slate-400 text-sm">No bands. Create a new version to seed Ethiopian scale.</p>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-3 p-4 bg-slate-50 rounded-2xl">
            <Input
              label="Preview score"
              type="number"
              className="w-32"
              value={previewScore}
              onChange={(e) => setPreviewScore(e.target.value)}
            />
            <Button size="sm" variant="secondary" onClick={runPreview}>Preview grade</Button>
            {preview && (
              <p className="text-sm font-bold text-emerald-700">
                → {preview.letter} ({preview.label}) · GPA {preview.gpa ?? '—'} · {preview.isPassed ? 'Pass' : 'Fail'}
              </p>
            )}
          </div>

          {profiles.length > 1 && (
            <div className="text-xs text-slate-400">
              {profiles.length} profile version(s) on file. Only one is active at a time.
            </div>
          )}
        </>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New grading scale version" size="lg">
        <p className="text-sm text-slate-500 mb-4">
          Replaces the active scale. Existing locked marks keep their original scale reference.
        </p>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {bands.map((b, i) => (
            <div key={i} className="grid grid-cols-6 gap-2 items-center text-sm">
              <Input value={b.letter_grade} onChange={(e) => updateBand(i, 'letter_grade', e.target.value)} />
              <Input value={b.display_label} onChange={(e) => updateBand(i, 'display_label', e.target.value)} />
              <Input type="number" value={b.min_score} onChange={(e) => updateBand(i, 'min_score', e.target.value)} />
              <Input type="number" value={b.max_score} onChange={(e) => updateBand(i, 'max_score', e.target.value)} />
              <Input type="number" step="0.1" value={b.grade_points} onChange={(e) => updateBand(i, 'grade_points', e.target.value)} />
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={b.is_pass !== false} onChange={(e) => updateBand(i, 'is_pass', e.target.checked)} />
                Pass
              </label>
            </div>
          ))}
        </div>
        <Button className="mt-4" onClick={handleSaveProfile} loading={saving}>Save & activate</Button>
      </Modal>
    </section>
  );
}
