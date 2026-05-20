/** Pick the school year to use for class instances (handles multiple is_current flags). */
export function pickCurrentYear(years) {
  if (!years?.length) return null;
  const currents = years.filter((y) => y.is_current && !y.is_deleted);
  const pool = currents.length ? currents : years.filter((y) => !y.is_deleted);
  if (!pool.length) return years[0];
  return [...pool].sort((a, b) => {
    const da = new Date(a.start_date || 0).getTime();
    const db = new Date(b.start_date || 0).getTime();
    return db - da;
  })[0];
}
