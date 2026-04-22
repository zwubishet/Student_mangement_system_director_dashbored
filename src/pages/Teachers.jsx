import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_TEACHERS } from '../api/teacherGql'; // Ensure this query fetches assignments/subjects
import AdminLayout from '../components/layouts/AdminLayout';
import AddTeacherModal from '../components/teachers/AddTeacherModal';
import TeacherDetailDrawer from '../components/teachers/TeacherDetailDrawer';
import { 
  UserPlus, Search, Mail, Phone, Calendar, 
  BookOpen, Award, BarChart3, MoreVertical, Filter,
  Users, CheckCircle, Clock
} from 'lucide-react';

const Teachers = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, loading, refetch } = useQuery(GET_TEACHERS, {
    fetchPolicy: 'cache-and-network'
  });

  const teachers = data?.academic_teachers || [];

  // Filter Logic
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => 
      `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teachers, searchTerm]);

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto p-6">
        
        {/* --- KPI STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Faculty', val: teachers.length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Users },
            { label: 'Active Teaching', val: teachers.filter(t => t.status === 'active').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
            { label: 'Avg. Workload', val: '18h/wk', color: 'text-amber-600', bg: 'bg-amber-50', icon: BarChart3 },
            { label: 'On Leave', val: '2', color: 'text-rose-600', bg: 'bg-rose-50', icon: Clock },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}><stat.icon size={24} /></div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.val}</h3>
            </div>
          ))}
        </div>

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Faculty Directory</h1>
            <p className="text-slate-500 font-medium mt-2 text-lg">Manage academic staff, specializations, and deployments.</p>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl active:scale-95"
          >
            <UserPlus size={18} /> Onboard Faculty
          </button>
        </div>

        {/* --- SEARCH & FILTER --- */}
        <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, subject, or email..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-600 transition-all">
            <Filter size={20} />
          </button>
        </div>

        {/* --- TEACHER TABLE --- */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Member</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTeachers.map((teacher) => (
                <tr 
                  key={teacher.id} 
                  onClick={() => setSelectedTeacher(teacher)}
                  className="hover:bg-indigo-50/30 transition-all cursor-pointer group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black group-hover:bg-indigo-600 transition-all">
                        {teacher.first_name[0]}{teacher.last_name[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{teacher.first_name} {teacher.last_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Hire Date: {teacher.hire_date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {/* Assuming teacher.subjects exists or placeholder chips */}
                      <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black text-indigo-500 uppercase">Mathematics</span>
                      <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase">+2 more</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-2"><Mail size={12} className="text-slate-300"/> {teacher.email}</p>
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><Phone size={12} className="text-slate-300"/> {teacher.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <BookOpen size={14} className="text-indigo-400" />
                       <span className="text-xs font-black text-slate-700">4 Classes</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                        teacher.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {teacher.status}
                      </span>
                      <MoreVertical size={18} className="text-slate-200 group-hover:text-slate-900" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddTeacherModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onRefresh={refetch} />
      {/* New Teacher Detail Drawer */}
      <TeacherDetailDrawer 
        isOpen={!!selectedTeacher} 
        onClose={() => setSelectedTeacher(null)} 
        teacher={selectedTeacher} 
      />
    </AdminLayout>
  );
};

export default Teachers;