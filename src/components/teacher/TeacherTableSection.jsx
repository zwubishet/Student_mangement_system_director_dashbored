/** Shared white panel + toolbar pattern (matches school-admin list pages). */
export default function TeacherTableSection({ toolbar, children, className = '' }) {
  return (
    <section className={`bg-white border border-slate-100 rounded-3xl p-5 space-y-4 ${className}`}>
      {toolbar}
      {children}
    </section>
  );
}
