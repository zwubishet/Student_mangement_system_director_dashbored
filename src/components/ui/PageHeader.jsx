import { ui } from '../../theme/tokens';

export default function PageHeader({ title, subtitle, kicker, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && <p className={`${ui.mutedXs} text-emerald-600 dark:text-emerald-400`}>{kicker}</p>}
        <h1 className={ui.heading}>{title}</h1>
        {subtitle && <p className={ui.subheading}>{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
