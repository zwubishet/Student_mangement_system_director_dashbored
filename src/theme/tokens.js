/**
 * Semantic surface classes — use everywhere instead of raw bg-white / text-slate-900
 * so dark/light mode stays consistent across the app.
 */
export const ui = {
  page: 'min-h-full text-slate-900 dark:text-slate-100',
  pageBg: 'bg-slate-50 dark:bg-slate-950',
  mainBg: 'bg-[#F8FAFC] dark:bg-slate-950',

  card: 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm',
  cardLg: 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm',
  cardHover: 'hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-md transition-all',
  /** Loading placeholder blocks */
  skeleton: 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl',
  /** Small KPI / stat tile */
  stat: 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4',
  /** Generic bordered surface (tables, lists) */
  surface: 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800',

  panel: 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5',
  panelTitle: 'font-black text-slate-900 dark:text-slate-100',

  muted: 'text-slate-500 dark:text-slate-400',
  mutedXs: 'text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500',
  heading: 'text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight',
  subheading: 'text-sm text-slate-500 dark:text-slate-400 mt-1',

  input:
    'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
  inputLabel: 'text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide',
  select: 'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100',
  fieldLabel: 'text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500',

  table: 'w-full text-sm',
  tableHead: 'bg-slate-50 dark:bg-slate-800/80 text-[10px] uppercase text-slate-400 dark:text-slate-500',
  tableRow: 'divide-y divide-slate-50 dark:divide-slate-800',
  tableRowHover: 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50',

  overlay: 'bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm',
  modal: 'bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800',
  modalHeader: 'border-b border-slate-100 dark:border-slate-800',
  modalTitle: 'text-lg font-black text-slate-900 dark:text-slate-100',

  sidebar: 'bg-slate-900 text-white',
  header: 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800',

  alertError: 'p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 rounded-2xl text-rose-600 dark:text-rose-300 text-sm',
  alertInfo: 'p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 rounded-2xl text-sky-900 dark:text-sky-100 text-sm',
  alertSuccess: 'p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl text-emerald-800 dark:text-emerald-200 text-sm',

  btnPrimary:
    'bg-slate-900 dark:bg-emerald-600 text-white hover:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm',
  btnSecondary:
    'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400',
  btnGhost: 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
  btnDanger:
    'bg-rose-500/10 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 hover:bg-rose-500 hover:text-white',
};

export default ui;
