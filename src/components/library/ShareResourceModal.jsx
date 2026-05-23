import { useEffect, useState } from 'react';
import { Pin, Share2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { resourcesApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

export default function ShareResourceModal({ open, onClose, resource, onSuccess }) {
  const { toast } = useToast();
  const [sections, setSections] = useState([]);
  const [selected, setSelected] = useState([]);
  const [note, setNote] = useState('');
  const [pin, setPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setNote('');
    setPin(false);
    setLoading(true);
    resourcesApi.shareableSections()
      .then((res) => setSections(res.data.data || []))
      .catch((err) => toast(err.response?.data?.message || err.message, 'error'))
      .finally(() => setLoading(false));
  }, [open, toast]);

  const toggleSection = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleShare = async () => {
    if (!resource?.id || !selected.length) {
      toast('Select at least one section.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await resourcesApi.share(resource.id, {
        section_ids: selected,
        note: note.trim() || undefined,
        is_pinned: pin,
      });
      toast('Shared with selected sections.', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast(err.response?.data?.message || err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Share with sections" size="md">
      {resource && (
        <p className={`${ui.muted} text-sm mb-4`}>
          <strong className="text-slate-800 dark:text-slate-100">{resource.title}</strong>
          {' '}will appear in each section&apos;s library. Students see pinned items first.
        </p>
      )}

      {loading ? (
        <p className={ui.muted}>Loading your classes…</p>
      ) : sections.length === 0 ? (
        <div className={ui.alertInfo}>
          You have no section assignments for the current year. Assign yourself to a class first.
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {sections.map((s) => {
            const id = s.section_id;
            const checked = selected.includes(id);
            return (
              <label
                key={`${id}-${s.subject_id}`}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  checked
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSection(id)}
                  className="rounded border-slate-300 text-emerald-600"
                />
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {s.grade_name} — {s.section_name}
                  </p>
                  <p className="text-xs text-slate-500">{s.subject_name}</p>
                </div>
              </label>
            );
          })}
        </div>
      )}

      <div className="mb-4">
        <label className={ui.inputLabel}>Note for students (optional)</label>
        <textarea
          className={ui.input}
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Complete before next class"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 mb-6">
        <input type="checkbox" checked={pin} onChange={(e) => setPin(e.target.checked)} />
        <Pin size={16} className="text-amber-500" /> Pin to top of section library
      </label>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleShare} disabled={submitting || !selected.length}>
          <Share2 size={16} className="mr-1" />
          {submitting ? 'Sharing…' : `Share (${selected.length})`}
        </Button>
      </div>
    </Modal>
  );
}
