import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Calendar, Layers, Plus, Pencil, Trash2, RefreshCw, GraduationCap, School,
} from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import SectionClassLinks from '../../components/academic/SectionClassLinks';
import { catalogApi, classesApi } from '../../api/services';
import { invalidateSectionsCache } from '../../hooks/useCatalog';
import { classesUrl, parseAcademicSetupSearch } from '../../utils/academicNav';
import { pickCurrentYear } from '../../utils/academicYear';

const TABS = [
  { id: 'years', label: 'Years & Terms', icon: Calendar },
  { id: 'grades', label: 'Grades & Sections', icon: Layers },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
];

const errMsg = (err) => err.response?.data?.message || 'Request failed';

export default function AcademicStructurePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlInit = parseAcademicSetupSearch(searchParams.toString());
  const [tab, setTab] = useState(urlInit.tab);
  const [overview, setOverview] = useState(null);
  const [years, setYears] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedGradeId, setSelectedGradeId] = useState(urlInit.gradeId);
  const [highlightSectionId, setHighlightSectionId] = useState(urlInit.sectionId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [classModal, setClassModal] = useState(null);
  const [classForm, setClassForm] = useState({});
  const [classSaving, setClassSaving] = useState(false);
  const [currentYear, setCurrentYear] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ov, yRes, curRes, gRes, sRes] = await Promise.all([
        catalogApi.getOverview(),
        catalogApi.getYears({ detailed: 'true' }),
        catalogApi.getCurrentYear(),
        catalogApi.getGrades(),
        catalogApi.getSubjects({ detailed: 'true' }),
      ]);
      setOverview(ov.data.data);
      const yearList = yRes.data.data || [];
      setYears(yearList);
      setCurrentYear(curRes.data.data || pickCurrentYear(yearList));
      setGrades(gRes.data.data || []);
      setSubjects(sRes.data.data || []);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSections = useCallback(async (gradeId) => {
    if (!gradeId) { setSections([]); return; }
    const res = await catalogApi.getSections(gradeId, { detailed: 'true' });
    setSections(res.data.data || []);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (grades.length && !selectedGradeId) setSelectedGradeId(grades[0].id);
  }, [grades, selectedGradeId]);
  useEffect(() => {
    if (tab === 'grades') loadSections(selectedGradeId || grades[0]?.id);
  }, [tab, selectedGradeId, grades, loadSections]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (tab && tab !== 'years') params.set('tab', tab);
    if (selectedGradeId) params.set('gradeId', selectedGradeId);
    if (highlightSectionId) params.set('sectionId', highlightSectionId);
    setSearchParams(params, { replace: true });
  }, [tab, selectedGradeId, highlightSectionId, setSearchParams]);

  const openClassModal = (section) => {
    const year = currentYear || pickCurrentYear(years);
    setClassForm({
      section_id: section.id,
      grade_id: section.grade_id,
      academic_year_id: year?.id || '',
      capacity: 40,
      name: `${section.grade_name || grades.find((g) => g.id === section.grade_id)?.name || ''} - ${section.name}`.trim(),
    });
    setClassModal(section);
    setError('');
  };

  const handleCreateClass = async () => {
    setClassSaving(true);
    setError('');
    try {
      await classesApi.create({
        section_id: classForm.section_id,
        grade_id: classForm.grade_id,
        academic_year_id: classForm.academic_year_id,
        capacity: Number(classForm.capacity),
        name: classForm.name?.trim() || undefined,
      });
      setClassModal(null);
      invalidateSectionsCache(classForm.grade_id);
      await loadSections(selectedGradeId || classForm.grade_id);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setClassSaving(false);
    }
  };

  const openModal = (type, initial = {}) => {
    setForm(initial);
    setModal(type);
    setError('');
  };

  const closeModal = () => { setModal(null); setForm({}); };

  const payload = () => {
    const p = { ...form };
    if (p.term_number !== undefined && p.term_number !== '') p.term_number = Number(p.term_number);
    if (p.level_order !== undefined && p.level_order !== '') p.level_order = Number(p.level_order);
    return p;
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const body = payload();
    try {
      switch (modal) {
        case 'year':
          if (body.id) await catalogApi.updateYear(body.id, body);
          else await catalogApi.createYear(body);
          break;
        case 'term':
          if (body.id) await catalogApi.updateTerm(body.id, body);
          else await catalogApi.createTerm(body);
          break;
        case 'grade':
          if (body.id) await catalogApi.updateGrade(body.id, body);
          else await catalogApi.createGrade(body);
          break;
        case 'section':
          if (body.id) await catalogApi.updateSection(body.id, body);
          else await catalogApi.createSection(body);
          invalidateSectionsCache(body.grade_id);
          break;
        case 'subject':
          if (body.id) await catalogApi.updateSubject(body.id, body);
          else await catalogApi.createSubject(body);
          break;
        default:
          break;
      }
      closeModal();
      await load();
      if (tab === 'grades') await loadSections(selectedGradeId || form.grade_id);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (kind, id, extra = {}) => {
    if (!window.confirm('Delete this item? Linked data may block deletion.')) return;
    try {
      if (kind === 'year') await catalogApi.deleteYear(id);
      if (kind === 'term') await catalogApi.deleteTerm(id);
      if (kind === 'grade') await catalogApi.deleteGrade(id);
      if (kind === 'section') {
        await catalogApi.deleteSection(id);
        invalidateSectionsCache(selectedGradeId);
      }
      if (kind === 'subject') await catalogApi.deleteSubject(id, extra);
      await load();
      if (kind === 'section' || kind === 'grade') await loadSections(selectedGradeId);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const field = (key) => ({
    value: form[key] ?? '',
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })),
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="text-emerald-600" /> Academic Setup
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Define grades and sections here, then open{' '}
              <Link to={classesUrl()} className="text-emerald-600 font-bold hover:underline">Classes</Link>
              {' '}to attach sections to academic years.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={classesUrl({
              gradeId: selectedGradeId,
              sectionId: highlightSectionId,
              academicYearId: currentYear?.id,
            })}
            >
              <Button variant="secondary"><School size={16} /> View classes</Button>
            </Link>
            <Button variant="secondary" onClick={load}><RefreshCw size={16} /> Refresh</Button>
          </div>
        </header>

        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              ['Years', overview.years],
              ['Terms', overview.terms],
              ['Grades', overview.grades],
              ['Sections', overview.sections],
              ['Subjects', overview.subjects],
            ].map(([label, val]) => (
              <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                <p className="text-xl font-black">{val}</p>
              </div>
            ))}
          </div>
        )}

        {error && !modal && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</p>
        )}

        <nav className="flex gap-2 border-b border-slate-100 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                tab === t.id ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
        ) : (
          <>
            {tab === 'years' && (
              <section className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => openModal('year', { status: 'draft', is_current: false })}>
                    <Plus size={16} /> New academic year
                  </Button>
                </div>
                {years.map((year) => (
                  <article key={year.id} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Badge color={year.is_current ? 'green' : 'gray'}>{year.is_current ? 'current' : year.status}</Badge>
                        <h2 className="text-xl font-black mt-1">{year.name}</h2>
                        <p className="text-sm text-slate-500">{year.start_date} → {year.end_date}</p>
                        <p className="text-xs text-slate-400 mt-1">{year.enrollment_count ?? 0} enrollments · {year.class_count ?? 0} classes</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!year.is_current && (
                          <Button size="sm" variant="secondary" onClick={() => catalogApi.setCurrentYear(year.id).then(load)}>
                            Set current
                          </Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => openModal('year', { ...year, start_date: year.start_date?.slice?.(0, 10), end_date: year.end_date?.slice?.(0, 10) })}>
                          <Pencil size={14} />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleDelete('year', year.id)}>
                          <Trash2 size={14} />
                        </Button>
                        <Button size="sm" onClick={() => openModal('term', { academic_year_id: year.id, status: 'upcoming' })}>
                          <Plus size={14} /> Term
                        </Button>
                      </div>
                    </div>
                    {year.terms?.length > 0 && (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {year.terms.map((term) => (
                          <div key={term.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="font-bold text-sm">
                              #{term.term_number} {term.name}
                              {term.is_current && <span className="text-emerald-600 ml-1">· current</span>}
                            </p>
                            <p className="text-xs text-slate-500">{term.status} · {term.start_date} – {term.end_date}</p>
                            <div className="flex gap-2 mt-2">
                              <button type="button" className="text-xs font-bold text-slate-600" onClick={() => openModal('term', {
                                ...term,
                                academic_year_id: year.id,
                                start_date: term.start_date?.slice?.(0, 10),
                                end_date: term.end_date?.slice?.(0, 10),
                              })}>Edit</button>
                              {!term.is_current && (
                                <button type="button" className="text-xs font-bold text-emerald-600" onClick={() => catalogApi.setCurrentTerm(term.id).then(load)}>Set current</button>
                              )}
                              <button type="button" className="text-xs font-bold text-rose-500" onClick={() => handleDelete('term', term.id)}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </section>
            )}

            {tab === 'grades' && (
              <section className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h2 className="font-black">Grade levels</h2>
                    <Button size="sm" onClick={() => openModal('grade', {})}><Plus size={14} /></Button>
                  </div>
                  <p className="text-xs text-slate-400">Sections belong to a grade and are reused across years in Classes.</p>
                  <ul className="space-y-2 max-h-[420px] overflow-y-auto">
                    {grades.map((g) => (
                      <li key={g.id}>
                        <button
                          type="button"
                          onClick={() => { setSelectedGradeId(g.id); setHighlightSectionId(''); }}
                          className={`w-full text-left p-3 rounded-xl border flex justify-between items-center ${
                            selectedGradeId === g.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100'
                          }`}
                        >
                          <span className="font-bold">{g.name}</span>
                          <span className="text-xs text-slate-400">Order {g.level_order}</span>
                        </button>
                        <div className="flex gap-2 mt-1 px-1">
                          <button type="button" className="text-xs font-bold" onClick={() => openModal('grade', g)}>Edit</button>
                          <button type="button" className="text-xs font-bold text-rose-500" onClick={() => handleDelete('grade', g.id)}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <h2 className="font-black">Sections</h2>
                    <div className="flex gap-2">
                      <Link to={classesUrl({
                        gradeId: selectedGradeId,
                        academicYearId: currentYear?.id,
                        openCreate: true,
                      })}
                      >
                        <Button size="sm" variant="secondary"><School size={14} /> Classes</Button>
                      </Link>
                      <Button
                        size="sm"
                        disabled={!selectedGradeId && !grades[0]?.id}
                        onClick={() => openModal('section', { grade_id: selectedGradeId || grades[0]?.id })}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                  <ul className="space-y-3 max-h-[520px] overflow-y-auto">
                    {sections.map((s) => (
                      <li
                        key={s.id}
                        className={`p-4 border rounded-2xl space-y-2 ${
                          highlightSectionId === s.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100'
                        }`}
                      >
                        <div className="flex justify-between gap-2">
                          <button
                            type="button"
                            className="text-left"
                            onClick={() => setHighlightSectionId(s.id)}
                          >
                            <p className="font-bold">{s.name}</p>
                            <p className="text-xs text-slate-500">
                              {s.active_enrollments ?? 0} enrolled · {s.class_count ?? 0} class instance(s)
                            </p>
                          </button>
                          <div className="flex gap-2 shrink-0 items-start">
                            <button type="button" title="Edit section" onClick={() => openModal('section', s)}><Pencil size={14} /></button>
                            <button type="button" title="Delete section" onClick={() => handleDelete('section', s.id)}><Trash2 size={14} className="text-rose-500" /></button>
                          </div>
                        </div>
                        <SectionClassLinks
                          section={s}
                          gradeId={selectedGradeId}
                          academicYearId={currentYear?.id}
                          compact
                        />
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button size="sm" variant="secondary" onClick={() => openClassModal(s)}>
                            <Plus size={12} /> Class for year
                          </Button>
                          <Link to={classesUrl({
                            gradeId: s.grade_id,
                            sectionId: s.id,
                            academicYearId: currentYear?.id,
                            openCreate: true,
                          })}
                          >
                            <Button size="sm" variant="ghost">Open in Classes</Button>
                          </Link>
                        </div>
                      </li>
                    ))}
                    {!sections.length && (
                      <p className="text-slate-400 text-sm">
                        No sections for this grade. Add one here, then create a class instance under Classes.
                      </p>
                    )}
                  </ul>
                </div>
              </section>
            )}

            {tab === 'subjects' && (
              <section className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => openModal('subject', { is_core: true })}><Plus size={16} /> Add subject</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-400 uppercase">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Code</th>
                        <th className="pb-2">Core</th>
                        <th className="pb-2">Classes</th>
                        <th className="pb-2">Teachers</th>
                        <th className="pb-2">Exams</th>
                        <th className="pb-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((s) => (
                        <tr key={s.id} className="border-t border-slate-50">
                          <td className="py-3 font-bold">{s.name}</td>
                          <td className="py-3">{s.code || '—'}</td>
                          <td className="py-3">{s.is_core ? 'Yes' : 'No'}</td>
                          <td className="py-3">{s.class_assignments ?? 0}</td>
                          <td className="py-3">{s.teacher_assignments ?? 0}</td>
                          <td className="py-3">{s.exam_links ?? 0}</td>
                          <td className="py-3 text-right whitespace-nowrap">
                            <button type="button" className="mr-2" onClick={() => openModal('subject', s)}><Pencil size={14} /></button>
                            <button
                              type="button"
                              onClick={() => {
                                const force = (s.class_assignments > 0) && window.confirm('Remove class assignments and delete subject?');
                                handleDelete('subject', s.id, { force });
                              }}
                            >
                              <Trash2 size={14} className="text-rose-500" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <Modal open={!!modal} onClose={closeModal} title={
        modal === 'year' ? (form.id ? 'Edit year' : 'New year')
          : modal === 'term' ? (form.id ? 'Edit term' : 'New term')
            : modal === 'grade' ? (form.id ? 'Edit grade' : 'New grade')
              : modal === 'section' ? (form.id ? 'Edit section' : 'New section')
                : 'Subject'
      }>
        <div className="space-y-4">
          {modal === 'year' && (
            <>
              <Input label="Name" required {...field('name')} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start" type="date" required {...field('start_date')} />
                <Input label="End" type="date" required {...field('end_date')} />
              </div>
              <Select label="Status" value={form.status || 'draft'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} options={[
                { value: 'draft', label: 'Draft' }, { value: 'active', label: 'Active' }, { value: 'closed', label: 'Closed' },
              ]} />
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={!!form.is_current} onChange={(e) => setForm((f) => ({ ...f, is_current: e.target.checked }))} />
                Current year
              </label>
            </>
          )}
          {modal === 'term' && (
            <>
              <Input label="Name" required {...field('name')} />
              <Input label="Term #" type="number" {...field('term_number')} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start" type="date" required {...field('start_date')} />
                <Input label="End" type="date" required {...field('end_date')} />
              </div>
              <Select label="Status" value={form.status || 'upcoming'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} options={[
                { value: 'upcoming', label: 'Upcoming' }, { value: 'active', label: 'Active' }, { value: 'closed', label: 'Closed' },
              ]} />
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={!!form.is_current} onChange={(e) => setForm((f) => ({ ...f, is_current: e.target.checked }))} />
                Current term (this year)
              </label>
            </>
          )}
          {modal === 'grade' && (
            <>
              <Input label="Grade name" required {...field('name')} />
              <Input label="Order" type="number" {...field('level_order')} />
            </>
          )}
          {modal === 'section' && (
            <>
              <Select
                label="Grade"
                value={form.grade_id || ''}
                onChange={(e) => setForm((f) => ({ ...f, grade_id: e.target.value }))}
                options={grades.map((g) => ({ value: g.id, label: g.name }))}
              />
              <Input label="Section name" required {...field('name')} />
            </>
          )}
          {modal === 'subject' && (
            <>
              <Input label="Name" required {...field('name')} />
              <Input label="Code" {...field('code')} />
              <Input label="Description" {...field('description')} />
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={form.is_core !== false} onChange={(e) => setForm((f) => ({ ...f, is_core: e.target.checked }))} />
                Core subject
              </label>
            </>
          )}
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <Button onClick={handleSave} loading={saving}>Save</Button>
        </div>
      </Modal>

      <Modal
        open={!!classModal}
        onClose={() => setClassModal(null)}
        title={`Class instance — ${classModal?.name || ''}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Links section <strong>{classModal?.name}</strong> to an academic year (same section can have one class per year).
          </p>
          <Select
            label="Academic year"
            required
            value={classForm.academic_year_id || ''}
            onChange={(e) => setClassForm((f) => ({ ...f, academic_year_id: e.target.value }))}
            options={years.map((y) => ({ value: y.id, label: y.name + (y.is_current ? ' (current)' : '') }))}
          />
          <Input label="Display name" value={classForm.name || ''} onChange={(e) => setClassForm((f) => ({ ...f, name: e.target.value }))} />
          <Input
            label="Capacity"
            type="number"
            min={1}
            value={classForm.capacity ?? ''}
            onChange={(e) => setClassForm((f) => ({ ...f, capacity: e.target.value }))}
          />
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <Button onClick={handleCreateClass} loading={classSaving} disabled={!classForm.academic_year_id}>
            Create class
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
