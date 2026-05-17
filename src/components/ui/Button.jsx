const variants = {
  primary: 'bg-slate-900 text-white hover:bg-emerald-600 shadow-sm',
  secondary: 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600',
  danger: 'bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white',
  ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
};
const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-sm' };

export default function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center gap-2 font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}
