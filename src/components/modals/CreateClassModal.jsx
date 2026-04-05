import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_CLASSES_FULL_DATA, CREATE_CLASSES_BULK } from '../../api/classGql';
import { X, Loader2, CheckCircle2 } from 'lucide-react';

const CreateClassModal = ({ isOpen, onClose, onRefresh }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      capacity: 30 // Default capacity
    }
  });

  const { data: metaData, loading: metaLoading } = useQuery(GET_CLASSES_FULL_DATA);

  const [createClasses, { loading: mutationLoading }] = useMutation(CREATE_CLASSES_BULK, {
    onCompleted: () => {
      reset();
      onRefresh();
      onClose();
    },
    onError: (err) => alert(`Failed to create classes: ${err.message}`)
  });

  if (!isOpen) return null;

  const onSubmit = (data) => {
    createClasses({
      variables: {
        object: {
          academic_year_id: data.academic_year_id,
          sections: {
            section_id: data.section_id,
            capacity: parseInt(data.capacity)
          }
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
        
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Activate Class</h2>
            <p className="text-slate-500 text-sm font-medium">Link a section to an academic year</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Academic Year Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-indigo-500 ml-1">Target Academic Year</label>
            <select 
              {...register("academic_year_id", { required: true })} 
              className="input-field bg-white"
            >
              <option value="">Select Year</option>
              {metaData?.academic_academicyears.map(y => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-indigo-500 ml-1">Select Section</label>
            <select 
              {...register("section_id", { required: true })} 
              className="input-field bg-white"
            >
              <option value="">Select Section</option>
              {metaData?.academic_sections.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Capacity Input */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-indigo-500 ml-1">Student Capacity</label>
            <input 
              {...register("capacity", { required: true, min: 1 })} 
              type="number" 
              className="input-field" 
              placeholder="e.g. 35"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={mutationLoading} 
              className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {mutationLoading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> Initialize Class</>}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-4 border-2 border-slate-100 text-slate-500 rounded-2xl font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .input-field { 
          width: 100%; 
          padding: 0.875rem 1.25rem; 
          border-radius: 1.25rem; 
          border: 2px solid #f1f5f9; 
          font-weight: 600; 
          font-size: 0.95rem; 
          transition: all 0.2s; 
          outline: none; 
        }
        .input-field:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
      `}} />
    </div>
  );
};

export default CreateClassModal;