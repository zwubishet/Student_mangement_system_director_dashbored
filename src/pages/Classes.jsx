import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_CLASSES_FULL_DATA } from '../api/classGql';
import AdminLayout from '../components/layouts/AdminLayout';
import CreateClassModal from '../components/modals/CreateClassModal';
import AssignTeacherModal from '../components/modals/AssignTeacherModal';
import { 
  Plus, LayoutGrid, List, Loader2, Bookmark, ArrowRight, UserPlus, X, ChevronRight, Users, School
} from 'lucide-react';

// --- DRAWER SUB-COMPONENT (Kept for management) ---
const ClassDetailsDrawer = ({ isOpen, onClose, selectedClass, onAssignTeacher }) => {
  if (!isOpen || !selectedClass) return null;
  const students = selectedClass.section?.studentenrollments || [];
  const assignments = selectedClass.section?.teacherassignments || [];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
        <div className="p-6 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Manage Section</h2>
              <p className="text-indigo-600 font-bold text-xs tracking-widest uppercase">{selectedClass.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><X size={20} /></button>
          </div>

          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Faculty</h3>
              <button onClick={onAssignTeacher} className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-600 hover:text-white transition-all"><UserPlus size={12} /> Assign</button>
            </div>
            <div className="grid gap-2">
              {assignments.map((assign, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-bold text-slate-900 text-sm">{assign.user?.first_name} {assign.user?.last_name}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{assign.subject?.name}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Roster ({students.length})</h3>
             <div className="grid gap-2">
                {students.map(env => (
                <div key={env.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400">{env.student?.first_name?.charAt(0)}</div>
                    <p className="text-xs font-bold text-slate-800">{env.student?.first_name} {env.student?.last_name}</p>
                </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const Classes = () => {
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const { data, loading, refetch } = useQuery(GET_CLASSES_FULL_DATA, { fetchPolicy: 'network-only' });

  const groupedClasses = useMemo(() => {
    if (!data?.academic_classes) return {};
    return data.academic_classes.reduce((acc, cls) => {
      const gradeName = cls.section?.grade?.name || "Other";
      if (!acc[gradeName]) acc[gradeName] = [];
      acc[gradeName].push(cls);
      return acc;
    }, {});
  }, [data]);

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 max-w-[1600px] mx-auto">
        
        {/* CONDENSED HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Classrooms</h1>
            <p className="text-slate-500 text-sm font-medium">Grouped by Grade Level</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setViewType('grid')}
                className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewType('list')}
                className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18} />
              </button>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 active:scale-95 transition-all shadow-lg"
            >
              <Plus size={16} /> Smart Setup
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-300">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="font-black uppercase tracking-widest text-[9px]">Syncing...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedClasses).map(([gradeName, sections]) => (
              <div key={gradeName} className="space-y-3">
                {/* SECTION DIVIDER / TITLE */}
                <div className="flex items-center gap-3 px-2">
                  <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                    <Bookmark size={14} />
                  </div>
                  <h2 className="text-lg font-black text-slate-800">{gradeName}</h2>
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    {sections.length} Sections
                  </span>
                </div>

                {viewType === 'grid' ? (
                  /* CONDENSED GRID */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {sections.map((cls) => (
                      <div 
                        key={cls.id} 
                        onClick={() => { setSelectedClass(cls); setIsDrawerOpen(true); }}
                        className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="min-w-[36px] h-9 bg-slate-50 rounded-lg flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            {cls.name.split('-').pop()?.trim().slice(0, 2)}
                          </div>
                          <div className="truncate">
                            <p className="font-black text-slate-900 text-sm truncate">{cls.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              {cls.section?.studentenrollments_aggregate?.aggregate?.count || 0} / {cls.capacity} Students
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* SLEEK LIST VIEW */
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-slate-50">
                        {sections.map((cls) => (
                          <tr 
                            key={cls.id} 
                            onClick={() => { setSelectedClass(cls); setIsDrawerOpen(true); }}
                            className="hover:bg-slate-50 transition-colors cursor-pointer group"
                          >
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                <School size={14} className="text-slate-300 group-hover:text-indigo-500" />
                                <span className="font-bold text-slate-900 text-sm">{cls.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-4">
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-500" 
                                    style={{ width: `${((cls.section?.studentenrollments_aggregate?.aggregate?.count || 0) / (cls.capacity || 1)) * 100}%` }} 
                                  />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase whitespace-nowrap">
                                  {cls.section?.studentenrollments_aggregate?.aggregate?.count || 0} / {cls.capacity} Enrolled
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                               <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                  <Users size={12} /> {cls.section?.teacherassignments?.length || 0} Faculty
                               </div>
                            </td>
                            <td className="px-6 py-3 text-right">
                               <ArrowRight size={14} className="ml-auto text-slate-200 group-hover:text-indigo-500" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={refetch} />
      <AssignTeacherModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} sectionId={selectedClass?.section?.id} onRefresh={refetch} />
      <ClassDetailsDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} selectedClass={selectedClass} onAssignTeacher={() => setIsAssignModalOpen(true)} />
    </AdminLayout>
  );
};

export default Classes;