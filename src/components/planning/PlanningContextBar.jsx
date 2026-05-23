import Select from '../ui/Select';
import { ui } from '../../theme/tokens';

export default function PlanningContextBar({
  years = [],
  terms = [],
  yearId,
  termId,
  onYearChange,
  onTermChange,
  extra,
}) {
  return (
    <div className={`${ui.card} p-4 flex flex-wrap gap-4 items-end`}>
      <Select
        label="Academic year"
        value={yearId}
        onChange={(e) => onYearChange(e.target.value)}
        options={years.map((y) => ({
          value: y.id,
          label: `${y.name}${y.is_current ? ' (current)' : ''}`,
        }))}
      />
      {terms.length > 0 && (
        <Select
          label="Term / semester"
          value={termId}
          onChange={(e) => onTermChange(e.target.value)}
          options={terms.map((t) => ({
            value: t.id,
            label: t.semester_label || t.name || `Term ${t.term_number}`,
          }))}
        />
      )}
      {extra}
    </div>
  );
}
