export default function PlatformPageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm font-medium mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
