import { useState, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_CLASSES_FULL_DATA, SEARCH_STUDENTS, GET_CURRICULUM_DATA } from '../api/classGql';
import AdminLayout from '../components/layouts/AdminLayout';
import CreateClassModal from '../components/modals/CreateClassModal';
import AssignTeacherModal from '../components/modals/AssignTeacherModal';
import CreateSubjectModal from '../components/modals/CreateSubjectModal';
import { 
  Plus, LayoutGrid, List, Loader2, Bookmark, ArrowRight, UserPlus, X, 
  School, Target, ChevronDown, Maximize2, Minimize2, UserCheck, AlertCircle, BookOpen
} from 'lucide-react';


const ENROLL_STUDENT_WITH_CHECK = gql`
  mutation EnrollStudent($data: EnrollStudentInput!) {
    EnrollStudentWithCheck(object: $data) {
      success
      message
      enrollment_id
    }
  }
`;

// --- CURRICULUM VIEW COMPONENT ---
const CurriculumView = () => {
  const { data, loading } = useQuery(GET_CURRICULUM_DATA, { fetchPolicy: 'network-only' });

  if (loading) return (
    <div className="py-40 flex flex-col items-center justify-center text-slate-300">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="font-black uppercase tracking-[0.3em] text-[10px]">Analyzing Curriculum</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {data?.academic_subjects.map((subject) => {
        const grades = [...new Set(subject.teacherassignments.map(a => a.section?.grade?.name))].filter(Boolean);
        
        // Extract unique teachers for this subject
        const uniqueTeachers = Array.from(new Map(subject.teacherassignments.map(a => [a.user?.email, a.user])).values());

        return (
          <div key={subject.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-indigo-600 transition-colors">
                <BookOpen size={24} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Deployments</p>
                <p className="text-2xl font-black text-slate-900">{subject.teacherassignments_aggregate.aggregate.count}</p>
              </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-4">{subject.name}</h3>
            
            <div className="space-y-6 flex-1">
              {/* Grade Badges */}
              <div className="flex flex-wrap gap-2">
                {grades.length > 0 ? grades.map(g => (
                  <span key={g} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase border border-indigo-100">
                    Grade {g}
                  </span>
                )) : <span className="text-[10px] font-bold text-slate-300 uppercase italic tracking-tighter">No active assignments</span>}
              </div>

              {/* Assigned Teachers List */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2">Assigned Faculty</h4>
                {uniqueTeachers.length > 0 ? (
                  <div className="grid gap-2">
                    {uniqueTeachers.map((teacher, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group/teacher">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase group-hover/teacher:bg-indigo-100 group-hover/teacher:text-indigo-600">
                          {teacher?.first_name?.charAt(0)}{teacher?.last_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{teacher?.first_name} {teacher?.last_name}</p>
                          <p className="text-[9px] font-medium text-slate-400 truncate max-w-[150px]">{teacher?.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] font-bold text-rose-400 uppercase italic">No Teachers Assigned</p>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-50 flex justify-between items-center">
              <button className="text-[10px] font-black uppercase text-indigo-600 hover:tracking-widest transition-all flex items-center gap-2">
                Manage Subject <ArrowRight size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- ENROLLMENT SUB-COMPONENT ---
const EnrollStudentSection = ({ sectionId, academicYearId, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const { data: searchData, loading: searching } = useQuery(SEARCH_STUDENTS, {
    variables: { query: `%${searchQuery}%` },
    skip: !!selectedStudent || searchQuery.length < 2 
  });

  const [enroll, { loading: enrolling }] = useMutation(ENROLL_STUDENT_WITH_CHECK, {
    onCompleted: (data) => {
      const result = data?.EnrollStudentWithCheck; 
      if (result?.success) {
        setStatus({ type: 'success', msg: result.message });
        setSearchQuery('');
        setSelectedStudent(null);
        setTimeout(() => { onRefresh(); setStatus({ type: '', msg: '' }); }, 2000);
      }
    },
    onError: (error) => setStatus({ type: 'error', msg: error.message })
  });

  const handleEnroll = () => {
    if (!selectedStudent || !academicYearId) {
      setStatus({ type: 'error', msg: !academicYearId ? 'Error: Year missing.' : 'Select a student.' });
      return;
    }
    enroll({ variables: { data: { student_id: selectedStudent.id, section_id: sectionId, academic_year_id: academicYearId } } });
  };

  const studentsFound = searchData?.student_students || [];

  return (
    <div className="p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 space-y-4 relative">
      <div className="flex items-center gap-2">
        <UserCheck size={16} className="text-indigo-600" />
        <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Rapid Enrollment</h4>
      </div>
      <div className="space-y-2 relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search Name or Admission #..." 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              value={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSelectedStudent(null); }}
            />
            {selectedStudent && (
              <button onClick={() => { setSelectedStudent(null); setSearchQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>
            )}
          </div>
          <button onClick={handleEnroll} disabled={enrolling || !selectedStudent} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-lg">
            {enrolling ? '...' : 'Enroll'}
          </button>
        </div>
        {!selectedStudent && searchQuery.length >= 2 && (
          <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-xl mt-1 overflow-hidden">
            {searching ? <div className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Searching...</div> : 
              studentsFound.length > 0 ? studentsFound.map((s) => (
                <button key={s.id} onClick={() => { setSelectedStudent(s); setSearchQuery(''); }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 transition-colors text-left border-b border-slate-50 last:border-0">
                  <div><p className="text-sm font-bold text-slate-900">{s.first_name} {s.last_name}</p><p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">{s.school_id}</p></div>
                  <Plus size={14} className="text-slate-300" />
                </button>
              )) : <div className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Results</div>
            }
          </div>
        )}
      </div>
      {status.msg && <div className={`flex items-center gap-2 p-3 rounded-xl text-[10px] font-bold uppercase ${status.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}><AlertCircle size={14} />{status.msg}</div>}
    </div>
  );
};

// --- DRAWER COMPONENT ---
const ClassDetailsDrawer = ({ isOpen, onClose, selectedClass, onAssignTeacher, onRefresh }) => {
  if (!isOpen || !selectedClass) return null;
  const students = selectedClass.section?.studentenrollments || [];
  const assignments = selectedClass.section?.teacherassignments || [];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div><p className="text-indigo-600 font-black text-[10px] tracking-widest uppercase mb-1">Unit Management</p><h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedClass.name}</h2></div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><X size={20} /></button>
          </div>
          <EnrollStudentSection sectionId={selectedClass.section?.id} academicYearId={selectedClass.academicyear?.id} onRefresh={onRefresh} />
          <section className="space-y-4">
            <div className="flex justify-between items-center"><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Faculty</h3><button onClick={onAssignTeacher} className="flex items-center gap-1.5 text-[10px] font-black uppercase text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"><UserPlus size={12} /> Assign</button></div>
            <div className="space-y-2">
              {assignments.map((assign, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm font-bold text-xs uppercase">{assign.user?.first_name?.charAt(0)}</div>
                  <div><p className="font-bold text-slate-900 text-sm">{assign.user?.first_name} {assign.user?.last_name}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{assign.subject?.name}</p></div>
                </div>
              ))}
            </div>
          </section>
          <section className="space-y-4">
             <div className="flex justify-between items-center"><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Roster</h3><span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-full">{students.length}</span></div>
             <div className="grid gap-2">
                {students.map(env => (
                <div key={env.id} className="flex items-center gap-3 p-4 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 uppercase">{env.student?.first_name?.charAt(0)}</div>
                    <div><p className="text-sm font-bold text-slate-800">{env.student?.first_name} {env.student?.last_name}</p><p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{env.student?.school_id}</p></div>
                </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const Classes = () => {
  const [activeTab, setActiveTab] = useState('units'); // 'units' or 'curriculum'
  const [viewType, setViewType] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [collapsedGrades, setCollapsedGrades] = useState({});

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

  const toggleGrade = (gradeName) => setCollapsedGrades(prev => ({ ...prev, [gradeName]: !prev[gradeName] }));

  const toggleAll = (shouldCollapse) => {
    if (!shouldCollapse) { setCollapsedGrades({}); } 
    else {
      const collapsedMap = {};
      Object.keys(groupedClasses).forEach(key => { collapsedMap[key] = true; });
      setCollapsedGrades(collapsedMap);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-10 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
        
        {/* HEADER & TABS */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">Academic Units</h1>
              <p className="text-slate-500 font-medium text-lg">Manage grade hierarchies and enrollment cycles.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
              {activeTab === 'units' ? (
                <>
                  <div className="flex gap-1 border-r border-slate-100 pr-4">
                    <button onClick={() => toggleAll(false)} className="p-2.5 text-slate-400 hover:text-indigo-600 rounded-xl transition-all" title="Extend All"><Maximize2 size={18} /></button>
                    <button onClick={() => toggleAll(true)} className="p-2.5 text-slate-400 hover:text-indigo-600 rounded-xl transition-all" title="Shrink All"><Minimize2 size={18} /></button>
                  </div>
                  <div className="flex bg-slate-50 p-1 rounded-xl">
                    <button onClick={() => setViewType('grid')} className={`p-2.5 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}><LayoutGrid size={20} /></button>
                    <button onClick={() => setViewType('list')} className={`p-2.5 rounded-lg transition-all ${viewType === 'list' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}><List size={20} /></button>
                  </div>
                  <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"><Plus size={18} /> Initialize Class</button>
                </>
              ) : (
                <button onClick={() => setIsSubjectModalOpen(true)} className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl"><Plus size={18} /> Create Subject</button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-8 border-b border-slate-100">
            <button 
              onClick={() => setActiveTab('units')}
              className={`pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'units' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Academic Units
              {activeTab === 'units' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('curriculum')}
              className={`pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'curriculum' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Curriculum
              {activeTab === 'curriculum' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />}
            </button>
          </div>
        </div>

        {activeTab === 'units' ? (
          loading ? (
            <div className="py-40 flex flex-col items-center justify-center text-slate-300">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-black uppercase tracking-[0.3em] text-[10px]">Updating Workspace</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              {Object.entries(groupedClasses).map(([gradeName, sections]) => {
                const isCollapsed = collapsedGrades[gradeName];
                return (
                  <div key={gradeName} className={`transition-all duration-500 rounded-[2.5rem] ${isCollapsed ? 'bg-slate-50/50' : 'bg-white border border-slate-100 shadow-sm'}`}>
                    <div onClick={() => toggleGrade(gradeName)} className="flex items-center gap-6 p-6 cursor-pointer select-none">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isCollapsed ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 text-white shadow-xl shadow-slate-200'}`}><Bookmark size={20} /></div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Grade {gradeName}</h2>
                      </div>
                      <div className="flex items-center gap-2 bg-white/80 px-4 py-1.5 rounded-full border border-slate-100 shadow-sm"><Target size={14} className="text-indigo-50" /><span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{sections.length} Active Sections</span></div>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent opacity-40" />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'bg-slate-200 text-slate-500' : 'bg-indigo-50 text-indigo-600 rotate-180'}`}><ChevronDown size={22} /></div>
                    </div>
                    {!isCollapsed && (
                      <div className="p-6 pt-0 animate-in fade-in duration-500">
                        {viewType === 'grid' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {sections.map((cls) => (
                              <div key={cls.id} onClick={(e) => { e.stopPropagation(); setSelectedClass(cls); setIsDrawerOpen(true); }} className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 hover:bg-white hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group/card cursor-pointer">
                                  <div className="flex justify-between items-start mb-6">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover/card:bg-indigo-600 group-hover/card:text-white transition-all duration-500"><School size={18} /></div>
                                    <div className="p-2 bg-white rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity"><ArrowRight size={14} className="text-indigo-600" /></div>
                                  </div>
                                  <h3 className="text-lg font-black text-slate-900 mb-4">{cls.name}</h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Roster Status</span><span className="text-slate-900 font-black">{cls.section?.studentenrollments_aggregate?.aggregate?.count || 0}/{cls.capacity}</span></div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${Math.min(((cls.section?.studentenrollments_aggregate?.aggregate?.count || 0) / cls.capacity) * 100, 100)}%` }} /></div>
                                  </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
                            <table className="w-full text-left">
                              <tbody className="divide-y divide-slate-100">
                                {sections.map((cls) => (
                                  <tr key={cls.id} onClick={(e) => { e.stopPropagation(); setSelectedClass(cls); setIsDrawerOpen(true); }} className="hover:bg-white transition-all cursor-pointer group">
                                    <td className="px-8 py-5"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm uppercase">{cls.name.split('-').pop()?.trim().charAt(0)}</div><span className="font-bold text-slate-900">{cls.name}</span></div></td>
                                    <td className="px-8 py-5 text-right"><div className="inline-flex p-2 rounded-lg bg-white text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"><ArrowRight size={16} /></div></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <CurriculumView onRefresh={refetch} />
        )}
      </div>

      <CreateClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={refetch} />
      <AssignTeacherModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} sectionId={selectedClass?.section?.id} onRefresh={refetch} />
      <CreateSubjectModal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} onRefresh={refetch} />
      <ClassDetailsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        selectedClass={selectedClass} 
        onAssignTeacher={() => setIsAssignModalOpen(true)} 
        onRefresh={refetch}
      />
    </AdminLayout>
  );
};

export default Classes;