import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { teacherPortalApi } from '../../api/services';

export default function TeacherStudentDetailPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherPortalApi.getStudent(studentId).then((r) => setStudent(r.data.data)).finally(() => setLoading(false));
  }, [studentId]);

  if (loading || !student) {
    return <TeacherLayout><div className="h-48 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" /></TeacherLayout>;
  }

  return (
    <TeacherLayout title={`${student.first_name} ${student.last_name}`} subtitle={student.admission_number}>
      <div className="space-y-6 max-w-3xl">
        <Button variant="secondary" onClick={() => navigate('/teachers/students')}><ArrowLeft size={16} /> Back</Button>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400 uppercase font-bold">Attendance rate</p>
            <p className="text-2xl font-black">{student.attendance_rate != null ? `${student.attendance_rate}%` : '—'}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400 uppercase font-bold">Avg exam score</p>
            <p className="text-2xl font-black">{student.exam_summary?.avg_score ?? '—'}</p>
          </div>
        </div>

        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-3 text-sm">
          <div><span className="text-slate-400">Email</span><p className="font-bold">{student.email}</p></div>
          <div><span className="text-slate-400">Gender</span><p className="font-bold">{student.gender || '—'}</p></div>
          <div><span className="text-slate-400">Phone</span><p className="font-bold">{student.phone || '—'}</p></div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="font-black mb-4">Enrollments</h3>
          <ul className="space-y-2">
            {student.enrollments?.map((e) => (
              <li key={e.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl">
                <span className="font-bold">{e.grade_name} · {e.section_name}</span>
                <Badge color="green">{e.status}</Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </TeacherLayout>
  );
}
