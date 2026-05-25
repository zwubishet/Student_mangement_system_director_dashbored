import { useCallback, useEffect, useState } from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';
import StudentLayout from '../../components/layouts/StudentLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ResourceCard from '../../components/library/ResourceCard';
import { resourcesApi, studentPortalApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

export default function StudentResourcesPage() {
  const { toast } = useToast();
  const [sectionId, setSectionId] = useState(null);
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const prof = await studentPortalApi.profile();
      const sid = prof.data.data?.section_id;
      setSectionId(sid);
      if (!sid) {
        setResources([]);
        return;
      }
      const res = await resourcesApi.sectionLibrary(sid, { search: search || undefined, limit: 40 });
      setResources(res.data.data || []);
    } catch (err) {
      toast(err.response?.data?.message || 'Could not load resources', 'error');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => { load(); }, [load]);

  const openResource = async (resource) => {
    try {
      const res = await resourcesApi.access(resource.id, { action: 'view' });
      const url = res.data.data?.url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not open resource', 'error');
    }
  };

  return (
    <StudentLayout>
      <header className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <BookOpen className="text-sky-600" size={26} /> Class resources
          </h1>
          <p className={`${ui.muted} text-sm mt-1`}>Materials shared with your section by teachers</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load}><RefreshCw size={16} /> Refresh</Button>
      </header>

      <div className="mb-6 max-w-md">
        <Input
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Title or subject…"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !sectionId ? (
        <div className={`${ui.card} p-8 text-center`}>
          <p className={ui.muted}>You are not enrolled in a section yet. Resources appear after enrollment.</p>
        </div>
      ) : !resources.length ? (
        <div className={`${ui.card} p-8 text-center`}>
          <p className={ui.muted}>No shared resources for your class yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} onOpen={() => openResource(r)} />
          ))}
        </div>
      )}
    </StudentLayout>
  );
}
