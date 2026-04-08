import { useState, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import AdminLayout from '../components/layouts/AdminLayout';
import AddStudentModal from '../components/students/AddStudentModal';
import StudentDetailDrawer from '../components/students/StudentDetailDrawer';
import { 
  Search, UserPlus, Filter, MoreVertical, 
  Loader2, Phone, GraduationCap, Hash, LayoutGrid, List 
} from 'lucide-react';

// --- QUERY DEFINITION ---
const GET_STUDENTS_FULL = gql`
  query GetDetailedStudents {
    student_students(order_by: { created_at: desc }) {
      id
      first_name
      last_name
      admission_number
      status
      gender
      date_of_birth
      studentenrollments(limit: 1, order_by: { enrolled_at: desc }) {
        id
        academicyear {
          id
          name
        }
        section {
          id
          name
          grade {
            name
          }
        }
      }
      parentstudents(limit: 1) {
        parent {
          id
          email
          phone
          first_name
          last_name
        }
      }
      user {
        id
        email
      }
    }
  }
`;

const Students = () => {
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data, loading, error, refetch } = useQuery(GET_STUDENTS_FULL, {
    fetchPolicy: 'cache-and-network',
  });

  // --- FILTER LOGIC ---
  const filteredStudents = useMemo(() => {
    if (!data?.student_students) return [];
    
    return data.student_students.filter(student => {
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
      const admNo = (student.admission_number || '').toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || admNo.includes(searchTerm.toLowerCase());
      
      const enrollment = student.studentenrollments?.[0];
      const gradeName = enrollment?.section?.grade?.name || 'Unassigned';
      const matchesGrade = filterGrade === 'all' || gradeName === filterGrade;
      
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus;

      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [data, searchTerm, filterGrade, filterStatus]);

  // Extract unique grades for the filter dropdown
  const uniqueGrades = useMemo(() => {
    if (!data?.student_students) return [];
    const grades = data.student_students.map(s => s.studentenrollments?.[0]?.section?.grade?.name).filter(Boolean);
    return [...new Set(grades)];
  }, [data]);

  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  if (error) return (
    <AdminLayout>
      <div className="p-10 bg-rose-50 border-2 border-rose-100 rounded-[3rem] text-rose-600 flex flex-col items-center gap-4">
        <Hash size={40} className="opacity-20" />
        <p className="font-black uppercase tracking-widest text-xs">Registry Synchronization Error</p>
        <p className="font-bold">{error.message}</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto p-6">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Student Registry</h1>
            <p className="text-slate-500 font-medium mt-2 text-lg">Manage institutional enrollment and academic histories.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-slate-200 active:scale-95"
          >
            <UserPlus size={18} />
            Admit New Student
          </button>
        </div>

        {/* --- DYNAMIC FILTER BAR --- */}
        <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search by name, admission number, or email..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all font-bold text-slate-700 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={filterGrade} 
              onChange={(e) => setFilterGrade(e.target.value)}
              className="px-6 py-4 bg-white border-2 border-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All Grades</option>
              {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-4 bg-white border-2 border-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">Any Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          <div className="h-10 w-[1px] bg-slate-100 hidden lg:block mx-2" />
          
          <div className="flex items-center gap-2 px-4">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {filteredStudents.length} Records
            </p>
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Identity</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Admission #</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Level / Class</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Primary Guardian</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-8 py-8"><div className="h-6 bg-slate-100 rounded-lg w-full" /></td>
                    </tr>
                  ))
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const enrollment = student.studentenrollments?.[0];
                    const guardian = student.parentstudents?.[0]?.parent;
                    
                    return (
                      <tr 
                        key={student.id} 
                        onClick={() => handleRowClick(student)}
                        className="group hover:bg-indigo-50/30 transition-all cursor-pointer"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm group-hover:bg-indigo-600 transition-colors">
                              {student.first_name[0]}{student.last_name[0]}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-base">{student.first_name} {student.last_name}</p>
                              <p className="text-xs text-slate-400 font-bold lowercase">{student.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="font-mono text-[11px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                            {student.admission_number || 'N/A'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-700">
                              {enrollment?.section?.grade?.name} {enrollment?.section?.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                              {enrollment?.academicyear?.name || 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          {guardian ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-800">{guardian.email}</span>
                              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase">
                                <Phone size={10} className="text-indigo-400" /> {guardian.phone || 'No Phone'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black uppercase text-slate-300 italic tracking-tighter">No Link</span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                              student.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                            }`}>
                              {student.status}
                            </span>
                            <MoreVertical size={18} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-30">
                        <Filter size={40} />
                        <p className="font-black uppercase tracking-widest text-xs">No matching students found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODALS & DRAWERS --- */}
      <AddStudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={() => refetch()} 
      />
      
      <StudentDetailDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        student={selectedStudent} 
      />
    </AdminLayout>
  );
};

export default Students;