import { X } from 'lucide-react';
import { ui } from '../../theme/tokens';

export default function Drawer({ open, onClose, title, subtitle, children, width = 'max-w-xl' }) {
  if (!open) return null;
  return (
    <div className={`fixed inset-0 z-[100] flex justify-end ${ui.overlay}`}>
      <aside className={`w-full ${width} ${ui.card} rounded-none h-full shadow-2xl flex flex-col border-l dark:border-slate-800`}>
        <header className={`flex items-start justify-between p-6 ${ui.modalHeader}`}>
          <div>
            <h2 className={ui.modalTitle}>{title}</h2>
            {subtitle && <p className={`${ui.muted} mt-0.5 text-sm`}>{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <X size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  );
}
