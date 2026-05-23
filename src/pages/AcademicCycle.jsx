import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../components/layouts/AdminLayout';
import { catalogApi } from '../api/services';
import {
  Plus, Clock, Archive, ChevronRight, Users, Loader2,
} from 'lucide-react';

const AcademicCycle = () => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', start: '', end: '', status: 'draft', is_current: false,
  });
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    catalogApi.getYears({ detailed: 'true' })
      .then((res) => setYears(res.data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load academic years'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await catalogApi.createYear({
        name: formData.name,
        start_date: formData.start,
        end_date: formData.end,
        status: formData.status,
        is_current: formData.is_current,
      });
      setIsModalOpen(false);
      setFormData({ name: '', start: '', end: '', status: 'draft', is_current: false });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create academic year');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-20 text-center animate-pulse font-black text-slate-300">
          Loading academic years…
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-10 p-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Academic Cycles</h1>
            <p className="text-slate-500 font-medium text-lg">Manage institutional periods and terms.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl"
          >
            <Plus size={18} /> New Academic Year
          </button>
        </div>

        {error && (
          <p className="text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="space-y-6">
          {years.length === 0 ? (
            <p className="text-slate-400 text-center py-12">No academic years yet. Create your first cycle.</p>
          ) : (
            years.map((year) => (
              <div
                key={year.id}
                className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                <div className="p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                  <div className="flex items-center gap-6 min-w-[300px]">
                    <div
                      className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${
                        year.is_current || year.status === 'active'
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {year.is_current || year.status === 'active' ? <Clock size={28} /> : <Archive size={28} />}
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                          year.is_current
                            ? 'bg-emerald-100 text-emerald-600'
                            : year.status === 'active'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {year.is_current ? 'current' : year.status}
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 uppercase tracking-tight mt-1">
                        {year.name}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Duration</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {year.start_date}
                        <span className="text-slate-300 mx-1">/</span>
                        {year.end_date}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Students</p>
                      <div className="flex items-center gap-2 font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">
                        <Users size={14} className="text-emerald-500" />
                        {year.enrollment_count ?? 0} enrollments
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Terms</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{year.terms?.length ?? 0} terms</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Classes</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{year.class_count ?? 0}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!year.is_current && year.status !== 'closed' && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await catalogApi.setCurrentYear(year.id);
                            load();
                          } catch (err) {
                            setError(err.response?.data?.message || 'Failed to set current year');
                          }
                        }}
                        className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                      >
                        Set as current
                      </button>
                    )}
                    <button
                      type="button"
                      className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>

                {year.terms?.length > 0 && (
                  <div className="bg-slate-50/50 p-6 border-t border-slate-50 flex gap-4 overflow-x-auto">
                    {year.terms.map((term) => (
                      <div
                        key={term.id}
                        className="min-w-[200px] bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 shadow-sm"
                      >
                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">
                          {term.name}
                          {term.term_number ? ` (#${term.term_number})` : ''}
                          {term.is_current ? ' · current' : ''}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">
                          {term.status} · {term.start_date} – {term.end_date}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-10">
            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 mb-2">Initialize Year</h3>
            <p className="text-slate-500 font-medium mb-8">Set the date range for the new academic year.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                  Year name
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025/2026"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                    Start
                  </label>
                  <input
                    type="date"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 font-bold"
                    value={formData.start}
                    onChange={(e) => setFormData((f) => ({ ...f, start: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                    End
                  </label>
                  <input
                    type="date"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 font-bold"
                    value={formData.end}
                    onChange={(e) => setFormData((f) => ({ ...f, end: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Status</label>
                  <select
                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 font-bold"
                    value={formData.status}
                    onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <label className="flex items-end gap-2 pb-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_current}
                    onChange={(e) => setFormData((f) => ({ ...f, is_current: e.target.checked, status: e.target.checked ? 'active' : f.status }))}
                  />
                  Set as current year
                </label>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase hover:bg-emerald-600 flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AcademicCycle;
