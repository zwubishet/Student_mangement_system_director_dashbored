import { X } from 'lucide-react';

export default function Drawer({ open, onClose, title, subtitle, children, width = 'max-w-xl' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/50 backdrop-blur-sm">
      <aside className={`w-full ${width} bg-white h-full shadow-2xl flex flex-col`}>
        <header className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  );
}
