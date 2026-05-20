import { useEffect, useState } from 'react';
import { Search, UserPlus, Users } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { parentsApi } from '../../api/services';

/**
 * Reusable parent linking: pick existing parent or register new one.
 * onChange receives { mode, parent_id?, parent?, student_ids? }
 */
export default function ParentLinkSection({ studentIds = [], onChange, compact = false }) {
  const [mode, setMode] = useState('none');
  const [parentQ, setParentQ] = useState('');
  const [parentHits, setParentHits] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState('');
  const [newParent, setNewParent] = useState({
    first_name: '', last_name: '', phone: '', email: '', relationship: 'parent',
  });
  const [studentQ, setStudentQ] = useState('');
  const [studentHits, setStudentHits] = useState([]);
  const [pickedStudents, setPickedStudents] = useState(studentIds);

  useEffect(() => {
    if (!parentQ.trim() || mode !== 'existing') {
      setParentHits([]);
      return undefined;
    }
    const t = setTimeout(() => {
      parentsApi.search(parentQ).then((r) => setParentHits(r.data.data || [])).catch(() => setParentHits([]));
    }, 300);
    return () => clearTimeout(t);
  }, [parentQ, mode]);

  useEffect(() => {
    if (!studentQ.trim() || mode !== 'link_more') {
      setStudentHits([]);
      return undefined;
    }
    const t = setTimeout(() => {
      parentsApi.searchStudents(studentQ).then((r) => setStudentHits(r.data.data || [])).catch(() => setStudentHits([]));
    }, 300);
    return () => clearTimeout(t);
  }, [studentQ, mode]);

  useEffect(() => {
    onChange?.({
      mode,
      parent_id: mode === 'existing' ? selectedParentId : undefined,
      parent: mode === 'new' ? newParent : undefined,
      student_ids: pickedStudents,
    });
  }, [mode, selectedParentId, newParent, pickedStudents, onChange]);

  const np = (key) => ({
    value: newParent[key] || '',
    onChange: (e) => setNewParent((p) => ({ ...p, [key]: e.target.value })),
  });

  return (
    <div className={`space-y-4 ${compact ? '' : 'p-4 bg-slate-50 rounded-2xl border border-slate-100'}`}>
      <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
        <Users size={16} className="text-emerald-600" /> Parent account (optional)
      </p>
      <div className="flex flex-wrap gap-2">
        {[
          ['none', 'Skip'],
          ['existing', 'Link existing'],
          ['new', 'Create new parent'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              mode === id ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'existing' && (
        <div className="space-y-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm"
              placeholder="Search by name, phone, or email..."
              value={parentQ}
              onChange={(e) => setParentQ(e.target.value)}
            />
          </div>
          {parentHits.length > 0 && (
            <ul className="border border-slate-100 rounded-xl bg-white max-h-40 overflow-y-auto divide-y">
              {parentHits.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 ${
                      selectedParentId === p.id ? 'bg-emerald-50 font-bold' : ''
                    }`}
                    onClick={() => setSelectedParentId(p.id)}
                  >
                    {p.first_name} {p.last_name} · {p.phone || p.email || '—'}
                    <span className="text-xs text-slate-400 block">{p.linked_students} student(s) linked</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {parentQ && !parentHits.length && <p className="text-xs text-slate-400">No parents found. Create a new one instead.</p>}
        </div>
      )}

      {mode === 'new' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="First name" required {...np('first_name')} />
          <Input label="Last name" required {...np('last_name')} />
          <Input label="Phone" required {...np('phone')} />
          <Input label="Email" {...np('email')} />
          <Select
            label="Relationship"
            value={newParent.relationship}
            onChange={(e) => setNewParent((p) => ({ ...p, relationship: e.target.value }))}
            options={[
              { value: 'parent', label: 'Parent' },
              { value: 'mother', label: 'Mother' },
              { value: 'father', label: 'Father' },
              { value: 'guardian', label: 'Guardian' },
            ]}
          />
        </div>
      )}

      {mode !== 'none' && !studentIds.length && (
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <UserPlus size={12} /> Students selected above will be linked automatically after save.
        </p>
      )}
    </div>
  );
}
