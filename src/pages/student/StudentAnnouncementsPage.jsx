import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import StudentLayout from '../../components/layouts/StudentLayout';
import Badge from '../../components/ui/Badge';
import { studentPortalApi } from '../../api/services';
import { ui } from '../../theme/tokens';

export default function StudentAnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentPortalApi.announcements()
      .then((r) => setItems(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <StudentLayout>
      <header className="mb-6">
        <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Bell className="text-sky-600" size={26} /> School announcements
        </h1>
      </header>

      {loading ? (
        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      ) : !items.length ? (
        <div className={`${ui.card} p-8 text-center`}>
          <p className={ui.muted}>No active announcements.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((a) => (
            <li key={a.id} className={`${ui.card} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <h2 className="font-black text-slate-900 dark:text-slate-100">{a.title}</h2>
                {a.priority === 'urgent' && <Badge color="red">Urgent</Badge>}
              </div>
              <p className={`text-sm ${ui.muted} whitespace-pre-wrap`}>{a.content}</p>
              <p className={`text-xs ${ui.muted} mt-3`}>
                {new Date(a.created_at).toLocaleString()}
                {[a.author_first_name, a.author_last_name].filter(Boolean).length
                  ? ` · ${[a.author_first_name, a.author_last_name].filter(Boolean).join(' ')}`
                  : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </StudentLayout>
  );
}
