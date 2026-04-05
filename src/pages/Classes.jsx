import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_CLASSES_FULL_DATA } from '../api/classGql';
import AdminLayout from '../components/layouts/AdminLayout';
import CreateClassModal from '../components/modals/CreateClassModal';
import { 
  School, Users, Plus, Calendar, 
  Settings2, Loader2, Info, Layers, Bookmark 
} from 'lucide-react';

const Classes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, loading, refetch, error } = useQuery(GET_CLASSES_FULL_DATA, {
    fetchPolicy: 'network-only',
  });

  const classes = data?.academic_classes || [];

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Classrooms</h1>
            <p className="text-slate-500 font-medium mt-1">
              Organize sections by grade and academic year.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Plus size={20} /> Initialize Class
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="font-black uppercase tracking-widest text-xs">Loading academic structure...</p>
            </div>
          ) : (
            classes.map((cls) => {
              const currentEnrolled = cls.section?.studentenrollments_aggregate?.aggregate?.count || 0;
              const capacity = cls.capacity || 0;
              const fillPercentage = (currentEnrolled / capacity) * 100;
              
              // Accessing the new Grade data
              const gradeName = cls.section?.grade?.name || `Level ${cls.grade_level}`;

              return (
                <div key={cls.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col md:flex-row gap-8">
                  
                  {/* Left Side: Identity */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                        <School size={28} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          cls.academicyear?.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {cls.academicyear?.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                        <Bookmark size={12} /> {gradeName}
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 leading-tight">
                        {cls.name || `Section ${cls.section?.name}`}
                      </h3>
                      <p className="text-slate-400 text-sm font-medium mt-1 flex items-center gap-2">
                        <Calendar size={14} className="text-slate-300" /> {cls.academicyear?.name}
                      </p>
                    </div>

                    {/* Term Badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {cls.academicyear?.terms?.map(term => (
                        <span key={term.id} className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-tighter border border-slate-100">
                          {term.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Side: Occupancy */}
                  <div className="flex-1 bg-slate-50/50 rounded-3xl p-6 flex flex-col justify-between border border-slate-100">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Enrollment</span>
                        <span className="text-sm font-black text-slate-900">
                          {currentEnrolled} <span className="text-slate-300 font-medium">/ {capacity}</span>
                        </span>
                      </div>

                      <div className="h-4 w-full bg-white rounded-full overflow-hidden border border-slate-100 p-0.5">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${
                            fillPercentage >= 100 ? 'bg-rose-500' : fillPercentage > 85 ? 'bg-amber-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-6">
                      <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs hover:shadow-md transition-all">
                        Class List
                      </button>
                      <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-100 transition-all">
                        <Settings2 size={18} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      <CreateClassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={refetch}
        metaData={{
          sections: data?.academic_sections,
          years: data?.academic_academicyears
        }}
      />
    </AdminLayout>
  );
};

export default Classes;