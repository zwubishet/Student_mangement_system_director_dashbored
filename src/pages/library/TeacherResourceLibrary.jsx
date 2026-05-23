import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Plus, Search, RefreshCw } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import ResourceCard from '../../components/library/ResourceCard';
import ResourceUploadModal from '../../components/library/ResourceUploadModal';
import ShareResourceModal from '../../components/library/ShareResourceModal';
import { catalogApi, resourcesApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useCatalog } from '../../hooks/useCatalog';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

export default function TeacherResourceLibrary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { grades, loadCatalog } = useCatalog();
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [view, setView] = useState('all');
  const [filters, setFilters] = useState({ search: '', category_id: '', grade_id: '', subject_id: '' });

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const loadMeta = useCallback(async () => {
    const [cats, subs] = await Promise.all([
      resourcesApi.categories(),
      catalogApi.getSubjects(),
    ]);
    setCategories(cats.data.data || []);
    setSubjects(subs.data.data?.subjects || subs.data.data || []);
  }, []);

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 24, scope: 'all' };
      if (view === 'mine') params.uploaded_by = user?.userId;
      const res = await resourcesApi.list(params);
      setResources(res.data.data || []);
    } catch (err) {
      toast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, view, user?.userId, toast]);

  useEffect(() => { loadCatalog(); loadMeta(); }, [loadCatalog, loadMeta]);
  useEffect(() => { loadResources(); }, [loadResources]);

  const openResource = async (resource) => {
    try {
      const res = await resourcesApi.access(resource.id, { action: 'view' });
      const url = res.data.data?.url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast(err.response?.data?.message || err.message, 'error');
    }
  };

  return (
    <TeacherLayout>
      <div className={`${ui.page} ${ui.pageBg} p-6 lg:p-8`}>
        <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className={ui.heading}>Resource library</h1>
            <p className={ui.subheading}>Upload materials and share with your sections</p>
          </div>
          <Button onClick={() => setUploadOpen(true)}>
            <Plus size={18} className="mr-1" /> Upload resource
          </Button>
        </header>

        <motionTabs view={view} setView={setView} />

        <div className={`${ui.card} p-4 mb-6 flex flex-wrap gap-3 items-end`}>
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className={`${ui.input} pl-9`}
              placeholder="Search…"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <Select
            value={filters.category_id}
            onChange={(e) => setFilter('category_id', e.target.value)}
            options={[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <Select
            value={filters.grade_id}
            onChange={(e) => setFilter('grade_id', e.target.value)}
            options={[{ value: '', label: 'All grades' }, ...grades.map((g) => ({ value: g.id, label: g.name }))]}
          />
          <Button variant="secondary" onClick={loadResources}><RefreshCw size={16} /></Button>
        </div>

        {loading ? (
          <p className={ui.muted}>Loading…</p>
        ) : resources.length === 0 ? (
          <div className={`${ui.card} p-12 text-center`}>
            <BookOpen className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="font-bold">No resources yet</p>
            <p className={`${ui.muted} text-sm mt-1`}>Upload a PDF, worksheet, or link for your students.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                onOpen={openResource}
                onShare={r.status === 'published' ? setShareTarget : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <ResourceUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        categories={categories}
        grades={grades}
        subjects={subjects}
        onSuccess={loadResources}
      />

      <ShareResourceModal
        open={Boolean(shareTarget)}
        onClose={() => setShareTarget(null)}
        resource={shareTarget}
        onSuccess={loadResources}
      />
    </TeacherLayout>
  );
}

function motionTabs({ view, setView }) {
  return (
    <div className="flex gap-2 mb-6">
      {[
        { id: 'all', label: 'Browse all' },
        { id: 'mine', label: 'My uploads' },
      ].map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => setView(id)}
          className={`px-4 py-2 rounded-xl text-sm font-bold ${
            view === id
              ? 'bg-slate-900 dark:bg-emerald-600 text-white'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
