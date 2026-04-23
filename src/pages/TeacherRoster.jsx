import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_CLASS_ROSTER } from '../api/teacherGql';
import AdminLayout from '../components/layouts/AdminLayout';
import StudentDetailDrawer from '../components/students/StudentDetailDrawer'; 
import { 
  Users, ArrowLeft, Search, MoreHorizontal, 
  Loader2, FileText, UserCircle, Download, ExternalLink
} from 'lucide-react';

const TeacherRoster = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { data, loading } = useQuery(GET_CLASS_ROSTER, {
    variables: { sectionId },
  });

  const section = data?.academic_sections_by_pk;
  const enrollments = section?.studentenrollments || [];

  // Function to trigger drawer
  const handleOpenStudent = (student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const filteredStudents = enrollments.filter(({ student }) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const admNo = student.admission_number.toLowerCase();
    return fullName.includes(searchTerm) || admNo.includes(searchTerm);
  });

  if (loading) return (
    <AdminLayout>
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="bg-slate-50 min-h-screen">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
          
          {/* ACTION BAR */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <ArrowLeft size={20} className="text-slate-500" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  Grade {section?.grade?.name}-{section?.name} <span className="text-slate-300 font-light">|</span> Roster
                </h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{filteredStudents.length} Students Total</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search name or ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
                <Download size={16} />
                <span className="hidden md:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* SPREADSHEET TABLE */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
                    <th className="px-8 py-5">Full Student Name</th>
                    <th className="px-8 py-5">Admission ID</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">View Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map(({ student }) => (
                    <tr 
                      key={student.id} 
                      onClick={() => handleOpenStudent(student)}
                      className="hover:bg-indigo-50/40 transition-all group cursor-pointer"
                    >
                      {/* AVATAR + NAME */}
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center font-black text-xs group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-none group-hover:text-indigo-700 transition-colors">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">
                              Official Enrollment
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="px-8 py-4">
                        <code className="text-xs font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {student.admission_number}
                        </code>
                      </td>

                      {/* STATUS */}
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${student.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${student.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {student.status}
                          </span>
                        </div>
                      </td>

                      {/* ACTION BUTTON */}
                      <td className="px-8 py-4 text-right">
                        <button className="p-2 text-slate-300 group-hover:text-indigo-600 group-hover:bg-white group-hover:shadow-sm rounded-xl transition-all">
                          <ExternalLink size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredStudents.length === 0 && (
                <div className="p-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <Search size={32} className="text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold">No students found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* IDENTITY DRAWER */}
        <StudentDetailDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          student={selectedStudent} 
        />
      </div>
    </AdminLayout>
  );
};

export default TeacherRoster;