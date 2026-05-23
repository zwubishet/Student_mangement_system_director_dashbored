import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/services';
import { useI18n } from '../context/I18nContext';
import LanguageThemeBar from '../components/settings/LanguageThemeBar';
import BrandMark from '../components/brand/BrandMark';
import { ui } from '../theme/tokens';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useI18n();

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
      if (isNetwork) {
        setError({ message: t('errors.network') });
      } else {
        setError({ message: err.response?.data?.message || t('errors.invalidCredentials') });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex min-h-screen ${ui.pageBg} selection:bg-emerald-100 dark:selection:bg-emerald-900`}>
      <div className="relative hidden lg:flex lg:w-[45%] overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-700 via-amber-400 to-red-600" />
        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <BrandMark size="lg" variant="sidebar" />
          <div className="max-w-lg">
            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              {t('app.loginHeadline')} <br />
              <span className="text-amber-300">{t('app.loginHeadlineAccent')}</span>
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed">{t('app.tagline')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden flex justify-center mb-8">
            <BrandMark size="lg" showTagline={false} variant="light" />
          </div>
          <div className="flex justify-end mb-4"><LanguageThemeBar /></div>
          <div className="space-y-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
              <ShieldCheck size={14} /> {t('app.secureWorkspace')}
            </div>
            <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{t('app.signIn')}</h3>
            <p className={`text-lg ${ui.muted}`}>{t('app.signInSub')}</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {error && <div className={ui.alertError}>{error.message}</div>}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className={ui.inputLabel}>{t('auth.workEmail')}</label>
                <input
                  type="email"
                  value={email}
                  placeholder={t('auth.emailPlaceholder')}
                  className={`${ui.input} px-5 py-4 rounded-2xl shadow-sm`}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={ui.inputLabel}>{t('common.password')}</label>
                <input
                  type="password"
                  value={password}
                  className={`${ui.input} px-5 py-4 rounded-2xl shadow-sm`}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || isSuccess}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${ui.btnPrimary} disabled:opacity-70`}
            >
              {isSuccess ? t('auth.redirecting') : loading ? t('auth.authenticating') : t('auth.secureLogin')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
