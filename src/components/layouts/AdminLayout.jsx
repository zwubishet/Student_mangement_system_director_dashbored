import { Link, useNavigate } from 'react-router-dom';
import { Shield, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import AppShell from './AppShell';
import { schoolAdminNav, teacherNav, parentNav } from '../../navigation/menuKeys';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, exitSchoolWorkspace } = useAuth();
  const { t } = useI18n();
  const managingId = user?.managingSchool?.id
    || (user?.role === 'SUPER_ADMIN' ? sessionStorage.getItem('managingSchoolId') : null);
  const managingName = user?.managingSchool?.name
    || sessionStorage.getItem('managingSchoolName')
    || 'School';
  const isPlatformManage = user?.role === 'SUPER_ADMIN' && !!managingId;
  const managing = isPlatformManage ? { id: managingId, name: managingName } : null;

  const menuMap = {
    TEACHER: teacherNav,
    SCHOOL_ADMIN: schoolAdminNav,
    PARENT: parentNav,
  };
  const nav = isPlatformManage ? schoolAdminNav : (menuMap[user?.role] || schoolAdminNav);

  const banner = isPlatformManage ? (
    <div className="bg-violet-600 text-white px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 font-bold">
        <Shield size={16} />
        <span>{t('superAdmin.managingSchool')}</span>
        <span className="font-black">{managing.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <Link to={`/super-admin/schools/${managing.id}`} className="text-xs font-bold underline opacity-90 hover:opacity-100">
          {t('superAdmin.schoolOverview')}
        </Link>
        <button
          type="button"
          onClick={() => {
            exitSchoolWorkspace();
            navigate('/super-admin/dashboard');
          }}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-black uppercase"
        >
          <X size={14} /> {t('superAdmin.exitPlatform')}
        </button>
      </div>
    </div>
  ) : null;

  return (
    <AppShell nav={nav} accent="emerald" banner={banner}>
      {children}
    </AppShell>
  );
};

export default AdminLayout;
