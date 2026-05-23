/** Shared white panel + toolbar pattern (matches school-admin list pages). */
export default function TeacherTableSection({ toolbar, children, className = '' }) {
  return (
    <section className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-4 ${className}`}>
      {toolbar}
      {children}
    </section>
  );
}
