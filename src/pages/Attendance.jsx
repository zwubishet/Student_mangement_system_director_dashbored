import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {gql} from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client/react';
import AdminLayout from '../components/layouts/AdminLayout';
import {GET_SECTION_ROSTER, SUBMIT_ATTENDANCE} from '../api/teacherGql'
import { 
  CheckCircle2, XCircle, Clock, Save, 
  ChevronLeft, Loader2, Search, UserCheck, Users 
} from 'lucide-react';

const Attendance = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'present' | 'absent' | 'late' }

  // 1. Fetch Roster (Reusing logic from previous student query)
  const { data, loading } = useQuery(GET_SECTION_ROSTER, { variables: { sectionId } });
  const [submitAttendance, { loading: saving }] = useMutation(SUBMIT_ATTENDANCE);

  const students = data?.academic_sections_by_pk?.studentenrollments || [];
  const sectionName = data?.academic_sections_by_pk?.name;

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    const formattedData = Object.entries(attendanceData).map(([sId, status]) => ({
      student_id: sId,
      section_id: sectionId,
      status: status,
      date: new Date().toISOString().split('T')[0] // Today's Date
    }));

    await submitAttendance({ variables: { objects: formattedData } });
    alert("Attendance Synced Successfully!");
  };

  if (loading) return <AdminLayout><div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Roll Call</h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{sectionName} — {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving || Object.keys(attendanceData).length === 0}
            className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Sync Attendance
          </button>
        </div>

        {/* SEARCH & QUICK ACTIONS */}
        <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="Filter names..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-600"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="hidden md:flex gap-2">
            <button 
              onClick={() => students.forEach(s => handleStatusChange(s.student.id, 'present'))}
              className="px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
            >
              Mark All Present
            </button>
          </div>
        </div>

        {/* ROSTER LIST */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {students.filter(s => `${s.student.first_name} ${s.student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())).map((enroll) => {
              const s = enroll.student;
              const currentStatus = attendanceData[s.id];

              return (
                <div key={s.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs uppercase">
                      {s.first_name[0]}{s.last_name[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{s.first_name} {s.last_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{s.admission_number}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <AttendanceBtn 
                      active={currentStatus === 'present'} 
                      onClick={() => handleStatusChange(s.id, 'present')}
                      color="emerald" icon={<CheckCircle2 size={18} />} label="Present" 
                    />
                    <AttendanceBtn 
                      active={currentStatus === 'late'} 
                      onClick={() => handleStatusChange(s.id, 'late')}
                      color="amber" icon={<Clock size={18} />} label="Late" 
                    />
                    <AttendanceBtn 
                      active={currentStatus === 'absent'} 
                      onClick={() => handleStatusChange(s.id, 'absent')}
                      color="rose" icon={<XCircle size={18} />} label="Absent" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Helper Component for the Status Buttons
const AttendanceBtn = ({ active, onClick, color, icon, label }) => {
  const colors = {
    emerald: active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500',
    amber: active ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500',
    rose: active ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500',
  };

  return (
    <button 
      onClick={onClick}
      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${colors[color]}`}
    >
      {icon}
      <span className={active ? 'block' : 'hidden md:block'}>{label}</span>
    </button>
  );
};

export default Attendance;