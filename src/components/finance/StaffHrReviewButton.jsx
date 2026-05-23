import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ExternalLink, Send } from 'lucide-react';
import { financeApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

/**
 * Finance: request admin HR review (no redirect to blocked school-admin routes).
 * Admin: open full teacher HR profile.
 */
export default function StaffHrReviewButton({
  teacherId,
  employeeName,
  mode = 'admin',
  compact = false,
}) {
  const { toast } = useToast();
  const { t } = useI18n();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!teacherId) return null;

  const isFinance = mode === 'finance' || user?.role === 'FINANCE';
  const adminHref = `/school-admin/teachers/${teacherId}?tab=hr`;
  const financeHref = `/finance/staff/${teacherId}`;

  const submitReview = async () => {
    setSending(true);
    try {
      await financeApi.createHrReviewRequest(teacherId, {
        message: message || `Please review payroll/HR for ${employeeName || 'staff member'}.`,
      });
      toast(t('finance.hrReviewSent'), 'success');
      setOpen(false);
      setMessage('');
    } catch (e) {
      toast(e.response?.data?.message || 'Request failed', 'error');
    } finally {
      setSending(false);
    }
  };

  if (!isFinance) {
    return (
      <Link
        to={adminHref}
        className={`inline-flex items-center gap-1 font-bold text-emerald-600 hover:underline ${compact ? 'text-[10px]' : 'text-xs'}`}
      >
        <ExternalLink size={compact ? 10 : 12} />
        {t('finance.editHrProfile')}
      </Link>
    );
  }

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2 ${compact ? '' : 'mt-1'}`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`inline-flex items-center gap-1 font-bold text-amber-700 hover:text-amber-900 ${compact ? 'text-[10px]' : 'text-xs'}`}
        >
          <Send size={compact ? 10 : 12} />
          {t('finance.requestHrReview')}
        </button>
        <Link
          to={financeHref}
          className={`inline-flex items-center gap-1 font-bold text-emerald-600 hover:underline ${compact ? 'text-[10px]' : 'text-xs'}`}
        >
          <ClipboardList size={compact ? 10 : 12} />
          {t('finance.editHrProfile')}
        </Link>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`HR review — ${employeeName || 'Staff'}`}>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          School admin will see this in Finance → Approvals. They can open the teacher HR profile to update salary, bank details, and contracts.
        </p>
        <textarea
          className="w-full rounded-xl border p-3 text-sm min-h-[100px] dark:bg-slate-800 dark:border-slate-600"
          placeholder="Note for admin (missing bank account, salary mismatch, new contract needed…)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submitReview} loading={sending}>
            <Send size={14} className="inline mr-1" />
            Send to admin
          </Button>
        </div>
      </Modal>
    </>
  );
}
