import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, Users } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import { classesApi, catalogApi, teachersApi } from '../../api/services';

export default function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignForm, setAssignForm] = useState({ teacher_user_id: '', subject_id: '' });
  const [assigning, setAssigning] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      classesApi.getOne(id),
      teachersApi.list({ page: 1, limit: 100 }),
      catalogApi.getSubjects(),
    ])
      .then(([cRes, tRes, sRes]) => {
        setCls(cRes.data.data);
        setTeachers(tRes.data.data || []);
        setSubjects(sRes.data.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!cls?.section_id) return;
    setAssigning(true);
    try {
      await classesApi.assignTeacher(cls.section_id, assignForm);
      setAssignForm({ teacher_user_id: '', subject_id: '' });
      load();
    } finally {
      setAssigning(false);
    }
  };

  if (loading || !cls) {
    return (
      <AdminLayout>
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/school-admin/classes')}><ArrowLeft size={16} /> Back</Button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-900">{cls.name}</h1>
            <p className="text-slate-500 text-sm">{cls.grade_name} · {cls.section_name} · {cls.academic_year}</p>
          </div>
          <Badge color="green">{cls.enrolled_count ?? 0} / {cls.capacity} enrolled</Badge>
        </header>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-2xl p-4">
            <p className="text-xs text-slate-400 uppercase font-bold">Capacity</p>
            <p className="text-xl font-black">{cls.capacity}</p>
          </div>
          <div className="bg-white border rounded-2xl p-4">
            <p className="text-xs text-slate-400 uppercase font-bold">Seats available</p>
            <p className="text-xl font-black">{cls.seats_available ?? 0}</p>
          </div>
          <div className="bg-white border rounded-2xl p-4">
            <p className="text-xs text-slate-400 uppercase font-bold">Lead teacher</p>
            <p className="text-sm font-bold mt-1">
              {cls.teacher_first_name ? `${cls.teacher_first_name} ${cls.teacher_last_name}` : 'Not assigned'}
            </p>
          </div>
        </div>

        <section className="bg-white border rounded-3xl p-6 space-y-4">
          <h2 className="font-black text-lg flex items-center gap-2"><UserPlus size={18} /> Assign teacher</h2>
          <form onSubmit={handleAssign} className="grid md:grid-cols-3 gap-3 items-end">
            <Select
              label="Teacher"
              required
              value={assignForm.teacher_user_id}
              onChange={(e) => setAssignForm((f) => ({ ...f, teacher_user_id: e.target.value }))}
              options={teachers.map((t) => ({
                value: t.user_id || t.id,
                label: `${t.first_name} ${t.last_name}`,
              }))}
            />
            <Select
              label="Subject"
              required
              value={assignForm.subject_id}
              onChange={(e) => setAssignForm((f) => ({ ...f, subject_id: e.target.value }))}
              options={subjects.map((s) => ({ value: s.id, label: s.name }))}
            />
            <Button type="submit" loading={assigning}>Assign</Button>
          </form>
          <ul className="divide-y">
            {cls.assignments?.length ? cls.assignments.map((a) => (
              <li key={a.id} className="py-3 flex justify-between text-sm">
                <span className="font-bold">{a.subject_name}</span>
                <span className="text-slate-500">{a.first_name} {a.last_name}</span>
              </li>
            )) : <p className="text-slate-400 text-sm">No teacher assignments yet.</p>}
          </ul>
        </section>

        <section className="bg-white border rounded-3xl p-6">
          <h2 className="font-black text-lg flex items-center gap-2 mb-4"><Users size={18} /> Students</h2>
          {cls.students?.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Admission #</th>
                  <th className="pb-2">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cls.students.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2">
                      <Link className="font-bold text-emerald-600 hover:underline" to={`/school-admin/students/${s.id}`}>
                        {s.first_name} {s.last_name}
                      </Link>
                    </td>
                    <td className="py-2">{s.admission_number}</td>
                    <td className="py-2 text-slate-500">{s.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-400 text-sm">No students enrolled in this class yet.</p>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
