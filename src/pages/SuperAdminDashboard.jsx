import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import AdminLayout from '../components/layouts/AdminLayout';
import { useToast } from '../context/ToastContext';
import { Building2, Users, CheckCircle2, XCircle, Loader2, RefreshCw, Shield } from 'lucide-react';

const GET_ALL_SCHOOLS = gql`
  query GetAllSchools {
    tenancy_schools(order_by: {created_at: desc}) {
      id
      name
      school_address
      status
      created_at
      users_aggregate {
        aggregate { count }
      }
    }
  }
`;

const TOGGLE_SCHOOL = gql`
  mutation ToggleSchool($school_id: uuid!, $status: String!) {
    UpdateSchoolStatusAction(object: { school_id: $school_id, status: $status }) {
      id
      name
      status
    }
  }
`;

const statusColors = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  inactive: 'bg-slate-50 text-slate-500 border-slate-100',
  suspended: 'bg-rose-50 text-rose-700 border-rose-100',
};

const SuperAdminDashboard = () => {
  const { data, loading, refetch } = useQuery(GET_ALL_SCHOOLS);
  const { toast } = useToast();
  const [toggling, setToggling] = useState(null);

  const [toggleSchool] = useMutation(TOGGLE_SCHOOL, {
    onCompleted: (d) => {
      toast(`${d.UpdateSchoolStatusAction.name} is now ${d.UpdateSchoolStatusAction.status}`, 'success');
      setToggling(null);
      refetch();
    },
    onError: (e) => { toast(e.message, 'error'); setToggling(null); },
  });

  const handleToggle = (school) => {
    const newStatus = school.status === 'active' ? 'suspended' : 'active';
    setToggling(school.id);
    toggleSchool({ variables: { school_id: school.id, status: newStatus } });
  };

  const schools = data?.tenancy_schools || [];
  const activeCount = schools.filter(s => s.status === 'active').length;

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Super Admin Console</h1>
            <p className="text-slate-500 font-medium mt-1">Manage all schools on the platform.</p>
          </div>
          <button onClick={() => refetch()} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Schools', value: schools.length, icon: <Building2 size={24} className="text-indigo-600" />, bg: 'bg-indigo-50' },
            { label: 'Active Schools', value: activeCount, icon: <CheckCircle2 size={24} className="text-emerald-600" />, bg: 'bg-emerald-50' },
            { label: 'Suspended', value: schools.length - activeCount, icon: <XCircle size={24} className="text-rose-600" />, bg: 'bg-rose-50' },
          ].map(s => (
            <div key={s.label} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center`}>{s.icon}</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <p className="text-3xl font-black text-slate-900">{loading ? '...' : s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Schools Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center gap-3">
            <Shield size={20} className="text-indigo-600" />
            <h2 className="text-xl font-black text-slate-900">All Schools</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
          ) : (
            <div className="divide-y divide-slate-50">
              {schools.map(school => (
                <div key={school.id} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-lg">
                      {school.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{school.name}</p>
                      <p className="text-sm text-slate-400 font-medium">{school.school_address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                      <Users size={16} />
                      {school.users_aggregate.aggregate.count} users
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[school.status] || statusColors.inactive}`}>
                      {school.status}
                    </span>
                    <button
                      disabled={toggling === school.id}
                      onClick={() => handleToggle(school)}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        school.status === 'active'
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                      }`}
                    >
                      {toggling === school.id ? <Loader2 className="animate-spin" size={14} /> : school.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
              {schools.length === 0 && (
                <div className="py-20 text-center text-slate-400 font-medium">No schools registered yet.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SuperAdminDashboard;
