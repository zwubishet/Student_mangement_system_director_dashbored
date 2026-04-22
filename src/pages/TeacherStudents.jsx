import { useState, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import AdminLayout from '../components/layouts/AdminLayout';
import { 
  Search, Filter, Loader2, Phone, GraduationCap, 
  Users, UserCheck, Star, MessageSquare, 
  ChevronRight, TrendingUp, AlertCircle
} from 'lucide-react';

// Fetch students assigned to this teacher's classes
const GET_TEACHER_STUDENTS = gql`
  query GetTeacherStudents($teacherId: uuid!) {
    academic_teacher_assignments(where: { teacher_id: { _eq: $teacherId } }) {
      section {
        id
        name
        grade { name }
        studentenrollments {
          student {
            id
            first_name
            last_name
            admission_number
            status
            # Add performance or attendance if available in your schema
            parentstudents {
              parent { phone first_name last_name }
            }
          }
        }
      }
    }
  }
`;

const TeacherStudents = () => {
  const teacherId = localStorage.getItem('userId');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('all');

  const { data, loading } = useQuery(GET_TEACHER_STUDENTS, {
    variables: { teacherId },
    fetchPolicy: 'cache-and-network',
  });

  // Flatten students from all assigned sections
  const allStudents = useMemo(() => {
    if (!data?.academic_teacher_assignments) return [];
    const studentMap = new Map();
    
    data.academic_teacher_assignments.forEach(assignment => {
      assignment.section.studentenrollments.forEach(enrollment => {
        const s = enrollment.student;
        studentMap.set(s.id, {
          ...s,
          sectionName: assignment.section.name,
          gradeName: assignment.section.grade.name,
          sectionId: assignment.section.id
        });
      });
    });
    return Array.from(studentMap.values());
  }, [data]);

  const filteredStudents = useMemo(() => {
    return allStudents.filter(s => {
      const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSection = filterSection === 'all' || s.sectionId === filterSection;
      return matchesSearch && matchesSection;
    });
  }, [allStudents, searchTerm, filterSection]);

  if (loading) return <AdminLayout><div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto p-6">
        
        {/* --- TEACHER KPI BAR --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4"><Users size={24} /></div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Students</p>
            <h3 className="text-3xl font-black text-slate-900">{allStudents.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><TrendingUp size={24} /></div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avg. Attendance</p>
            <h3 className="text-3xl font-black text-slate-900">94%</h3>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4"><AlertCircle size={24} /></div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Low Performance</p>
            <h3 className="text-3xl font-black text-slate-900">4</h3>
          </div>
        </div>

        {/* --- HEADER --- */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">My Roster</h1>
            <p className="text-slate-500 font-medium mt-2">Instructional groups and student performance tracking.</p>
          </div>
          <div className="flex gap-3">
             <button className="bg-white border border-slate-200 text-slate-900 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all">
               <MessageSquare size={18} /> Bulk Message
             </button>
          </div>
        </div>

        {/* --- FILTERS --- */}
        <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="Search students in my classes..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-600 border-none focus:ring-2 focus:ring-indigo-500" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <select 
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-6 py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase outline-none border-none cursor-pointer"
          >
            <option value="all">All Sections</option>
            {data?.academic_teacher_assignments.map(a => (
              <option key={a.section.id} value={a.section.id}>{a.section.grade.name} - {a.section.name}</option>
            ))}
          </select>
        </div>

        {/* --- STUDENT LIST (GRID VIEW FOR TEACHERS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((s) => (
            <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg group-hover:bg-indigo-600 transition-all">
                    {s.first_name[0]}{s.last_name[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight">{s.first_name} {s.last_name}</h3>
                    <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">{s.gradeName} - {s.sectionName}</p>
                  </div>
                </div>
                <button className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                  <p className="text-sm font-black text-slate-700">98%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Grade</p>
                  <p className="text-sm font-black text-emerald-600">A-</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-300" />
                  <span className="text-[10px] font-bold text-slate-500 tracking-tighter">
                    {s.parentstudents[0]?.parent?.phone || 'No Contact'}
                  </span>
                </div>
                <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeacherStudents;