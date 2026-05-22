import { BookOpenCheck, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/services';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsSuccess(false);
    try {
      const res = await authApi.login({ email, password });
      const loginData = res.data.data;
      login(loginData);
      const primaryRole = loginData.roles?.[0];
      setIsSuccess(true);
      setTimeout(() => {
        if (primaryRole === 'SUPER_ADMIN') navigate('/super-admin/dashboard');
        else if (primaryRole === 'SCHOOL_ADMIN') navigate('/school-admin/dashboard');
        else if (primaryRole === 'FINANCE') navigate('/finance/dashboard');
        else if (primaryRole === 'TEACHER') navigate('/teachers/dashboard');
        else if (primaryRole === 'PARENT') navigate('/parent/dashboard');
        else navigate('/login');
      }, 800);
    } catch (err) {
      const isNetwork = !err.response;
      const isCors = isNetwork && (err.message?.includes('Network Error') || err.code === 'ERR_NETWORK');
      if (isCors || isNetwork) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003';
        const isLocal = /localhost|127\.0\.0\.1/.test(apiUrl);
        setError({
          message: isCors
            ? (isLocal
              ? 'Request blocked (CORS). Ensure the API is running and CORS_ORIGIN includes your Vite dev URL (e.g. http://localhost:5173).'
              : 'CORS blocked: set CORS_ORIGIN on the API to your frontend URL, then redeploy.')
            : (isLocal
              ? `Cannot reach the API at ${apiUrl}. Start the backend: cd Student_mangement_system_backend && ./scripts/sms-dev.sh up (or docker compose up -d app), then retry.`
              : 'Cannot reach the API. Check VITE_API_URL and that the hosted API is running.'),
        });
      } else {
        setError({ message: err.response?.data?.message || 'Invalid email or password' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50 selection:bg-emerald-100">
      <div className="relative hidden lg:flex lg:w-[45%] overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute inset-x-0 top-0 h-1 bg-amber-500" />
        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-950/30">
              <BookOpenCheck className="text-white" size={22} />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">EduManage <span className="text-amber-400 font-medium">Core</span></span>
          </div>
          <div className="max-w-lg">
            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              Precision tools for <br />
              <span className="text-amber-300">Educational Excellence.</span>
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed">
              Multi-tenant school operations with enterprise-grade security and real-time academic workflows.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden flex justify-center mb-12">
            <span className="text-3xl font-bold text-slate-900">EduManage <span className="text-emerald-600">Core</span></span>
          </div>
          <div className="space-y-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-emerald-700">
              <ShieldCheck size={14} /> Secure workspace
            </div>
            <h3 className="text-4xl font-bold text-slate-900">Sign In</h3>
            <p className="text-slate-500 text-lg">Access your administrative terminal</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-sm font-medium text-rose-800">
                {error.message}
              </div>
            )}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Work Email</label>
                <input
                  type="email"
                  value={email}
                  placeholder="admin@institution.edu"
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  placeholder="••••••••••••"
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || isSuccess}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                isSuccess ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              } disabled:opacity-70`}
            >
              {isSuccess ? 'Redirecting...' : loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
