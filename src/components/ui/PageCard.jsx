import { ui } from '../../theme/tokens';

export default function PageCard({ children, className = '', padding = true }) {
  return (
    <div className={`${ui.card} ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  );
}
