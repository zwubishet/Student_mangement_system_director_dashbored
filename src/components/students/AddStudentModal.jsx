import { useState } from 'react';
import { gql } from '@apollo/client';
import {useMutation, useQuery } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { X, Loader2, CheckCircle2 } from 'lucide-react';

// CHANGE THIS:
const REGISTER_STUDENT = gql`
  mutation RegisterStudent($object: RegisterStudentInput!) {
    RegisterStudentEnrollment(object: $object) {
      enrollment_id
      student_id
    }
  }
`;

// Updated to match your schema path: Year -> Classes
const GET_ADMISSION_DATA = gql`
  query GetAdmissionData {
    academic_academicyears(where: {status: {_eq: "active"}}) {
      id
      name
      classes {
        id
        name
        # Note: If your Register mutation needs a SECTION_ID, 
        # ensure your class model has a section_id or fetch sections here
      }
    }
  }
`;

const AddStudentModal = ({ isOpen, onClose, onRefresh }) => {
  const { register, handleSubmit, reset, watch } = useForm();
  const selectedYearId = watch("academic_year_id");

  const { data: adminData, loading: dataLoading } = useQuery(GET_ADMISSION_DATA);

  const [registerStudent, { loading: mutationLoading }] = useMutation(REGISTER_STUDENT, {
    onCompleted: () => { reset(); onRefresh(); onClose(); },
    onError: (err) => alert(`Registration Failed: ${err.message}`)
  });

  if (!isOpen) return null;

  const availableClasses = adminData?.academic_academicyears.find(
    y => y.id === selectedYearId
  )?.classes || [];

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
          section_id: data.section_id, // Passed from Class selection
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-black text-slate-900">Student Admission</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div className="md:col-span-2"><h3 className="text-xs font-black uppercase tracking-widest text-indigo-500">Personal Details</h3></div>
            
            <input {...register("first_name", { required: true })} className="input-field" placeholder="First Name" />
            <input {...register("last_name", { required: true })} className="input-field" placeholder="Last Name" />
            <input {...register("email", { required: true })} type="email" className="input-field" placeholder="Email Address" />
            <input {...register("admission_number", { required: true })} className="input-field" placeholder="Admission Number" />
            <input {...register("date_of_birth", { required: true })} type="date" className="input-field" />
            
            <select {...register("gender", { required: true })} className="input-field bg-white">
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>

            <div className="md:col-span-2 mt-4"><h3 className="text-xs font-black uppercase tracking-widest text-indigo-500">Academic Placement</h3></div>

            <select {...register("academic_year_id", { required: true })} className="input-field bg-white">
              <option value="">Select Academic Year</option>
              {adminData?.academic_academicyears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>

            <select {...register("section_id", { required: true })} disabled={!selectedYearId} className="input-field bg-white disabled:bg-slate-50">
              <option value="">{selectedYearId ? "Select Target Class" : "Select Year First"}</option>
              {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="mt-10 flex gap-4">
            <button type="submit" disabled={mutationLoading} className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
              {mutationLoading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> Register Student</>}
            </button>
            <button type="button" onClick={onClose} className="px-8 py-4 border-2 border-slate-100 text-slate-500 rounded-2xl font-bold">Cancel</button>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .input-field { width: 100%; padding: 0.75rem 1.25rem; border-radius: 1rem; border: 2px solid #f1f5f9; font-weight: 600; font-size: 0.875rem; transition: all 0.2s; outline: none; }
        .input-field:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
      `}} />
    </div>
  );
};

export default AddStudentModal;