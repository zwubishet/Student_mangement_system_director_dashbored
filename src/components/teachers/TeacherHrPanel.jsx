import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, Briefcase, Calendar, Save, UserCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Badge from '../ui/Badge';
import { teachersApi, catalogApi } from '../../api/services';

const ETB = new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 2 });

const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual' },
  { value: 'sick', label: 'Sick' },
  { value: 'maternity', label: 'Maternity' },
  { value: 'paternity', label: 'Paternity' },
  { value: 'bereavement', label: 'Bereavement' },
  { value: 'study', label: 'Study' },
  { value: 'unpaid', label: 'Unpaid' },
];

const CONTRACT_TYPES = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'fixed_term', label: 'Fixed term' },
  { value: 'probation', label: 'Probation' },
  { value: 'hourly', label: 'Hourly' },
];

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'mobile_money', label: 'Mobile money' },
];

export default function TeacherHrPanel({ teacherId, profile, onRefresh }) {
  const [years, setYears] = useState([]);
  const [payrollForm, setPayrollForm] = useState({});
  const [contractForm, setContractForm] = useState({
    academic_year_id: '', contract_type: 'permanent', salary_amount: '', start_date: '', end_date: '', notes: '',
  });
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'annual', from_date: '', to_date: '', reason: '',
  });
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    catalogApi.getYears().then((r) => {
      const list = r.data?.data ?? [];
      setYears(Array.isArray(list) ? list : []);
      if (list[0]?.id && !contractForm.academic_year_id) {
        setContractForm((f) => ({ ...f, academic_year_id: list[0].id }));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!profile) return;
    setPayrollForm({
      staff_id_number: profile.staff_id_number || '',
      hire_date: profile.hire_date?.slice?.(0, 10) || profile.staff_profile?.hire_date?.slice?.(0, 10) || '',
      department: profile.department || '',
      employment_type: profile.employment_type === 'full_time' ? 'permanent' : (profile.employment_type || 'permanent'),
      bank_name: profile.bank_name || '',
      bank_account_number: profile.bank_account_number || '',
      bank_branch: profile.bank_branch || '',
      payment_method: profile.payment_method || 'bank_transfer',
      tax_identification_number: profile.tax_identification_number || '',
      pension_number: profile.pension_number || '',
      date_of_birth: profile.date_of_birth?.slice?.(0, 10) || '',
      gender: profile.gender || '',
      nationality: profile.nationality || 'Ethiopian',
      emergency_contact_name: profile.emergency_contact_name || '',
      emergency_contact_phone: profile.emergency_contact_phone || '',
      home_address: profile.home_address || profile.address || '',
      city: profile.city || '',
      region: profile.region || '',
    });
  }, [profile]);

  const latestContract = profile?.contracts?.[0];
  const monthlySalary = latestContract?.salary_amount ?? profile?.contract_salary;

  const savePayroll = async (e) => {
    e.preventDefault();
    setSaving('payroll');
    setError('');
    try {
      await teachersApi.update(teacherId, payrollForm);
      await onRefresh?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save HR details');
    } finally {
      setSaving('');
    }
  };

  const addContract = async (e) => {
    e.preventDefault();
    setSaving('contract');
    setError('');
    try {
      await teachersApi.addContract(teacherId, {
        ...contractForm,
        salary_amount: contractForm.salary_amount ? Number(contractForm.salary_amount) : null,
        currency: 'ETB',
      });
      setContractForm((f) => ({ ...f, salary_amount: '', notes: '' }));
      await onRefresh?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add contract');
    } finally {
      setSaving('');
    }
  };

  const addLeave = async (e) => {
    e.preventDefault();
    setSaving('leave');
    setError('');
    try {
      await teachersApi.addLeave(teacherId, leaveForm);
      setLeaveForm({ leave_type: 'annual', from_date: '', to_date: '', reason: '' });
      await onRefresh?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add leave');
    } finally {
      setSaving('');
    }
  };

  const setLeaveStatus = async (leaveId, status) => {
    setSaving(`leave-${leaveId}`);
    try {
      await teachersApi.updateLeave(teacherId, leaveId, { status });
      await onRefresh?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave');
    } finally {
      setSaving('');
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-8">
      {!profile.staff_profile_id && !profile.staff_id_number && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
          <p className="font-bold">HR profile not set up yet</p>
          <p className="mt-1">Save employment & payroll details below to link this teacher for contracts and payroll.</p>
        </div>
      )}

      {monthlySalary != null && Number(monthlySalary) > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
          <Banknote className="text-emerald-600" size={22} />
          <div>
            <p className="text-xs font-bold uppercase text-emerald-700">Current contract salary (payroll)</p>
            <p className="text-xl font-black text-emerald-900">{ETB.format(Number(monthlySalary))}</p>
            {latestContract?.academic_year_name && (
              <p className="text-xs text-emerald-700">{latestContract.academic_year_name} · {latestContract.contract_type}</p>
            )}
          </div>
        </div>
      )}

      {/* Payroll & bank */}
      <section className="border border-slate-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b flex items-center gap-2">
          <Banknote size={18} className="text-emerald-600" />
          <h3 className="font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">Payroll & banking</h3>
        </div>
        <form onSubmit={savePayroll} className="p-5 space-y-4">
          <p className="text-sm text-slate-500">Used when generating payslips and bank disbursements.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Staff ID" value={payrollForm.staff_id_number} onChange={(e) => setPayrollForm((f) => ({ ...f, staff_id_number: e.target.value }))} required />
            <Input label="Hire date" type="date" value={payrollForm.hire_date} onChange={(e) => setPayrollForm((f) => ({ ...f, hire_date: e.target.value }))} />
            <Input label="Department" value={payrollForm.department} onChange={(e) => setPayrollForm((f) => ({ ...f, department: e.target.value }))} />
            <Select label="Payment method" value={payrollForm.payment_method} onChange={(e) => setPayrollForm((f) => ({ ...f, payment_method: e.target.value }))} options={PAYMENT_METHODS} />
            <Input label="Bank name" value={payrollForm.bank_name} onChange={(e) => setPayrollForm((f) => ({ ...f, bank_name: e.target.value }))} />
            <Input label="Account number" value={payrollForm.bank_account_number} onChange={(e) => setPayrollForm((f) => ({ ...f, bank_account_number: e.target.value }))} />
            <Input label="Branch" value={payrollForm.bank_branch} onChange={(e) => setPayrollForm((f) => ({ ...f, bank_branch: e.target.value }))} />
            <Input label="Tax ID (TIN)" value={payrollForm.tax_identification_number} onChange={(e) => setPayrollForm((f) => ({ ...f, tax_identification_number: e.target.value }))} />
            <Input label="Pension number" value={payrollForm.pension_number} onChange={(e) => setPayrollForm((f) => ({ ...f, pension_number: e.target.value }))} />
          </div>
          <Button type="submit" loading={saving === 'payroll'}><Save size={16} className="inline mr-1" /> Save payroll details</Button>
        </form>
      </section>

      {/* Employment */}
      <section className="border border-slate-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b flex items-center gap-2">
          <UserCircle size={18} className="text-slate-600 dark:text-slate-400" />
          <h3 className="font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">Personal & emergency</h3>
        </div>
        <form onSubmit={savePayroll} className="p-5 space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Date of birth" type="date" value={payrollForm.date_of_birth} onChange={(e) => setPayrollForm((f) => ({ ...f, date_of_birth: e.target.value }))} />
            <Input label="Gender" value={payrollForm.gender} onChange={(e) => setPayrollForm((f) => ({ ...f, gender: e.target.value }))} />
            <Input label="Nationality" value={payrollForm.nationality} onChange={(e) => setPayrollForm((f) => ({ ...f, nationality: e.target.value }))} />
            <Input label="Emergency contact" value={payrollForm.emergency_contact_name} onChange={(e) => setPayrollForm((f) => ({ ...f, emergency_contact_name: e.target.value }))} />
            <Input label="Emergency phone" value={payrollForm.emergency_contact_phone} onChange={(e) => setPayrollForm((f) => ({ ...f, emergency_contact_phone: e.target.value }))} />
            <Input label="City" value={payrollForm.city} onChange={(e) => setPayrollForm((f) => ({ ...f, city: e.target.value }))} />
            <Input label="Region" value={payrollForm.region} onChange={(e) => setPayrollForm((f) => ({ ...f, region: e.target.value }))} />
            <Input label="Home address" className="md:col-span-2" value={payrollForm.home_address} onChange={(e) => setPayrollForm((f) => ({ ...f, home_address: e.target.value }))} />
          </div>
          <Button type="submit" variant="secondary" loading={saving === 'payroll'}>Save personal details</Button>
        </form>
      </section>

      {/* Contracts */}
      <section className="border border-slate-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b flex items-center gap-2">
          <Briefcase size={18} className="text-violet-600" />
          <h3 className="font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">Salary contracts</h3>
        </div>
        <div className="p-5 space-y-4">
          <ul className="space-y-2">
            {profile.contracts?.length ? profile.contracts.map((c) => (
              <li key={c.id} className="p-4 border rounded-xl flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-bold">{c.academic_year_name || 'Year'} · {c.contract_type}</p>
                  <p className="text-sm text-slate-500">
                    {c.start_date && new Date(c.start_date).toLocaleDateString()}
                    {c.end_date && ` → ${new Date(c.end_date).toLocaleDateString()}`}
                  </p>
                  {c.notes && <p className="text-xs text-slate-400 mt-1">{c.notes}</p>}
                </div>
                <p className="text-lg font-black text-violet-700">
                  {c.salary_amount != null ? ETB.format(Number(c.salary_amount)) : '—'}
                </p>
              </li>
            )) : (
              <p className="text-slate-400 text-sm">No contracts — add one below so payroll can use the salary amount.</p>
            )}
          </ul>

          <form onSubmit={addContract} className="p-4 bg-violet-50/50 rounded-xl space-y-3">
            <p className="text-sm font-bold text-violet-900">Add contract</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Select
                label="Academic year"
                value={contractForm.academic_year_id}
                onChange={(e) => setContractForm((f) => ({ ...f, academic_year_id: e.target.value }))}
                options={years.map((y) => ({ value: y.id, label: y.name }))}
                required
              />
              <Select label="Contract type" value={contractForm.contract_type} onChange={(e) => setContractForm((f) => ({ ...f, contract_type: e.target.value }))} options={CONTRACT_TYPES} />
              <Input label="Monthly salary (ETB)" type="number" min="0" step="0.01" value={contractForm.salary_amount} onChange={(e) => setContractForm((f) => ({ ...f, salary_amount: e.target.value }))} required />
              <Input label="Start date" type="date" value={contractForm.start_date} onChange={(e) => setContractForm((f) => ({ ...f, start_date: e.target.value }))} required />
              <Input label="End date" type="date" value={contractForm.end_date} onChange={(e) => setContractForm((f) => ({ ...f, end_date: e.target.value }))} />
              <Input label="Notes" value={contractForm.notes} onChange={(e) => setContractForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <Button type="submit" loading={saving === 'contract'}>Add contract</Button>
          </form>
        </div>
      </section>

      {/* Leave */}
      <section className="border border-slate-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b flex items-center gap-2">
          <Calendar size={18} className="text-amber-600" />
          <h3 className="font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">Leave records</h3>
        </div>
        <div className="p-5 space-y-4">
          <ul className="space-y-2">
            {profile.leave_records?.length ? profile.leave_records.map((l) => (
              <li key={l.id} className="p-4 border rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold capitalize">{l.leave_type} leave</p>
                  <p className="text-sm text-slate-500">
                    {new Date(l.from_date).toLocaleDateString()} – {new Date(l.to_date).toLocaleDateString()}
                    {l.days_count ? ` · ${l.days_count} days` : ''}
                  </p>
                  {l.reason && <p className="text-xs text-slate-400">{l.reason}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={l.status === 'approved' ? 'green' : l.status === 'pending' ? 'amber' : 'rose'}>{l.status}</Badge>
                  {l.status === 'pending' && (
                    <>
                      <button type="button" className="text-xs font-bold text-emerald-700" disabled={!!saving} onClick={() => setLeaveStatus(l.id, 'approved')}>Approve</button>
                      <button type="button" className="text-xs font-bold text-rose-700" disabled={!!saving} onClick={() => setLeaveStatus(l.id, 'rejected')}>Reject</button>
                    </>
                  )}
                </div>
              </li>
            )) : <p className="text-slate-400 text-sm">No leave on file.</p>}
          </ul>

          <form onSubmit={addLeave} className="p-4 bg-amber-50/50 rounded-xl space-y-3">
            <p className="text-sm font-bold text-amber-900">Record leave</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select label="Type" value={leaveForm.leave_type} onChange={(e) => setLeaveForm((f) => ({ ...f, leave_type: e.target.value }))} options={LEAVE_TYPES} />
              <Input label="From" type="date" value={leaveForm.from_date} onChange={(e) => setLeaveForm((f) => ({ ...f, from_date: e.target.value }))} required />
              <Input label="To" type="date" value={leaveForm.to_date} onChange={(e) => setLeaveForm((f) => ({ ...f, to_date: e.target.value }))} required />
              <Input label="Reason" value={leaveForm.reason} onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))} />
            </div>
            <Button type="submit" loading={saving === 'leave'}>Add leave</Button>
          </form>
        </div>
      </section>

      {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}

      <p className="text-xs text-slate-400">
        Tip: After saving salary contract, open{' '}
        <Link to="/school-admin/finance" className="text-emerald-600 font-bold">School admin → Finance → Payroll</Link>
        {' '}to run payslips for this teacher.
      </p>
    </div>
  );
}
