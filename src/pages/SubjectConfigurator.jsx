import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  ArrowLeft, Plus, Trash2, Loader2, BookOpen,
  Users, Save, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';

const GET_CONFIGURATOR_DATA = gql`
  query GetConfiguratorData($examId: uuid!) {
    operations_exams_by_pk(id: $examId) {
      id name status weightage
    }
    operations_examsubjects(where: { exam_id: { _eq: $examId } }) {
      id max_score passing_score
      subject { id name }
      section { id name class { name } }
    }
    academic_subjects { id name }
    academic_sections {
      id name
      class { name }
    }
  }
`;

const ADD_EXAM_SUBJECT = gql`
  mutation AddExamSubject($object: operations_examsubjects_insert_input!) {
    insert_operations_examsubjects_one(
      object: $object
      on_conflict: {
        constraint: examsubjects_exam_id_subject_id_section_id_key
        update_columns: [max_score, passing_score]
      }
    ) { id }
  }
`;

const REMOVE_EXAM_SUBJECT = gql`
  mutation RemoveExamSubject($id: uuid!) {
    delete_operations_examsubjects_by_pk(id: $id) { id }
  }
`;

const UPDATE_EXAM_WEIGHTAGE = gql`
  mutation UpdateExamWeightage($id: uuid!, $weightage: numeric!) {
    update_operations_exams_by_pk(pk_columns: { id: $id }, _set: { weightage: $weightage }) {
      id weightage
    }
  }
`;

export default function SubjectConfigurator() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ subjectId: '', sectionId: '', maxScore: '100', passingScore: '50' });
  const [formError, setFormError] = useState('');
  const [weightage, setWeightage] = useState('');
  const [weightSaved, setWeightSaved] = useState(false);

  const { data, loading, refetch } = useQuery(GET_CONFIGURATOR_DATA, {
    variables: { examId },
    onCompleted: d => {
      if (d?.operations_exams_by_pk?.weightage != null) {
        setWeightage(String(d.operations_exams_by_pk.weightage));
      }
    }
  });

  const [addSubject, { loading: adding }] = useMutation(ADD_EXAM_SUBJECT);
  const [removeSubject] = useMutation(REMOVE_EXAM_SUBJECT);
  const [updateWeightage, { loading: savingWeight }] = useMutation(UPDATE_EXAM_WEIGHTAGE);

  const exam = data?.operations_exams_by_pk;
  const configured = data?.operations_examsubjects || [];
  const allSubjects = data?.academic_subjects || [];
  const allSections = data?.academic_sections || [];

  // Subjects not yet added for the selected section
  const configuredKeys = useMemo(() =>
    new Set(configured.map(es => `${es.subject.id}__${es.section?.id}`)),
    [configured]
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    const max = parseFloat(form.maxScore);
    const pass = parseFloat(form.passingScore);
    if (!form.subjectId || !form.sectionId) { setFormError('Select a subject and section.'); return; }
    if (isNaN(max) || max <= 0) { setFormError('Max score must be > 0.'); return; }
    if (isNaN(pass) || pass < 0 || pass > max) { setFormError('Passing score must be between 0 and max score.'); return; }
    if (configuredKeys.has(`${form.subjectId}__${form.sectionId}`)) {
      setFormError('This subject/section combination already exists.'); return;
    }
    try {
      await addSubject({
        variables: {
          object: {
            exam_id: examId,
            subject_id: form.subjectId,
            section_id: form.sectionId,
            max_score: max,
            passing_score: pass,
          }
        }
      });
      setForm(prev => ({ ...prev, subjectId: '', sectionId: '' }));
      refetch();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Remove this subject from the exam?')) return;
    await removeSubject({ variables: { id } });
    refetch();
  };

  const handleSaveWeightage = async () => {
    const w = parseFloat(weightage);
    if (isNaN(w) || w < 0 || w > 100) return;
    await updateWeightage({ variables: { id: examId, weightage: w } });
    setWeightSaved(true);
    setTimeout(() => setWeightSaved(false), 2000);
  };

  if (loading) return (
    <AdminLayout>
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" size={32} />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="bg-white min-h-screen">
        {/* HEADER */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate('/school-admin/grading')}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h1 className="text-base font-black text-slate-900">{exam?.name}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Subject Configurator
              </p>
            </div>
            <div className="ml-auto">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                exam?.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600' :
                exam?.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600' :
                exam?.status === 'COMPLETED' ? 'bg-amber-50 text-amber-600' :
                'bg-slate-100 text-slate-500'
              }`}>
                {exam?.status}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          {/* WEIGHTAGE CARD */}
          <div className="border border-slate-200 rounded-xl p-5">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
              Exam Weightage
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weightage}
                  onChange={e => setWeightage(e.target.value)}
                  className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-slate-900 transition-colors pr-8"
                  placeholder="e.g. 30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
              </div>
              <button
                onClick={handleSaveWeightage}
                disabled={savingWeight}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {savingWeight ? <Loader2 size={14} className="animate-spin" /> : weightSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                {weightSaved ? 'Saved!' : 'Save'}
              </button>
              <p className="text-xs text-slate-400">
                Contribution to the term grade (e.g. Midterm = 30%, Final = 70%)
              </p>
            </div>
          </div>

          {/* ADD SUBJECT FORM */}
          <div className="border border-slate-200 rounded-xl p-5">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
              Add Subject to Exam
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Subject</label>
                  <select
                    value={form.subjectId}
                    onChange={e => setForm(p => ({ ...p, subjectId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-slate-900 bg-white transition-colors"
                  >
                    <option value="">Select subject...</option>
                    {allSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Section</label>
                  <select
                    value={form.sectionId}
                    onChange={e => setForm(p => ({ ...p, sectionId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-slate-900 bg-white transition-colors"
                  >
                    <option value="">Select section...</option>
                    {allSections.map(s => (
                      <option key={s.id} value={s.id}>{s.class?.name} — {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Max Score</label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxScore}
                    onChange={e => setForm(p => ({ ...p, maxScore: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Passing Score</label>
                  <input
                    type="number"
                    min="0"
                    value={form.passingScore}
                    onChange={e => setForm(p => ({ ...p, passingScore: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-rose-600 text-xs font-medium bg-rose-50 px-3 py-2 rounded-lg">
                  <AlertCircle size={14} /> {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={adding}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add Subject
              </button>
            </form>
          </div>

          {/* CONFIGURED SUBJECTS TABLE */}
          <div>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
              Configured Subjects <span className="text-slate-300 font-normal ml-1">({configured.length})</span>
            </h2>

            {configured.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl py-12 text-center">
                <BookOpen className="mx-auto text-slate-200 mb-3" size={32} />
                <p className="text-slate-400 text-sm font-medium">No subjects configured yet.</p>
                <p className="text-slate-300 text-xs mt-1">Use the form above to add subjects.</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Subject</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Section</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Max Score</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Passing</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {configured.map(es => (
                      <tr key={es.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-indigo-50 rounded-md">
                              <BookOpen size={14} className="text-indigo-500" />
                            </div>
                            <span className="font-bold text-slate-900 text-sm">{es.subject.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <Users size={13} className="text-slate-400" />
                            <span className="text-sm text-slate-600 font-medium">
                              {es.section?.class?.name} — {es.section?.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="font-bold text-slate-900 text-sm">{es.max_score}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="text-sm text-slate-500 font-medium">{es.passing_score ?? '—'}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleRemove(es.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
