import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {gql} from '@apollo/client'
import { useQuery } from '@apollo/client/react';
import AdminLayout from '../components/layouts/AdminLayout';
import { Trophy, ArrowRight, Calendar, Loader2, ClipboardList, Info } from 'lucide-react';

const GET_SECTION_EXAMS = gql`
  query GetSectionExams($sectionId: uuid!) {
    operations_examsubjects(where: {section_id: {_eq: $sectionId}}) {
      id
      max_score
      subject { name }
      exam {
        id
        name
        term { name }
      }
    }
  }
`;

const ExamSelection = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();

  const { data, loading } = useQuery(GET_SECTION_EXAMS, {
    variables: { sectionId }
  });

  if (loading) return <AdminLayout><div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="bg-slate-50 min-h-screen p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gradebook Columns</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Select an assessment to begin mark entry</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.operations_examsubjects.map((item) => (
              <div 
                key={item.id}
                onClick={() => navigate(`/teachers/mark-entry/${item.id}/${sectionId}`)}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group cursor-pointer relative overflow-hidden"
              >
                {/* Accent Background Icon */}
                <Trophy className="absolute -right-4 -bottom-4 text-slate-50 w-32 h-32 rotate-12 group-hover:text-indigo-50 transition-colors" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ClipboardList size={24} />
                    </div>
                    <span className="text-[10px] font-black px-3 py-1 bg-slate-900 text-white rounded-lg uppercase">
                      {item.exam.term.name}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 mb-1">{item.exam.name}</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase mb-6">{item.subject.name}</p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <Info size={14} className="text-indigo-400" />
                      <span className="text-sm font-black text-slate-600">Max Score: {item.max_score}</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                      Enter Marks <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data?.operations_examsubjects.length === 0 && (
            <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl flex flex-col items-center text-center space-y-4">
              <Calendar size={48} className="text-amber-200" />
              <div>
                <p className="text-amber-900 font-black uppercase tracking-widest text-sm">No Exams Scheduled</p>
                <p className="text-amber-700/60 font-medium">Please contact the administrator to assign exams to this section.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ExamSelection;