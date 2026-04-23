import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import AdminLayout from '../components/layouts/AdminLayout';
import { 
  ChevronLeft, CheckCircle2, XCircle, Clock, 
  Save, Search, Loader2, Check 
} from 'lucide-react';

const todayDate = new Date().toISOString().split('T')[0];

// QUERY: Now fetches existing attendance for TODAY
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
          # Fetch attendance for this specific student on this specific date
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

// MUTATION: Updated to use the correct unique constraint
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

  // Sync existing data from database to local state on load
  useEffect(() => {
    if (data?.academic_sections_by_pk?.studentenrollments) {
      const existingData = {};
      data.academic_sections_by_pk.studentenrollments.forEach(enroll => {
        const existingStatus = enroll.student.attendances[0]?.status;
        if (existingStatus) {
          existingData[enroll.student.id] = existingStatus;
        }
      });
      setAttendanceMap(existingData);
      setIsSynced(true);
    }
  }, [data]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
    setIsSynced(false); // Mark as dirty
  };

  const onSave = async () => {
    const teacherId = localStorage.getItem('userId');
    if (!teacherId) return alert("Session expired. Please log in.");

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
        await refetch(); // Refresh data to confirm sync
        setIsSynced(true);
        alert("Attendance updated successfully!");
    } catch (err) {
        console.error(err);
        alert(`Sync failed: ${err.message}`);
    }
  };

  if (loading) return <AdminLayout><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div></AdminLayout>;

  const section = data?.academic_sections_by_pk;
  const students = section?.studentenrollments || [];

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 p-6">
        
        <div className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daily Roster</h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                {section?.grade?.name} — {section?.name} • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <button 
            onClick={onSave}
            disabled={saving || isSynced}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl 
              ${isSynced ? 'bg-emerald-50 text-emerald-600 shadow-none border border-emerald-100' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-indigo-600'}`}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : isSynced ? <Check size={18} /> : <Save size={18} />}
            {isSynced ? 'Synced' : 'Sync Changes'}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Search student name..." 
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] outline-none font-bold text-slate-600 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {students
              .filter(enroll => {
                const fullName = `${enroll.student.first_name} ${enroll.student.last_name}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase());
              })
              .map((enroll) => {
                const s = enroll.student;
                const status = attendanceMap[s.id];

                return (
                  <div key={s.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                        {s.first_name[0]}{s.last_name[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-none mb-1">{s.first_name} {s.last_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.admission_number}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
                      <StatusBtn active={status === 'present'} onClick={() => handleStatusChange(s.id, 'present')} type="present" icon={<CheckCircle2 size={16} />} label="Present" />
                      <StatusBtn active={status === 'late'} onClick={() => handleStatusChange(s.id, 'late')} type="late" icon={<Clock size={16} />} label="Late" />
                      <StatusBtn active={status === 'absent'} onClick={() => handleStatusChange(s.id, 'absent')} type="absent" icon={<XCircle size={16} />} label="Absent" />
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

const StatusBtn = ({ active, onClick, type, icon, label }) => {
  const styles = {
    present: active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50',
    late: active ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50',
    absent: active ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50',
  };

  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${styles[type]}`}>
      {icon} <span>{label}</span>
    </button>
  );
};

export default AttendancePage;