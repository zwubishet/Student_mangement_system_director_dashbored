import { useCallback, useEffect, useState } from 'react';
import { Bus, RefreshCw, Search, UserCheck } from 'lucide-react';
import { financeApi, catalogApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { useI18n } from '../../context/I18nContext';
import { ETB, unwrap } from './financeUi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const FREQ_LABEL = {
  annual: 'Annual',
  term: 'Term',
  monthly: 'Monthly',
  one_time: 'One-time',
};

export default function StudentFeeSubscriptionsPanel({ academicYear, onYearChange }) {
  const { toast } = useToast();
  const { t } = useI18n();
  const [categories, setCategories] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [grades, setGrades] = useState([]);
  const [gradeId, setGradeId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [selectedCats, setSelectedCats] = useState([]);

  const load = useCallback(async () => {
    if (!academicYear) return;
    setLoading(true);
    try {
      const [cats, rows, gr] = await Promise.all([
        financeApi.listCategories({ enriched: '1' }),
        financeApi.getSubscriptionMatrix({
          academic_year: academicYear,
          grade_id: gradeId || undefined,
          search: search || undefined,
        }),
        catalogApi.getGrades(),
      ]);
      setCategories(unwrap(cats) || []);
      setMatrix(unwrap(rows) || []);
      setGrades(unwrap(gr) || []);
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  }, [academicYear, gradeId, search, toast]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (row) => {
    const subs = Array.isArray(row.subscriptions) ? row.subscriptions : [];
    setEditStudent(row);
    setSelectedCats(
      categories.map((c) => {
        const existing = subs.find((s) => s.fee_category_id === c.id);
        return {
          fee_category_id: c.id,
          name: c.name,
          category_type: c.category_type,
          enabled: !!existing,
          custom_amount: existing?.custom_amount ?? '',
          frequency: existing?.frequency || c.frequency,
        };
      })
    );
  };

  const saveSubscriptions = async () => {
    if (!editStudent) return;
    setSaving(true);
    try {
      await financeApi.setStudentSubscriptions(editStudent.student_id, {
        academic_year: academicYear,
        categories: selectedCats
          .filter((c) => c.enabled)
          .map((c) => ({
            fee_category_id: c.fee_category_id,
            custom_amount: c.custom_amount ? Number(c.custom_amount) : null,
            frequency: c.frequency || null,
          })),
      });
      toast('Subscriptions saved', 'success');
      setEditStudent(null);
      await load();
    } catch (e) {
      toast(e.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const syncMandatory = async () => {
    setSaving(true);
    try {
      const res = await financeApi.syncMandatorySubscriptions({ academic_year: academicYear });
      const d = unwrap(res);
      toast(`Mandatory fees linked for ${d.students} students`, 'success');
      await load();
    } catch (e) {
      toast(e.response?.data?.message || 'Sync failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 text-sm text-sky-900 dark:text-sky-100">
        <p className="font-bold flex items-center gap-2"><Bus size={16} /> Ethiopia-style billing</p>
        <p className="mt-1 text-sky-800 dark:text-sky-200">
          Each student subscribes to fee categories (tuition, transport, meals, etc.) with annual, term, or monthly frequency.
          Invoice generation sums only subscribed categories — not a single grade-wide amount.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Academic year
          <select
            className="mt-1 block rounded-xl border px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-600"
            value={academicYear}
            onChange={(e) => onYearChange?.(e.target.value)}
          >
            <option value={academicYear}>{academicYear}</option>
          </select>
        </label>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Grade
          <select
            className="mt-1 block rounded-xl border px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-600"
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
          >
            <option value="">All grades</option>
            {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </label>
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm dark:bg-slate-800 dark:border-slate-600"
            placeholder="Search student…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}><RefreshCw size={14} /> Refresh</Button>
        <Button onClick={syncMandatory} loading={saving}>{t('finance.syncMandatory')}</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((c) => (
          <div key={c.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
            <p className="font-bold text-sm">{c.name}</p>
            <p className="text-[10px] uppercase text-slate-400">
              {c.category_type === 'mandatory' ? t('finance.mandatory') : t('finance.optional')}
              {' · '}{FREQ_LABEL[c.frequency] || c.frequency}
            </p>
            <p className="text-xs text-emerald-600 mt-1">{c.active_subscribers ?? 0} subscribed</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Class</th>
              <th className="px-4 py-3 text-left">{t('finance.subscriptions')}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800 dark:divide-slate-800 dark:divide-slate-700">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading…</td></tr>
            ) : matrix.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">No students. Sync mandatory fees or enroll students first.</td></tr>
            ) : matrix.map((row) => {
              const subs = Array.isArray(row.subscriptions) ? row.subscriptions : [];
              return (
                <tr key={row.student_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3">
                    <p className="font-bold">{row.first_name} {row.last_name}</p>
                    <p className="text-xs text-slate-400">{row.student_id_number}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{row.grade_name} · {row.section_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {subs.length ? subs.map((s) => (
                        <span key={s.fee_category_id} className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold">
                          {s.category_name}
                          {s.custom_amount != null && ` · ${ETB.format(Number(s.custom_amount))}`}
                        </span>
                      )) : (
                        <span className="text-slate-400 text-xs">No categories</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" className="text-xs font-bold text-emerald-600" onClick={() => openEdit(row)}>
                      <UserCheck size={12} className="inline" /> Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!editStudent}
        onClose={() => setEditStudent(null)}
        title={editStudent ? `${editStudent.first_name} ${editStudent.last_name} — fee categories` : ''}
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {selectedCats.map((c, idx) => (
            <label
              key={c.fee_category_id}
              className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border ${
                c.enabled ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30' : 'border-slate-100 dark:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={c.enabled}
                onChange={(e) => setSelectedCats((list) => list.map((it, i) => (
                  i === idx ? { ...it, enabled: e.target.checked } : it
                )))}
              />
              <div className="flex-1 min-w-[120px]">
                <p className="font-bold text-sm">{c.name}</p>
                <p className="text-[10px] text-slate-400">{c.category_type === 'mandatory' ? t('finance.mandatory') : t('finance.optional')}</p>
              </div>
              <input
                type="number"
                placeholder="Custom ETB (optional)"
                className="w-28 rounded-lg border px-2 py-1 text-sm dark:bg-slate-800"
                disabled={!c.enabled}
                value={c.custom_amount}
                onChange={(e) => setSelectedCats((list) => list.map((it, i) => (
                  i === idx ? { ...it, custom_amount: e.target.value } : it
                )))}
              />
              <select
                className="rounded-lg border px-2 py-1 text-sm dark:bg-slate-800"
                disabled={!c.enabled}
                value={c.frequency}
                onChange={(e) => setSelectedCats((list) => list.map((it, i) => (
                  i === idx ? { ...it, frequency: e.target.value } : it
                )))}
              >
                {Object.entries(FREQ_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setEditStudent(null)}>Cancel</Button>
          <Button onClick={saveSubscriptions} loading={saving}>Save subscriptions</Button>
        </div>
      </Modal>
    </div>
  );
}
