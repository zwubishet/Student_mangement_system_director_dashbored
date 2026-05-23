import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FinanceOfficerLayout from '../../components/layouts/FinanceOfficerLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import TeacherHrPanel from '../../components/teachers/TeacherHrPanel';
import { teachersApi } from '../../api/services';

export default function FinanceStaffHrPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  const load = useCallback(() => {
    teachersApi.getOne(id).then((r) => setProfile(r.data.data)).catch(() => setProfile(null));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (!profile) {
    return (
      <FinanceOfficerLayout>
        <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
      </FinanceOfficerLayout>
    );
  }

  return (
    <FinanceOfficerLayout>
      <div className="space-y-6">
        <header className="flex flex-wrap items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/finance/payroll')}>
            <ArrowLeft size={16} /> Back to payroll
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 dark:text-slate-100">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-slate-500 text-sm">
              {profile.staff_id_number && <span>{profile.staff_id_number} · </span>}
              {profile.email}
              {profile.department && ` · ${profile.department}`}
            </p>
          </div>
          <Badge color="green">Staff HR</Badge>
        </header>
        <TeacherHrPanel teacherId={id} profile={profile} onRefresh={load} />
      </div>
    </FinanceOfficerLayout>
  );
}
