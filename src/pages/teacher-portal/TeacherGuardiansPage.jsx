import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { teacherPortalApi } from '../../api/services';

export default function TeacherGuardiansPage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherPortalApi.getGuardianDirectory(sectionId)
      .then((r) => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [sectionId]);

  if (loading || !data) {
    return <TeacherLayout><div className="h-48 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 animate-pulse" /></TeacherLayout>;
  }

  const byStudent = {};
  for (const row of data.contacts || []) {
    if (!row.guardian_id) continue;
    if (!byStudent[row.student_id]) {
      byStudent[row.student_id] = {
        student: row,
        guardians: [],
      };
    }
    byStudent[row.student_id].guardians.push(row);
  }

  return (
    <TeacherLayout title="Guardian directory" subtitle="Read-only — contact via school office">
      <div className="space-y-6 max-w-3xl">
        <Button variant="secondary" onClick={() => navigate(`/teachers/classes/${sectionId}`)}>
          <ArrowLeft size={16} /> Back
        </Button>

        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 px-4 py-3 rounded-xl">
          {data.note}
        </p>

        {Object.keys(byStudent).length === 0 ? (
          <p className="text-slate-500 text-sm">No guardians linked to students in this class.</p>
        ) : (
          Object.values(byStudent).map(({ student, guardians }) => (
            <section key={student.student_id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">
                {student.first_name} {student.last_name}
                <span className="text-slate-400 font-medium text-sm ml-2">{student.admission_number}</span>
              </h3>
              <ul className="mt-3 space-y-2">
                {guardians.map((g) => (
                  <li key={g.guardian_id} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-sm flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-bold">
                        {g.guardian_first_name} {g.guardian_last_name}
                        {g.is_primary && <Badge color="green" className="ml-2">Primary</Badge>}
                      </p>
                      <p className="text-xs text-slate-500">{g.relationship}</p>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      {g.guardian_email && (
                        <p className="flex items-center gap-1"><Mail size={12} /> {g.guardian_email}</p>
                      )}
                      {g.guardian_phone && (
                        <p className="flex items-center gap-1"><Phone size={12} /> {g.guardian_phone}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </TeacherLayout>
  );
}
