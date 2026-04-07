import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { CREATE_ACADEMIC_YEAR, CREATE_TERM } from '../../api/academicCycleGql';
import { X, Loader2, CheckCircle2 } from 'lucide-react';

export const AddYearModal = ({ isOpen, onClose, onRefresh }) => {
  const { register, handleSubmit, reset } = useForm();
  const [createYear, { loading }] = useMutation(CREATE_ACADEMIC_YEAR, {
    onCompleted: () => { reset(); onRefresh(); onClose(); },
    onError: (err) => alert(err.message)
  });

  if (!isOpen) return null;

  const onSubmit = (data) => {
    createYear({ variables: { object: data } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">New Academic Year</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Year Name</label>
              <input {...register("name")} placeholder="e.g. 2025/2026 Academic Year" className="year-input" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Start Date</label>
                <input type="date" {...register("start_date")} className="year-input" required />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">End Date</label>
                <input type="date" {...register("end_date")} className="year-input" required />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : "Initialize Year"}
          </button>
        </form>
      </div>
      <style>{`.year-input { width: 100%; padding: 1rem; border-radius: 1rem; border: 2px solid #f1f5f9; font-weight: 600; outline: none; margin-top: 0.5rem; }`}</style>
    </div>
  );
};

export const AddTermModal = ({ isOpen, onClose, academicYearId, onRefresh }) => {
  const { register, handleSubmit, reset } = useForm();
  const [createTerm, { loading }] = useMutation(CREATE_TERM, {
    onCompleted: () => { reset(); onRefresh(); onClose(); },
    onError: (err) => alert(err.message)
  });

  if (!isOpen) return null;

  const onSubmit = (data) => {
    createTerm({ variables: { object: { ...data, academic_year_id: academicYearId } } });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Add Term</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register("name")} placeholder="e.g. Term 1 or Fall Semester" className="year-input" required />
          <div className="grid grid-cols-2 gap-4">
            <input type="date" {...register("start_date")} className="year-input" required />
            <input type="date" {...register("end_date")} className="year-input" required />
          </div>
          <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black">
            {loading ? "Adding..." : "Add Term"}
          </button>
          <button type="button" onClick={onClose} className="w-full text-slate-400 font-bold py-2">Cancel</button>
        </form>
      </div>
    </div>
  );
};