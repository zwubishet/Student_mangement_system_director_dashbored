import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen, Globe, Layers, Clock, Plus, Search, RefreshCw, Library,
} from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import ResourceCard from '../../components/library/ResourceCard';
import ResourceUploadModal from '../../components/library/ResourceUploadModal';
import { catalogApi, libraryApi, resourcesApi } from '../../api/services';
import { useCatalog } from '../../hooks/useCatalog';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

const TABS = [
  { id: 'browse', label: 'Browse', icon: Layers },
  { id: 'pending', label: 'Pending approval', icon: Clock },
  { id: 'physical', label: 'Physical books', icon: Library },
];

export default function ResourceLibraryHub() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { grades, loadCatalog } = useCatalog();
  const [tab, setTab] = useState(searchParams.get('tab') || 'browse');
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filters, setFilters] = useState({
    scope: 'all', search: '', category_id: '', grade_id: '', subject_id: '',
  });

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const loadMeta = useCallback(async () => {
    const [ov, cats, subs] = await Promise.all([
      resourcesApi.overview(),
      resourcesApi.categories(),
      catalogApi.getSubjects(),
    ]);
    setOverview(ov.data.data);
    setCategories(cats.data.data || []);
    setSubjects(subs.data.data?.subjects || subs.data.data || []);
  }, []);

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 24 };
      if (tab === 'pending') {
        params.scope = 'school';
        params.status = 'pending';
      }
      const res = await resourcesApi.list(params);
      setResources(res.data.data || []);
    } catch (err) {
      toast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, tab, toast]);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await libraryApi.listBooks({ limit: 50 });
      setBooks(res.data.data || []);
    } catch (err) {
      toast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadCatalog(); loadMeta(); }, [loadCatalog, loadMeta]);

  useEffect(() => {
    if (tab === 'physical') loadBooks();
    else loadResources();
  }, [tab, loadResources, loadBooks]);

  const switchTab = (id) => {
    setTab(id);
    setSearchParams({ tab: id });
  };

  const openResource = async (resource) => {
    try {
      const res = await resourcesApi.access(resource.id, { action: 'view' });
      const url = res.data.data?.url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast(err.response?.data?.message || err.message, 'error');
    }
  };

  const review = async (resource, status) => {
    try {
      await resourcesApi.review(resource.id, {
        status,
        rejection_reason: status === 'archived' ? 'Not approved' : undefined,
      });
      toast(status === 'published' ? 'Resource approved.' : 'Resource rejected.', 'success');
      loadResources();
      loadMeta();
    } catch (err) {
      toast(err.response?.data?.message || err.message, 'error');
    }
  };

  const stats = overview?.stats || {};

  return (
    <AdminLayout>
      <motionPage>
        <header className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className={ui.heading}>Resource library</h1>
              <p className={ui.subheading}>
                MoE textbooks, school materials, and section sharing — Ethiopia KG–12
              </p>
            </div>
            <Button onClick={() => setUploadOpen(true)}>
              <Plus size={18} className="mr-1" /> Add resource
            </Button>
          </div>

          {!overview?.library_ready && overview?.message && (
            <motionAlert message={overview.message} />
          )}

          {overview?.library_ready && (
            <StatsGrid stats={stats} />
          )}
        </header>

        <TabNav tab={tab} stats={stats} onSwitch={switchTab} />

        {tab !== 'physical' && (
          <FiltersBar
            filters={filters}
            setFilter={setFilter}
            categories={categories}
            grades={grades}
            subjects={subjects}
            onRefresh={loadResources}
          />
        )}

        {loading ? (
          <p className={ui.muted}>Loading…</p>
        ) : tab === 'physical' ? (
          <PhysicalBooksPanel books={books} onRefresh={loadBooks} toast={toast} />
        ) : resources.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <ResourceGrid
            resources={resources}
            tab={tab}
            onOpen={openResource}
            onReview={review}
          />
        )}
      </motionPage>

      <ResourceUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        categories={categories}
        grades={grades}
        subjects={subjects}
        onSuccess={() => { loadResources(); loadMeta(); }}
      />
    </AdminLayout>
  );
}

function motionPage({ children }) {
  return <div className={`${ui.page} ${ui.pageBg} p-6 lg:p-8`}>{children}</div>;
}

function motionAlert({ message }) {
  return <div className={`${ui.alertInfo} mt-4`}>{message}</div>;
}

function StatsGrid({ stats }) {
  const items = [
    { label: 'School resources', value: stats.published, icon: BookOpen },
    { label: 'MoE global', value: stats.global, icon: Globe },
    { label: 'Pending', value: stats.pending, icon: Clock },
    { label: 'Physical books', value: stats.books, icon: Library },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} className={ui.stat}>
          <Icon size={18} className="text-emerald-600 mb-2" />
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{value ?? 0}</p>
          <p className={ui.mutedXs}>{label}</p>
        </div>
      ))}
    </div>
  );
}

function TabNav({ tab, stats, onSwitch }) {
  return (
    <nav className="flex flex-wrap gap-2 mb-6">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSwitch(id)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            tab === id
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
          }`}
        >
          <Icon size={16} /> {label}
          {id === 'pending' && stats.pending > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px]">
              {stats.pending}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

function FiltersBar({ filters, setFilter, categories, grades, subjects, onRefresh }) {
  return (
    <div className={`${ui.card} p-4 mb-6 flex flex-wrap gap-3 items-end`}>
      <div className="flex-1 min-w-[200px] relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className={`${ui.input} pl-9`}
          placeholder="Search title…"
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
        />
      </div>
      <Select
        value={filters.scope}
        onChange={(e) => setFilter('scope', e.target.value)}
        options={[
          { value: 'all', label: 'All sources' },
          { value: 'school', label: 'School only' },
          { value: 'global', label: 'MoE global' },
        ]}
      />
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
      <Select
        value={filters.subject_id}
        onChange={(e) => setFilter('subject_id', e.target.value)}
        options={[{ value: '', label: 'All subjects' }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]}
      />
      <Button variant="secondary" onClick={onRefresh}><RefreshCw size={16} /></Button>
    </div>
  );
}

function EmptyState({ tab }) {
  return (
    <div className={`${ui.card} p-12 text-center`}>
      <BookOpen className="mx-auto text-slate-300 mb-3" size={40} />
      <p className="font-bold text-slate-700 dark:text-slate-200">No resources found</p>
      <p className={`${ui.muted} text-sm mt-1`}>
        {tab === 'pending' ? 'No uploads awaiting approval.' : 'Upload materials or browse MoE global library.'}
      </p>
    </div>
  );
}

function ResourceGrid({ resources, tab, onOpen, onReview }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {resources.map((r) => (
        <ResourceCard
          key={r.id}
          resource={r}
          onOpen={onOpen}
          showAdminActions={tab === 'pending'}
          onApprove={(res) => onReview(res, 'published')}
          onReject={(res) => onReview(res, 'archived')}
        />
      ))}
    </div>
  );
}

function PhysicalBooksPanel({ books, onRefresh, toast }) {
  const [form, setForm] = useState({ title: '', author: '', total_copies: 1, shelf_location: '' });
  const [saving, setSaving] = useState(false);

  const addBook = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await libraryApi.createBook(form);
      toast('Book added to catalog.', 'success');
      setForm({ title: '', author: '', total_copies: 1, shelf_location: '' });
      onRefresh();
    } catch (err) {
      toast(err.response?.data?.message || err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={addBook} className={`${ui.card} p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3`}>
        <input className={ui.input} placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className={ui.input} placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        <input className={ui.input} type="number" min={1} placeholder="Copies" value={form.total_copies} onChange={(e) => setForm({ ...form, total_copies: e.target.value })} />
        <input className={ui.input} placeholder="Shelf" value={form.shelf_location} onChange={(e) => setForm({ ...form, shelf_location: e.target.value })} />
        <Button type="submit" disabled={saving} className="sm:col-span-2 lg:col-span-4 w-fit">Add book</Button>
      </form>

      <div className={`${ui.card} overflow-hidden`}>
        <table className={ui.table}>
          <thead className={ui.tableHead}>
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Author</th>
              <th className="text-left p-3">Available</th>
              <th className="text-left p-3">Shelf</th>
            </tr>
          </thead>
          <tbody className={ui.tableRow}>
            {books.map((b) => (
              <tr key={b.id} className={ui.tableRowHover}>
                <td className="p-3 font-medium">{b.title}</td>
                <td className="p-3 text-slate-500">{b.author || '—'}</td>
                <td className="p-3">{b.available_copies} / {b.total_copies}</td>
                <td className="p-3 text-slate-500">{b.shelf_location || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {books.length === 0 && <p className={`${ui.muted} p-6 text-center`}>No physical books cataloged yet.</p>}
      </div>
    </>
  );
}
