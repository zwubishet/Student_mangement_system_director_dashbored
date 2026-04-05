import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_TEACHERS } from '../api/teacherGql';
import AdminLayout from '../components/layouts/AdminLayout';
import AddTeacherModal from '../components/teachers/AddTeacherModal';
import { UserPlus, Search, Mail, Phone, Calendar } from 'lucide-react';

const Teachers = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { data, loading, refetch } = useQuery(GET_TEACHERS);

  const teachers = data?.academic_teachers || [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900">Faculty</h1>
            <p className="text-slate-500 font-medium">Manage your teaching staff and assignments.</p>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <UserPlus size={20} /> Add New Teacher
          </button>
        </div>

        {/* TABLE AREA */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Teacher Name</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Hire Date</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                        {teacher.first_name[0]}{teacher.last_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{teacher.first_name} {teacher.last_name}</p>
                        <p className="text-xs text-slate-400 font-medium uppercase">ID: {teacher.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <Mail size={14} className="text-slate-400" /> {teacher.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <Phone size={14} className="text-slate-400" /> {teacher.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                      <Calendar size={14} className="text-indigo-400" /> {teacher.hire_date}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      teacher.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {teacher.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddTeacherModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onRefresh={refetch} 
      />
    </AdminLayout>
  );
};

export default Teachers;