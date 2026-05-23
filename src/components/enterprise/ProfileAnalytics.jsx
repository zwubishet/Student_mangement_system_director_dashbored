import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

export default function ProfileAnalytics({ analytics }) {
  if (!analytics) return <p className="text-slate-400 text-sm">No analytics data.</p>;

  const trend = analytics.attendance_trend?.map((r) => ({
    name: r.month ? new Date(r.month).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }) : '',
    rate: r.rate,
  })) || [];

  const grades = analytics.grade_trend?.slice(0, 12).map((r, i) => ({
    name: r.subject_name || r.exam_name || `#${i + 1}`,
    score: Number(r.score),
  })) || [];

  const subjects = analytics.subject_performance || [];

  return (
    <div className="space-y-8">
      {(analytics.risk_flags?.low_attendance || analytics.risk_flags?.no_recent_exams) && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-900">
          {analytics.risk_flags.low_attendance && <p>Attendance below 75% — review with homeroom teacher.</p>}
          {analytics.risk_flags.no_recent_exams && <p>No recent exam records — academic follow-up suggested.</p>}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase">Overall attendance</p>
          <p className="text-2xl font-black text-emerald-600">
            {analytics.attendance_rate != null ? `${analytics.attendance_rate}%` : '—'}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black text-slate-700 mb-3">Attendance trend (6 months)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#059669" strokeWidth={2} name="Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {grades.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-slate-700 mb-3">Recent exam scores</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grades}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {subjects.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-slate-700 mb-3">Subject performance</h3>
          <ul className="divide-y border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            {subjects.map((s) => (
              <li key={s.subject} className="flex justify-between px-4 py-3 text-sm bg-white dark:bg-slate-900">
                <span className="font-bold">{s.subject || 'General'}</span>
                <span className="text-emerald-600 font-black">{s.avg_score ?? '—'} avg ({s.attempts} exams)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
