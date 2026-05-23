import { ui } from '../../theme/tokens';

/** Standard wrapper for list pages: search, filters, table (dark-mode safe). */
export default function ListFilterCard({ children, className = '' }) {
  return (
    <section className={`${ui.card} rounded-3xl p-5 space-y-4 ${className}`}>
      {children}
    </section>
  );
}
