import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client/core';
import { useMutation } from '@apollo/client/react';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    LoginAction(object: {email: $email, password: $password}) {
      token
      roles
      id
    }
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const [loginUser, { loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { token, roles, id } = data.LoginAction;
      const primaryRole = roles[0]; 

      // 1. Success Animation Trigger
      setIsSuccess(true);

      // 2. Short delay to allow user to see success state before redirect
      setTimeout(() => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', primaryRole);
        localStorage.setItem('userId', id);
        
        if (primaryRole === 'SUPER_ADMIN') {
          navigate('/super-admin/dashboard');
        } else {
          navigate('/school-admin/dashboard');
        }
      }, 800);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser({ variables: { email, password } });
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] selection:bg-indigo-100">
      {/* LEFT PANEL: Brand Experience */}
      <div className="relative hidden lg:flex lg:w-[45%] bg-[#0F172A] overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 blur-[100px]" />
        </div>

        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">EduManage <span className="text-indigo-400 font-medium">OS</span></span>
          </div>

          <div className="max-w-lg">
            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              Precision tools for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Educational Excellence.</span>
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed">
              Managing student records, staff payroll, and academic performance has never been this seamless.
            </p>
          </div>

          <div className="flex items-center gap-6 text-slate-500 text-sm">
            <span>© 2026 Global Education Systems</span>
            <div className="w-1 h-1 bg-slate-700 rounded-full" />
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24">
        <div className="w-full max-w-[440px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-12">
            <span className="text-3xl font-bold text-slate-900">EduManage <span className="text-indigo-600">OS</span></span>
          </div>

          <div className="space-y-1">
            <h3 className="text-4xl font-bold text-slate-900">Sign In</h3>
            <p className="text-slate-500 text-lg">Access your administrative terminal</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <svg className="w-5 h-5 text-rose-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                </svg>
                <div className="text-sm font-medium text-rose-800">{error.message}</div>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Work Email</label>
                <input 
                  type="email" 
                  placeholder="admin@institution.edu"
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-tighter">Forgot Password?</a>
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading || isSuccess}
              className={`w-full relative py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl overflow-hidden
                ${isSuccess 
                  ? 'bg-emerald-500 text-white shadow-emerald-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.98]'
                }
                disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSuccess ? 'Redirecting...' : loading ? 'Authenticating...' : 'Secure Login'}
              </div>
            </button>
          </form>

          <p className="mt-12 text-center text-slate-500 font-medium">
            Authorized Personnel Only. <br />
            <span className="text-slate-400 text-sm">Security logs are active for this session.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;