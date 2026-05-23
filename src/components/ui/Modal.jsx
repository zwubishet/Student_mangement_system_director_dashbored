import { X } from 'lucide-react';
import { useEffect } from 'react';
import { ui } from '../../theme/tokens';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`absolute inset-0 ${ui.overlay}`} onClick={onClose} role="presentation" />
      <div className={`relative w-full ${widths[size]} ${ui.modal} flex flex-col max-h-[90vh]`}>
        <div className={`flex items-center justify-between px-7 py-5 ${ui.modalHeader}`}>
          <h2 className={ui.modalTitle}>{title}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-7 text-slate-800 dark:text-slate-200">{children}</div>
      </div>
    </div>
  );
}
