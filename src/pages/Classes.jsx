import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus, RefreshCw, Settings2, Layers, School, Users, ChevronRight, Calendar,
} from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { classesApi } from '../api/services';
import { useCatalog } from '../hooks/useCatalog';
import { academicSetupUrl, parseClassesSearch } from '../utils/academicNav';

export default function Classes() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = parseClassesSearch(searchParams.toString());

  const {
    years, currentYear, grades, loading: catalogLoading, error: catalogError,
    loadCatalog, loadSections, refreshCatalog, invalidateSectionsCache,
  } = useCatalog();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState(urlState.yearId);
  const [filterGrade, setFilterGrade] = useState(urlState.gradeId);
  const [filterSection, setFilterSection] = useState(urlState.sectionId);
  const [viewGrade, setViewGrade] = useState(urlState.gradeId || '');
  const [gradeSections, setGradeSections] = useState([]);
  const [formSections, setFormSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [showModal, setShowModal] = useState(urlState.openCreate);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  const effectiveYearId = filterYear || currentYear?.id || '';

  useEffect(() => {
    if (!years.length) return;
    if (urlState.yearId && years.some((y) => y.id === urlState.yearId)) {
      if (filterYear !== urlState.yearId) setFilterYear(urlState.yearId);
      return;
    }
    if (filterYear && !years.some((y) => y.id === filterYear)) {
      setFilterYear('');
    }
  }, [years, urlState.yearId, filterYear]);

  useEffect(() => {
    if (!grades.length) return;
    if (filterGrade && !grades.some((g) => g.id === filterGrade)) {
      setFilterGrade('');
      if (!viewGrade) setViewGrade(grades[0]?.id || '');
    }
  }, [grades, filterGrade, viewGrade]);

  useEffect(() => {
    if (!filterSection || !gradeSections.length) return;
    if (!gradeSections.some((s) => s.id === filterSection)) {
      setFilterSection('');
    }
  }, [viewGrade, gradeSections, filterSection]);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError('');
    const params = { page: 1, limit: 200, search };
    if (filterYear) params.academic_year_id = filterYear;
    if (filterGrade) params.grade_id = filterGrade;
    if (filterSection) params.section_id = filterSection;
    classesApi.list(params)
      .then((res) => {
        if (res.data?.success === false) {
          setRows([]);
          setTotal(0);
          setLoadError(res.data?.message || 'Failed to load classes');
          return;
        }
        setRows(res.data.data || []);
        setTotal(res.data.meta?.total ?? res.data.data?.length ?? 0);
      })
      .catch((err) => {
        setRows([]);
        setTotal(0);
        setLoadError(err.response?.data?.message || err.message || 'Failed to load classes');
      })
      .finally(() => setLoading(false));
  }, [search, filterYear, filterGrade, filterSection]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (grades.length && !viewGrade) setViewGrade(grades[0]?.id || '');
  }, [grades, viewGrade]);

  useEffect(() => {
    if (!viewGrade) { setGradeSections([]); return; }
    setSectionsLoading(true);
    invalidateSectionsCache(viewGrade);
    loadSections(viewGrade).then(setGradeSections).finally(() => setSectionsLoading(false));
  }, [viewGrade, loadSections]);

  useEffect(() => {
    if (!form.grade_id) { setFormSections([]); return; }
    loadSections(form.grade_id).then(setFormSections);
  }, [form.grade_id, loadSections, showModal]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const key = `${r.grade_name || '—'}|${r.academic_year || '—'}`;
      if (!map.has(key)) map.set(key, { grade: r.grade_name, year: r.academic_year, items: [] });
      map.get(key).items.push(r);
    }
    return Array.from(map.values()).sort((a, b) => (a.grade || '').localeCompare(b.grade || ''));
  }, [rows]);

  const sectionsWithClasses = useMemo(() => {
    const bySection = new Map();
    for (const r of rows) {
      if (r.section_id) {
        if (!bySection.has(r.section_id)) bySection.set(r.section_id, []);
        bySection.get(r.section_id).push(r);
      }
    }
    return gradeSections.map((sec) => ({
      ...sec,
      classes: bySection.get(sec.id) || [],
    }));
  }, [gradeSections, rows]);

  const openCreate = (sectionId) => {
    refreshCatalog();
    setForm({
      grade_id: viewGrade || filterGrade || grades[0]?.id,
      section_id: sectionId || filterSection || '',
      academic_year_id: effectiveYearId,
      capacity: 40,
    });
    setError('');
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.section_id) {
      setError('Choose a section from the catalog (create sections under Academic Setup).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await classesApi.create({
        grade_id: form.grade_id,
        section_id: form.section_id,
        academic_year_id: form.academic_year_id,
        capacity: Number(form.capacity),
        name: form.name?.trim() || undefined,
      });
      setShowModal(false);
      if (form.academic_year_id && form.academic_year_id !== filterYear) {
        setFilterYear(form.academic_year_id);
      }
      if (res.data?.data?.class_id) {
        navigate(`/school-admin/classes/${res.data.data.class_id}`);
      } else {
        load();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create class');
    } finally {
      setSaving(false);
    }
  };

  const field = (key) => ({
    value: form[key] ?? '',
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <School className="text-emerald-600" /> Classes
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {total} class instances · Sections are defined in{' '}
              <Link to={academicSetupUrl({ tab: 'grades' })} className="text-emerald-600 font-bold hover:underline">Academic Setup</Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => { refreshCatalog(); load(); }}><RefreshCw size={16} /> Refresh</Button>
            <Link to={academicSetupUrl({ tab: 'grades', gradeId: viewGrade })}>
              <Button variant="secondary"><Layers size={16} /> Manage sections</Button>
            </Link>
            <Button onClick={() => openCreate()}><Plus size={16} /> New class</Button>
          </div>
        </header>

        {(catalogError || loadError) && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
            {loadError || catalogError}
          </p>
        )}

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar: grades + sections catalog */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-3">
              <h2 className="text-xs font-black text-slate-400 uppercase">Filter</h2>
              <Select
                label="Academic year"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                options={[{ value: '', label: 'All years' }, ...years.map((y) => ({
                  value: y.id, label: y.name + (y.is_current ? ' (current)' : ''),
                }))]}
              />
              <SearchBar value={search} onChange={setSearch} placeholder="Search classes..." />
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-3 max-h-[520px] overflow-y-auto">
              <h2 className="text-xs font-black text-slate-400 uppercase">Grades & sections</h2>
              {grades.map((g) => (
                <div key={g.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setViewGrade(g.id);
                      setFilterGrade(g.id);
                      setFilterSection('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl font-bold text-sm ${
                      viewGrade === g.id ? 'bg-emerald-600 text-white' : 'hover:bg-slate-50'
                    }`}
                  >
                    {g.name}
                  </button>
                </div>
              ))}
              {viewGrade && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {sectionsLoading ? (
                    <p className="text-xs text-slate-400 animate-pulse">Loading sections...</p>
                  ) : sectionsWithClasses.map((sec) => (
                    <div key={sec.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">{sec.name}</span>
                        <Button size="sm" variant="ghost" onClick={() => openCreate(sec.id)}><Plus size={12} /></Button>
                      </div>
                      {sec.classes.length ? (
                        <ul className="mt-2 space-y-1">
                          {sec.classes.map((c) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                className="w-full text-left text-xs text-slate-600 hover:text-emerald-600 flex justify-between"
                                onClick={() => navigate(`/school-admin/classes/${c.id}`)}
                              >
                                <span>{c.academic_year}</span>
                                <span>{c.enrolled_count ?? 0}/{c.capacity}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">No class for this section yet</p>
                      )}
                    </div>
                  ))}
                  {!gradeSections.length && !sectionsLoading && (
                    <Link to={academicSetupUrl({ tab: 'grades', gradeId: viewGrade })} className="text-xs font-bold text-emerald-600">
                      + Add sections in Academic Setup
                    </Link>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Main: class cards by grade/year */}
          <main className="lg:col-span-8 space-y-4">
            {loading ? (
              <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
            ) : grouped.length === 0 ? (
              <div className="bg-white border rounded-3xl p-12 text-center text-slate-400">
                <School size={40} className="mx-auto mb-3 opacity-30" />
                <p>No classes match your filters.</p>
                {(filterYear || filterGrade || filterSection || search) && (
                  <Button
                    variant="secondary"
                    className="mt-3"
                    onClick={() => {
                      setFilterYear('');
                      setFilterGrade('');
                      setFilterSection('');
                      setSearch('');
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
                {filterYear && years.length > 1 && (
                  <p className="text-xs mt-2 text-amber-700">
                    Try &quot;All years&quot; if you created a class under a different academic year.
                  </p>
                )}
                <Button className="mt-4" onClick={() => openCreate()}>Create class</Button>
              </div>
            ) : (
              grouped.map((group) => (
                <section key={`${group.grade}-${group.year}`} className="bg-white border border-slate-100 rounded-3xl p-5">
                  <header className="flex items-center gap-2 mb-4">
                    <Badge color="green">{group.grade}</Badge>
                    <span className="text-sm text-slate-500 flex items-center gap-1"><Calendar size={14} /> {group.year}</span>
                  </header>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {group.items.map((c) => (
                      <article
                        key={c.id}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => navigate(`/school-admin/classes/${c.id}`)}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/school-admin/classes/${c.id}`)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="font-black text-slate-900 group-hover:text-emerald-700">{c.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Section {c.section_name}</p>
                          </div>
                          <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 shrink-0" />
                        </div>
                        <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Users size={12} /> {c.enrolled_count ?? 0}/{c.capacity}</span>
                          <span>{c.teacher_first_name ? `${c.teacher_first_name} ${c.teacher_last_name}` : 'No lead teacher'}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))
            )}
          </main>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create class instance" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl">
            Pick a <strong>section</strong> from your catalog, then attach it to an academic year.
          </p>
          <Select label="Academic year" required value={form.academic_year_id || ''} onChange={(e) => setForm((f) => ({ ...f, academic_year_id: e.target.value }))} options={years.map((y) => ({ value: y.id, label: y.name }))} />
          <Select label="Grade" required value={form.grade_id || ''} onChange={(e) => setForm((f) => ({ ...f, grade_id: e.target.value, section_id: '' }))} options={grades.map((g) => ({ value: g.id, label: g.name }))} />
          <Select
            label="Section"
            required
            disabled={!form.grade_id}
            value={form.section_id || ''}
            onChange={(e) => setForm((f) => ({ ...f, section_id: e.target.value }))}
            options={formSections.map((s) => ({ value: s.id, label: s.name }))}
            placeholder={formSections.length ? 'Select section' : 'No sections — add in Academic Setup'}
          />
          <Input label="Display name (optional)" placeholder="Auto: Grade - Section" {...field('name')} />
          <Input label="Capacity" type="number" required min={1} {...field('capacity')} />
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <Button type="submit" loading={saving} disabled={!form.section_id}>Create</Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
