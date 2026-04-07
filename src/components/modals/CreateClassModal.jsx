import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_CLASSES_FULL_DATA, CREATE_CLASSES_BULK } from '../../api/classGql';
import { X, Loader2, CheckCircle2, Sparkles, Hash } from 'lucide-react';

const CreateClassModal = ({ isOpen, onClose, onRefresh }) => {
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { capacity: 30, sections_raw: "" }
  });

  const { data: metaData } = useQuery(GET_CLASSES_FULL_DATA);
  const sectionsRaw = watch("sections_raw") || "";
  
  // Preview logic for sections
  const sectionsPreview = sectionsRaw.split(',').map(s => s.trim()).filter(s => s !== "");

  const [createClasses, { loading: mutationLoading }] = useMutation(CREATE_CLASSES_BULK, {
    onCompleted: () => {
      reset();
      onRefresh();
      onClose();
    },
    onError: (err) => alert(`Error: ${err.message}`)
  });

  if (!isOpen) return null;

  const onSubmit = (data) => {
    if (sectionsPreview.length === 0) return alert("Please enter at least one section name.");

    createClasses({
      variables: {
        object: {
          academic_year_id: data.academic_year_id,
          grade_name: data.grade_name,
          sections: sectionsPreview.map(name => ({
            section_name: name,
            capacity: parseInt(data.capacity)
          }))
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 overflow-hidden border border-white">
        
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={24} /> Smart Initialize
            </h2>
            <p className="text-slate-500 text-sm font-medium">Create Grade, Sections, and Classes in one go.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-8">
          <div className="space-y-6">
            {/* Year Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-1">Academic Year</label>
              <select {...register("academic_year_id", { required: true })} className="input-field">
                <option value="">Select Active Year</option>
                {metaData?.academic_academicyears.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>

            {/* Grade Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-1">Grade Name</label>
              <input 
                {...register("grade_name", { required: true })} 
                placeholder="e.g. Grade 10" 
                className="input-field" 
              />
            </div>

            {/* Sections Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-1">Sections (Comma Separated)</label>
              <input 
                {...register("sections_raw", { required: true })}
                placeholder="A, B, C, Blue, Gold" 
                className="input-field" 
              />
              {sectionsPreview.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  {sectionsPreview.map((s, i) => (
                    <span key={i} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black text-slate-600 uppercase">
                      Section {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-1">Default Capacity</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  {...register("capacity", { required: true })} 
                  type="number" 
                  className="input-field pl-12" 
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={mutationLoading} 
              className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
            >
              {mutationLoading ? <Loader2 className="animate-spin" /> : "Initialize Classrooms"}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .input-field {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 1.25rem;
          border: 2px solid #f1f5f9;
          font-weight: 700;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus { border-color: #6366f1; background: white; }
      `}</style>
    </div>
  );
};

export default CreateClassModal;