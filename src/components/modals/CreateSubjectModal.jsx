import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { X, BookOpen, Loader2 } from 'lucide-react';
import { CREATE_SUBJECT } from '../../api/classGql';

const CreateSubjectModal = ({ isOpen, onClose, onRefresh }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const [createSubject, { loading }] = useMutation(CREATE_SUBJECT, {
    onCompleted: () => {
      setName('');
      setError('');
      if (onRefresh) onRefresh();
      onClose();
    },
    onError: (err) => setError(err.message)
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createSubject({ variables: { name: name.trim() } });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <BookOpen size={24} />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight">New Subject</h2>
            <p className="text-slate-500 font-medium text-sm">Define a new discipline for the curriculum.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject Name</label>
              <input 
                autoFocus
                type="text" 
                placeholder="e.g. Mathematics" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 transition-all font-bold text-slate-900"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-tight">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !name.trim()}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Subject'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSubjectModal;