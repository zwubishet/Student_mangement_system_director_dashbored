import { useState, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import AdminLayout from '../components/layouts/AdminLayout';
import AddStudentModal from '../components/students/AddStudentModal';
import StudentDetailDrawer from '../components/students/StudentDetailDrawer';
import { 
  Search, UserPlus, Filter, MoreVertical, 
  Loader2, Phone, GraduationCap, Hash, CheckSquare, Square,
  Users, UserCheck, ShieldAlert, Trash2, ArrowUpRight
} from 'lucide-react';

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
        academicyear { id name }
        section { id name grade { name } }
      }
      parentstudents(limit: 1) {
        parent { id email phone first_name last_name }
      }
      user { id email }
    }
  }
`;

const Students = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data, loading, error, refetch } = useQuery(GET_STUDENTS_FULL, {
    fetchPolicy: 'cache-and-network',
  });

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

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredStudents.length) setSelectedRows([]);
    else setSelectedRows(filteredStudents.map(s => s.id));
  };

  const toggleRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto p-6">
        
        {/* --- DYNAMIC STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Enrolled', val: data?.student_students.length || 0, color: 'bg-indigo-50 text-indigo-600', icon: Users },
            { label: 'Active Now', val: data?.student_students.filter(s => s.status === 'active').length || 0, color: 'bg-emerald-50 text-emerald-600', icon: UserCheck },
            { label: 'Grade Sections', val: [...new Set(data?.student_students.map(s => s.studentenrollments?.[0]?.section?.id))].length - 1, color: 'bg-amber-50 text-amber-600', icon: GraduationCap },
            { label: 'Attention Required', val: '3', color: 'bg-rose-50 text-rose-600', icon: ShieldAlert },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}><stat.icon size={24} /></div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.val}</h3>
            </div>
          ))}
        </div>

        {/* --- HEADER --- */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Student Registry</h1>
            <p className="text-slate-500 font-medium mt-2">Central database for institutional intelligence.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-600 transition-all">
            <UserPlus size={18} /> Admit Student
          </button>
        </div>

        {/* --- ACTION BAR & FILTERS --- */}
        <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4 sticky top-6 z-20">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input type="text" placeholder="Search identity records..." className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-600 border-none focus:ring-2 focus:ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {selectedRows.length > 0 ? (
            <div className="flex items-center gap-3 bg-indigo-600 p-2 rounded-2xl animate-in zoom-in">
              <span className="px-4 text-white text-[10px] font-black uppercase">{selectedRows.length} Selected</span>
              <button className="bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/30 transition-all">Promote</button>
              <button className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-rose-600 transition-all"><Trash2 size={14}/></button>
            </div>
          ) : (
            <div className="flex gap-3">
              <select onChange={(e) => setFilterGrade(e.target.value)} className="px-6 py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase outline-none border-none">
                <option value="all">All Grades</option>
              </select>
              <select onChange={(e) => setFilterStatus(e.target.value)} className="px-6 py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase outline-none border-none">
                <option value="all">Any Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-300 hover:text-indigo-600 transition-colors">
                    {selectedRows.length === filteredStudents.length ? <CheckSquare size={20} className="text-indigo-600"/> : <Square size={20}/>}
                  </button>
                </th>
                <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Admission</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Placement</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((s) => (
                <tr key={s.id} onClick={() => { setSelectedStudent(s); setIsDrawerOpen(true); }} className="group hover:bg-indigo-50/30 transition-all cursor-pointer">
                  <td className="px-8 py-5" onClick={(e) => { e.stopPropagation(); toggleRow(s.id); }}>
                    {selectedRows.includes(s.id) ? <CheckSquare size={20} className="text-indigo-600"/> : <Square size={20} className="text-slate-200 group-hover:text-slate-300"/>}
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs group-hover:bg-indigo-600 transition-all">{s.first_name[0]}{s.last_name[0]}</div>
                      <div>
                        <p className="font-black text-slate-900">{s.first_name} {s.last_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{s.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-mono text-[11px] font-black text-indigo-600 uppercase tracking-tighter">{s.admission_number}</td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-700">{s.studentenrollments[0]?.section?.grade?.name} {s.studentenrollments[0]?.section?.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{s.studentenrollments[0]?.academicyear?.name}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${s.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={refetch} />
      <StudentDetailDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} student={selectedStudent} />
    </AdminLayout>
  );
};

export default Students;