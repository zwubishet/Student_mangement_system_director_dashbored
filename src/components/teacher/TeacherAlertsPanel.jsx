import { useNavigate } from 'react-router-dom';
import { AlertCircle, Bell, FileWarning, ClipboardCheck } from 'lucide-react';
import Badge from '../ui/Badge';

const ICONS = {
  marks_rejected: FileWarning,
  marks_pending: ClipboardCheck,
};

export default function TeacherAlertsPanel({ licenceAlerts = [], notifications = [], compact = false }) {
  const navigate = useNavigate();
  const hasContent = licenceAlerts.length > 0 || notifications.length > 0;
  if (!hasContent) return null;

  const handleNotifClick = (n) => {
    if (n.link?.exam_id && n.link?.schedule_id) {
      navigate(`/teachers/exams/${n.link.exam_id}/mark/${n.link.schedule_id}`);
    } else if (n.type === 'marks_pending') {
      navigate('/teachers/exams');
    }
  };

  return (
    <div className={`space-y-3 ${compact ? '' : 'mb-6'}`}>
      {licenceAlerts.map((a, i) => (
        <div
          key={`lic-${i}`}
          className={`flex gap-3 p-4 rounded-2xl border ${
            a.level === 'critical' ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
          }`}
        >
          <AlertCircle className={a.level === 'critical' ? 'text-rose-600' : 'text-amber-600'} size={22} />
          <div>
            <p className="font-bold text-sm">{a.message}</p>
            <p className="text-xs opacity-80 mt-0.5">Update your profile or contact HR.</p>
          </div>
        </div>
      ))}

      {notifications.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b bg-slate-50 flex items-center gap-2">
            <Bell size={16} className="text-emerald-600" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Alerts</span>
            <Badge color="amber">{notifications.length}</Badge>
          </div>
          <ul className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
            {notifications.map((n, i) => {
              const Icon = ICONS[n.type] || Bell;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => handleNotifClick(n)}
                    className="w-full text-left px-4 py-3 hover:bg-emerald-50/50 transition-colors"
                  >
                    <div className="flex gap-3">
                      <Icon size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800 truncate">{n.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
