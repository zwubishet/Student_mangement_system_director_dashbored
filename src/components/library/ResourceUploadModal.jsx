import { useEffect, useRef, useState } from 'react';
import { UploadCloud, Link2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { filesApi, resourcesApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ResourceUploadModal({
  open,
  onClose,
  categories = [],
  grades = [],
  subjects = [],
  onSuccess,
}) {
  const { toast } = useToast();
  const inputRef = useRef(null);
  const [mode, setMode] = useState('file');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    title_am: '',
    description: '',
    category_id: '',
    grade_id: '',
    subject_id: '',
    language: 'english',
    external_url: '',
    access_level: 'school',
  });

  useEffect(() => {
    if (!open) {
      setFile(null);
      setMode('file');
      setForm({
        title: '', title_am: '', description: '', category_id: '',
        grade_id: '', subject_id: '', language: 'english', external_url: '', access_level: 'school',
      });
    }
  }, [open]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const uploadFileToStorage = async (selected) => {
    const presigned = await filesApi.presign({
      fileName: selected.name,
      mimeType: selected.type || 'application/octet-stream',
      sizeBytes: selected.size,
      type: 'resource',
    });
    const body = presigned.data.data;
    const upload = body.upload;
    const fileRow = body.file;

    if (body.storage_mode === 's3' && upload.mode === 's3') {
      const uploadResponse = await fetch(upload.uploadUrl, {
        method: upload.method,
        headers: upload.headers,
        body: selected,
      });
      if (!uploadResponse.ok) throw new Error('Storage upload failed.');
      await filesApi.complete({ fileId: fileRow.id, fileUrl: upload.publicUrl });
    } else {
      const base64 = await readFileAsBase64(selected);
      await filesApi.uploadLocal({
        fileId: fileRow.id,
        contentBase64: base64,
        fileName: selected.name,
        mimeType: selected.type,
      });
    }
    return fileRow;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category_id) {
      toast('Title and category are required.', 'error');
      return;
    }
    if (mode === 'file' && !file) {
      toast('Select a file to upload.', 'error');
      return;
    }
    if (mode === 'link' && !form.external_url.trim()) {
      toast('External URL is required.', 'error');
      return;
    }

    setUploading(true);
    try {
      let file_id = null;
      let file_name = null;
      let file_size_bytes = null;
      let file_type = mode === 'link' ? 'link' : null;

      if (mode === 'file' && file) {
        const stored = await uploadFileToStorage(file);
        file_id = stored.id;
        file_name = file.name;
        file_size_bytes = file.size;
        if (file.type === 'application/pdf') file_type = 'pdf';
        else if (file.type?.startsWith('video/')) file_type = 'video';
        else if (file.type?.startsWith('image/')) file_type = 'image';
        else file_type = 'file';
      }

      await resourcesApi.create({
        ...form,
        file_id,
        file_name,
        file_size_bytes,
        file_type,
        external_url: mode === 'link' ? form.external_url.trim() : null,
      });

      toast('Resource submitted successfully.', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast(err.response?.data?.message || err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add resource" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${mode === 'file' ? 'bg-white dark:bg-slate-900 shadow-sm' : ''}`}
            onClick={() => setMode('file')}
          >
            <UploadCloud size={16} className="inline mr-1" /> Upload file
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${mode === 'link' ? 'bg-white dark:bg-slate-900 shadow-sm' : ''}`}
            onClick={() => setMode('link')}
          >
            <Link2 size={16} className="inline mr-1" /> External link
          </button>
        </div>

        {mode === 'file' ? (
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer ${ui.card}`}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.webm,.jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setFile(f || null);
                if (f && !form.title) set('title', f.name.replace(/\.[^.]+$/, ''));
              }}
            />
            <UploadCloud className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {file ? file.name : 'Click to choose PDF, video, or document'}
            </p>
            <p className={`${ui.muted} text-xs mt-1`}>Max 25MB · PDF, Office, video, images</p>
          </div>
        ) : (
          <div>
            <label className={ui.inputLabel}>URL (YouTube, MoE link, etc.)</label>
            <input
              className={ui.input}
              value={form.external_url}
              onChange={(e) => set('external_url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={ui.inputLabel}>Title *</label>
            <input className={ui.input} value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <label className={ui.inputLabel}>Title (Amharic)</label>
            <input className={ui.input} value={form.title_am} onChange={(e) => set('title_am', e.target.value)} />
          </div>
          <div>
            <label className={ui.inputLabel}>Category *</label>
            <Select
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
              options={[{ value: '', label: 'Select…' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
            />
          </div>
          <div>
            <label className={ui.inputLabel}>Language</label>
            <Select
              value={form.language}
              onChange={(e) => set('language', e.target.value)}
              options={[
                { value: 'english', label: 'English' },
                { value: 'amharic', label: 'Amharic' },
                { value: 'oromiffa', label: 'Afaan Oromoo' },
                { value: 'tigrinya', label: 'Tigrinya' },
              ]}
            />
          </div>
          <div>
            <label className={ui.inputLabel}>Grade</label>
            <Select
              value={form.grade_id}
              onChange={(e) => set('grade_id', e.target.value)}
              options={[{ value: '', label: 'All grades' }, ...grades.map((g) => ({ value: g.id, label: g.name }))]}
            />
          </div>
          <div>
            <label className={ui.inputLabel}>Subject</label>
            <Select
              value={form.subject_id}
              onChange={(e) => set('subject_id', e.target.value)}
              options={[{ value: '', label: 'Cross-subject' }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={ui.inputLabel}>Description</label>
            <textarea
              className={ui.input}
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={uploading}>
            {uploading ? 'Uploading…' : 'Submit resource'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
