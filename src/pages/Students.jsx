import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import AdminLayout from '../components/layouts/AdminLayout';
import AddStudentModal from '../components/students/AddStudentModal';
import { Search, UserPlus, Filter, MoreVertical, Loader2, Phone } from 'lucide-react';

const GET_STUDENTS = gql`
  query GetDetailedStudents {
    student_students {
      id
      first_name
      last_name
      admission_number
      status
      # Fetch the latest enrollment for class info
      studentenrollments(limit: 1, order_by: { enrolled_at: desc }) {
        id
        academicyear {
          name
        }
        section {
          name
        }
      }
      # Fetch guardian for contact info
      parentstudents(limit: 1) {
        parent{
            email
            phone
        }
      }
      user {
        email
      }
    }
  }
`;

const Students = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, loading, error, refetch } = useQuery(GET_STUDENTS, {
    fetchPolicy: 'cache-and-network',
  });

  if (error) return (
    <AdminLayout>
      <div className="p-8 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
        <p className="font-bold">Error loading students: {error.message}</p>
      </div>
    </AdminLayout>
  );

  const filteredStudents = data?.student_students.filter(s => 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admission_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Registry</h1>
            <p className="text-slate-500 text-sm font-medium">Manage enrollment and nested student records.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
          >
            <UserPlus size={20} />
            Add New Student
          </button>
        </div>

        {/* SEARCH */}
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or admission number..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-5 py-3 text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-sm font-bold border border-slate-100">
            <Filter size={18} /> Filters
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Admission No</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Year & Class</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Guardian</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse"><td colSpan="5" className="h-20 px-6 py-5 bg-slate-50/20" /></tr>
                  ))
                ) : filteredStudents?.map((student) => {
                  const enrollment = student.studentenrollments?.[0];
                  const guardian = student.parentstudents?.[0];
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{student.first_name} {student.last_name}</p>
                            <p className="text-xs text-slate-400 font-medium">{student.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                          {student.admission_number || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{enrollment?.section?.name || 'Unassigned'}</span>
                          <span className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter">{enrollment?.academicyear?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {guardian ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700">{guardian.parents?.email}</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1"><Phone size={10}/> {guardian.parents?.phone}</span>
                          </div>
                        ) : <span className="text-xs italic text-slate-300">No Guardian info</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${student.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {student.status}
                          </span>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"><MoreVertical size={20} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={() => refetch()} />
    </AdminLayout>
  );
};

export default Students;