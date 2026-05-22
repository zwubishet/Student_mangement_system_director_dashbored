import { Link } from 'react-router-dom';
import { ExternalLink, School } from 'lucide-react';
import { classesUrl } from '../../utils/academicNav';

/** Shows class instances tied to a catalog section */
export default function SectionClassLinks({ section, gradeId, academicYearId, compact = false }) {
  const allLinked = section?.linked_classes || [];
  const linked = academicYearId
    ? allLinked.filter((c) => c.academic_year_id === academicYearId)
    : allLinked;

  if (!linked.length && allLinked.length > 0 && academicYearId) {
    return (
      <p className={`text-amber-700 ${compact ? 'text-xs' : 'text-sm'}`}>
        Class exists for another year ({allLinked.map((c) => c.academic_year).join(', ')}).{' '}
        <Link
          to={classesUrl({ gradeId: gradeId || section?.grade_id, sectionId: section?.id, academicYearId: allLinked[0].academic_year_id })}
          className="font-bold hover:underline"
        >
          View in Classes
        </Link>
      </p>
    );
  }

  if (!linked.length) {
    return (
      <p className={`text-slate-400 ${compact ? 'text-xs' : 'text-sm'}`}>
        No class instance yet.{' '}
        <Link
          to={classesUrl({
            gradeId: gradeId || section?.grade_id,
            sectionId: section?.id,
            academicYearId,
            openCreate: true,
          })}
          className="text-emerald-600 font-bold hover:underline"
        >
          Create class
        </Link>
      </p>
    );
  }

  return (
    <ul className={`space-y-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
      {linked.map((c) => (
        <li key={c.id} className="flex items-center justify-between gap-2">
          <span className="text-slate-600 truncate">
            <School size={12} className="inline mr-1 text-slate-400" />
            {c.academic_year} · {c.enrolled_count ?? 0}/{c.capacity}
          </span>
          <Link
            to={`/school-admin/classes/${c.id}`}
            className="shrink-0 font-bold text-emerald-600 hover:underline inline-flex items-center gap-0.5"
          >
            Open <ExternalLink size={11} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
