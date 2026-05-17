export default function Select({ label, options = [], placeholder = 'Select...', className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>}
      <select
        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
