import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import AdminLayout from '../components/layouts/AdminLayout';
import { 
  ChevronLeft, 
  Save, 
  Search, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  XCircle,
  User,
  Hash,
  Filter
} from 'lucide-react';

const todayDate = new Date().toISOString().split('T')[0];

const GET_SECTION_ROSTER = gql`
  query GetSectionRoster($sectionId: uuid!, $date: date!) {
    academic_sections_by_pk(id: $sectionId) {
      id
      name
      school_id
      grade { name }
      studentenrollments {
        student {
          id
          first_name
          last_name
          admission_number
          attendances(where: { 
            _and: [
              { section_id: { _eq: $sectionId } },
              { date: { _eq: $date } }
            ] 
          }) {
            id
            status
          }
        }
      }
    }
  }
`;

const SAVE_ATTENDANCE = gql`
  mutation SaveAttendance($objects: [academic_attendance_insert_input!]!) {
    insert_academic_attendance(
      objects: $objects,
      on_conflict: {
        constraint: attendance_student_section_date_key,
        update_columns: [status]
      }
    ) {
      affected_rows
    }
  }
`;

const AttendancePage = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceMap, setAttendanceMap] = useState({});
  const [isSynced, setIsSynced] = useState(true);

  const { data, loading, refetch } = useQuery(GET_SECTION_ROSTER, {
    variables: { sectionId, date: todayDate },
    fetchPolicy: "network-only"
  });

  const [saveAttendance, { loading: saving }] = useMutation(SAVE_ATTENDANCE);

  useEffect(() => {
    if (data?.academic_sections_by_pk?.studentenrollments) {
      const existingData = {};
      data.academic_sections_by_pk.studentenrollments.forEach(enroll => {
        const existingStatus = enroll.student.attendances[0]?.status;
        if (existingStatus) existingData[enroll.student.id] = existingStatus;
      });
      setAttendanceMap(existingData);
      setIsSynced(true);
    }
  }, [data]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
    setIsSynced(false);
  };

  const onSave = async () => {
    const teacherId = localStorage.getItem('userId');
    const schoolId = data?.academic_sections_by_pk?.school_id;

    const objects = Object.entries(attendanceMap).map(([studentId, status]) => ({
        student_id: studentId,
        section_id: sectionId,
        status: status,
        date: todayDate,
        school_id: schoolId, 
        marked_by: teacherId,
    }));

    try {
        await saveAttendance({ variables: { objects } });
        await refetch();
        setIsSynced(true);
    } catch (err) {
        alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <AdminLayout><div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-900" size={32} /></div></AdminLayout>;

  const section = data?.academic_sections_by_pk;
  const students = section?.studentenrollments || [];

  return (
    <AdminLayout>
      <div className="bg-white min-h-screen">
        
        {/* ACTION BAR / STICKY HEADER */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <ChevronLeft size={24} />
              </button>
              <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Attendance Roster</h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  {section?.grade?.name} — {section?.name} <span className="text-slate-200">•</span> {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={onSave}
                disabled={saving || isSynced}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                  isSynced 
                  ? 'bg-slate-50 text-slate-400 border border-slate-200' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 animate-in fade-in zoom-in'
                }`}
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : isSynced ? <CheckCircle2 size={16} /> : <Save size={16} />}
                {isSynced ? 'All Synced' : 'Sync Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* TABLE DATA */}
        <div className="max-w-[1400px] mx-auto p-6">
          <div className="border border-slate-200 rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-12 text-center">#</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><User size={14} /> Student Details</div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Hash size={14} /> Admission No</div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status Selection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students
                  .filter(enroll => {
                    const fullName = `${enroll.student.first_name} ${enroll.student.last_name}`.toLowerCase();
                    return fullName.includes(searchTerm.toLowerCase());
                  })
                  .map((enroll, index) => {
                    const s = enroll.student;
                    const status = attendanceMap[s.id];

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-300 text-center">
                          {(index + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 text-sm">{s.first_name} {s.last_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            {s.admission_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-2">
                            <StatusToggle active={status === 'present'} onClick={() => handleStatusChange(s.id, 'present')} type="present" icon={<CheckCircle2 size={14} />} label="Present" />
                            <StatusToggle active={status === 'late'} onClick={() => handleStatusChange(s.id, 'late')} type="late" icon={<Clock size={14} />} label="Late" />
                            <StatusToggle active={status === 'absent'} onClick={() => handleStatusChange(s.id, 'absent')} type="absent" icon={<XCircle size={14} />} label="Absent" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          
          {students.length === 0 && (
            <div className="py-20 text-center border border-dashed border-slate-200 mt-4 rounded-lg">
              <Filter className="mx-auto text-slate-200 mb-2" size={32} />
              <p className="text-slate-400 font-medium">No student records found for this section.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const StatusToggle = ({ active, onClick, type, icon, label }) => {
  const themes = {
    present: active ? 'bg-emerald-600 text-white border-emerald-600' : 'text-slate-400 hover:text-emerald-600 border-transparent',
    late: active ? 'bg-amber-500 text-white border-amber-500' : 'text-slate-400 hover:text-amber-500 border-transparent',
    absent: active ? 'bg-rose-600 text-white border-rose-600' : 'text-slate-400 hover:text-rose-600 border-transparent',
  };

  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-4 py-2 border-2 rounded-md transition-all duration-200 font-bold text-[10px] uppercase tracking-wider ${themes[type]}`}
    >
      {icon} <span>{label}</span>
    </button>
  );
};

export default AttendancePage;