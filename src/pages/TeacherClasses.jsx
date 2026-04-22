import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_TEACHER_SECTIONS } from '../api/teacherGql';
import AdminLayout from '../components/layouts/AdminLayout';
import { 
  BookOpen, Users, ArrowRight, Loader2, 
  Search, ClipboardCheck, GraduationCap, Calendar
} from 'lucide-react';

const TeacherClasses = () => {
  const navigate = useNavigate();
  const teacherId = localStorage.getItem('userId');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading } = useQuery(GET_TEACHER_SECTIONS, {
    variables: { teacherId },
    fetchPolicy: 'network-only'
  });

  const assignments = data?.academic_teacher_assignments || [];

  const filteredAssignments = assignments.filter(a => 
    a.section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <AdminLayout>
      <div className="py-40 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-black uppercase tracking-[0.3em] text-[10px]">Loading Your Schedule</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-10 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">My Classes</h1>
            <p className="text-slate-500 font-medium text-lg">Manage your assigned sections and student performance.</p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search sections or subjects..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* CLASS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAssignments.map((item) => (
            <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group overflow-hidden flex flex-col">
              
              {/* TOP SECTION: Subject Card */}
              <div className="p-8 pb-0">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <BookOpen size={24} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      Active
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">
                  {item.subject.name}
                </h3>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-tighter">
                  <GraduationCap size={16} />
                  <span>Grade {item.section.grade.name} — {item.section.name}</span>
                </div>
              </div>

              {/* STATS BAR */}
              <div className="px-8 mt-8 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Roster</p>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-indigo-500" />
                    <span className="text-lg font-black text-slate-800">{item.section.studentenrollments_aggregate.aggregate.count} Students</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Schedule</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-indigo-500" />
                    <span className="text-lg font-black text-slate-800">Mon/Wed</span>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="p-8 mt-auto grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate(`/teachers/attendance/${item.section.id}`)}
                  className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                >
                  <ClipboardCheck size={14} /> Attendance
                </button>
                <button 
                  onClick={() => navigate(`/teachers/grading/${item.section.id}`)}
                  className="flex items-center justify-center gap-2 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all"
                >
                  View Roster <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredAssignments.length === 0 && (
          <div className="py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <BookOpen size={32} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900">No Assignments Found</h3>
            <p className="text-slate-400 max-w-sm mt-2">You aren't currently assigned to any active sections. Contact the administrator if this is an error.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TeacherClasses;