import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@apollo/client/react';
import { ASSIGN_TEACHER, GET_ASSIGNMENT_METADATA } from '../../api/classGql';
import { X, Loader2, UserCheck, BookOpen } from 'lucide-react';

const AssignTeacherModal = ({ isOpen, onClose, sectionId, sectionName, onRefresh }) => {
  const { register, handleSubmit, reset } = useForm();
  
  // Fetching metadata based on your specific structure
  const { data: meta, loading: metaLoading } = useQuery(GET_ASSIGNMENT_METADATA, {
    skip: !isOpen
  });

  const [assignTeacher, { loading: mutationLoading }] = useMutation(ASSIGN_TEACHER, {
    onCompleted: () => {
      reset();
      onRefresh();
      onClose();
    },
    onError: (err) => alert(`Assignment failed: ${err.message}`)
  });

  if (!isOpen) return null;

  const onSubmit = (data) => {
    assignTeacher({
      variables: {
        section_id: sectionId,
        subject_id: data.subject_id,
        teacher_user_id: data.teacher_user_id // This is the 'id' from identity_users
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">Assign Teacher</h2>
            <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mt-1">
              Section: {sectionName}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Subject Dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Subject</label>
            <div className="relative">
              <select 
                {...register("subject_id", { required: true })} 
                className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold focus:border-indigo-500 outline-none appearance-none bg-white"
              >
                <option value="">Choose a subject...</option>
                {meta?.academic_subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
              <BookOpen className="absolute right-4 top-4 text-slate-300 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Teacher Dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Instructor</label>
            <div className="relative">
              <select 
                {...register("teacher_user_id", { required: true })} 
                className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold focus:border-indigo-500 outline-none appearance-none bg-white"
              >
                <option value="">Choose a teacher...</option>
                {meta?.identity_userroles?.map((role, idx) => {
                  const t = role.user?.teacher;
                  const userId = role.user?.id;
                  if (!t) return null;
                  return (
                    <option key={idx} value={userId}>
                      {t.first_name} {t.last_name} ({t.status})
                    </option>
                  );
                })}
              </select>
              <UserCheck className="absolute right-4 top-4 text-slate-300 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button 
              type="submit" 
              disabled={mutationLoading || metaLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
            >
              {mutationLoading ? <Loader2 className="animate-spin" /> : "Finalize Assignment"}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="w-full py-2 text-slate-400 font-bold text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTeacherModal;