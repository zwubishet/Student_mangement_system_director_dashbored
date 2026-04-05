import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client/react';
import { CREATE_TEACHER } from '../../api/teacherGql';
import { X, Loader2, CheckCircle2 } from 'lucide-react';

const AddTeacherModal = ({ isOpen, onClose, onRefresh }) => {
  const { register, handleSubmit, reset } = useForm();

  const [createTeacher, { loading }] = useMutation(CREATE_TEACHER, {
    onCompleted: () => {
      reset();
      onRefresh();
      onClose();
    },
    onError: (err) => alert(`Error: ${err.message}`)
  });

  if (!isOpen) return null;

  const onSubmit = (data) => {
    createTeacher({
      variables: {
        object: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          hire_date: data.hire_date,
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">Add Faculty Member</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input {...register("first_name", { required: true })} className="teacher-input" placeholder="First Name" />
            <input {...register("last_name", { required: true })} className="teacher-input" placeholder="Last Name" />
            <input {...register("email", { required: true })} type="email" className="teacher-input md:col-span-2" placeholder="Email Address" />
            <input {...register("phone", { required: true })} className="teacher-input" placeholder="Phone Number" />
            <input {...register("hire_date", { required: true })} type="date" className="teacher-input" />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> Confirm Hire</>}
            </button>
            <button type="button" onClick={onClose} className="px-8 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-bold">Cancel</button>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .teacher-input { width: 100%; padding: 1rem; border-radius: 1rem; border: 2px solid #f1f5f9; font-weight: 600; outline: none; transition: border-color 0.2s; }
        .teacher-input:focus { border-color: #6366f1; }
      `}} />
    </div>
  );
};

export default AddTeacherModal;