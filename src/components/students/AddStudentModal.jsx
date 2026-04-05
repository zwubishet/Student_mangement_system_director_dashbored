import { useState, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { X, Loader2, CheckCircle2 } from 'lucide-react';

// Mutation remains the same, ensures the backend receives the 'object'
const REGISTER_STUDENT = gql`
  mutation RegisterStudent($object: RegisterStudentInput!) {
    RegisterStudentEnrollment(object: $object) {
      enrollment_id
      student_id
    }
  }
`;

// FIXED QUERY: Dives into the 'section' relation to get the correct IDs and Names
const GET_ADMISSION_DATA = gql`
  query GetAdmissionData {
    academic_academicyears(where: {status: {_eq: "active"}}) {
      id
      name
      classes {
        section {
          id
          name
        }
      }
    }
  }
`;

const AddStudentModal = ({ isOpen, onClose, onRefresh }) => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  
  // Watch the selected year to filter classes dynamically
  const selectedYearId = watch("academic_year_id");

  // Fetch admission data (Years and their associated class sections)
  const { data: adminData, loading: dataLoading } = useQuery(GET_ADMISSION_DATA);

  const [registerStudent, { loading: mutationLoading }] = useMutation(REGISTER_STUDENT, {
    onCompleted: () => { 
      reset(); 
      onRefresh(); 
      onClose(); 
    },
    onError: (err) => alert(`Registration Failed: ${err.message}`)
  });

  // MEMOIZED LOGIC: Finds the classes for the currently selected year
  const availableClasses = useMemo(() => {
    if (!selectedYearId || !adminData) return [];
    const yearRecord = adminData.academic_academicyears.find(y => y.id === selectedYearId);
    return yearRecord?.classes || [];
  }, [selectedYearId, adminData]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    registerStudent({
      variables: {
        object: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          admission_number: data.admission_number,
          academic_year_id: data.academic_year_id,
          section_id: data.section_id, // This is the ID from section.id
          password: "Student123!"     // Default password for the Identity record
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Student Admission</h2>
            <p className="text-slate-500 text-sm font-medium">Register and enroll a new student</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            
            {/* Personal Section */}
            <div className="md:col-span-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500">Personal Details</h3>
            </div>
            
            <div className="flex flex-col gap-1">
              <input {...register("first_name", { required: true })} className="input-field" placeholder="First Name" />
            </div>
            
            <div className="flex flex-col gap-1">
              <input {...register("last_name", { required: true })} className="input-field" placeholder="Last Name" />
            </div>

            <input {...register("email", { required: true })} type="email" className="input-field" placeholder="Email Address" />
            <input {...register("admission_number", { required: true })} className="input-field" placeholder="Admission Number" />
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 ml-3 mb-1 uppercase">Date of Birth</label>
              <input {...register("date_of_birth", { required: true })} type="date" className="input-field" />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 ml-3 mb-1 uppercase">Gender</label>
              <select {...register("gender", { required: true })} className="input-field bg-white">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            {/* Placement Section */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500">Academic Placement</h3>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 ml-3 mb-1 uppercase">Academic Year</label>
              <select {...register("academic_year_id", { required: true })} className="input-field bg-white">
                <option value="">Select Academic Year</option>
                {adminData?.academic_academicyears.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>

            {/* FIXED SECTION DROPDOWN */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 ml-3 mb-1 uppercase">Target Class/Section</label>
              <select 
                {...register("section_id", { required: true })} 
                disabled={!selectedYearId || availableClasses.length === 0}
                className="input-field bg-white font-black disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {!selectedYearId 
                    ? "Select Year First" 
                    : availableClasses.length === 0 
                      ? "No Classes Activated" 
                      : "Select Target Class"}
                </option>
                {availableClasses.map((item, idx) => (
                  <option key={item.section?.id || idx} value={item.section?.id}>
                    {item.section?.name || "Unnamed Class"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex gap-4">
            <button 
              type="submit" 
              disabled={mutationLoading || dataLoading} 
              className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
            >
              {mutationLoading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Register Student</>}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-4 border-2 border-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .input-field { 
          width: 100%; 
          padding: 0.75rem 1.25rem; 
          border-radius: 1rem; 
          border: 2px solid #f1f5f9; 
          font-weight: 600; 
          font-size: 0.875rem; 
          transition: all 0.2s; 
          outline: none; 
          color: #1e293b;
        }
        .input-field:focus { 
          border-color: #6366f1; 
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); 
        }
        .input-field::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }
      `}} />
    </div>
  );
};

export default AddStudentModal;