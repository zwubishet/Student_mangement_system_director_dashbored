import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  File,
  FileUp,
  Loader2,
  RefreshCw,
  UploadCloud,
} from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';
import { apiRequest } from '../api/restClient';

const Files = () => {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const loadFiles = async () => {
    setLoading(true);
    const result = await apiRequest('/files');
    setFiles(result.files || []);
    setLoading(false);
  };

  useEffect(() => {
    loadFiles().catch((err) => {
      setMessage(err.message);
      setLoading(false);
    });
  }, []);

  const uploadFile = async () => {
    if (!selected) return;
    setUploading(true);
    setMessage('');
    try {
      const presigned = await apiRequest('/files/presign', {
        method: 'POST',
        body: JSON.stringify({
          fileName: selected.name,
          mimeType: selected.type || 'application/octet-stream',
          sizeBytes: selected.size,
          type: 'document',
        }),
      });

      const uploadResponse = await fetch(presigned.upload.uploadUrl, {
        method: presigned.upload.method,
        headers: presigned.upload.headers,
        body: selected,
      });

      if (!uploadResponse.ok) throw new Error('Storage upload failed.');

      await apiRequest('/files/complete', {
        method: 'POST',
        body: JSON.stringify({
          fileId: presigned.file.id,
          fileUrl: presigned.upload.publicUrl,
        }),
      });

      setSelected(null);
      if (inputRef.current) inputRef.current.value = '';
      setMessage('File uploaded and registered.');
      await loadFiles();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Infrastructure</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Secure Files</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Presigned uploads tied to the current school tenant.</p>
          </div>
          <button
            onClick={loadFiles}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {message && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <UploadCloud className="text-emerald-600" size={20} />
              <h2 className="font-black text-slate-900">Upload Document</h2>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:border-emerald-300 hover:bg-emerald-50/50"
            >
              <FileUp className="mb-3 text-slate-400" size={32} />
              <span className="text-sm font-black text-slate-800">{selected?.name || 'Choose a file'}</span>
              <span className="mt-1 text-xs font-semibold text-slate-400">Maximum 25 MB</span>
            </button>

            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(event) => setSelected(event.target.files?.[0] || null)}
            />

            <button
              disabled={!selected || uploading}
              onClick={uploadFile}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />} Upload
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="font-black text-slate-900">Recent Files</h2>
              <span className="text-xs font-bold text-slate-400">{files.length} records</span>
            </div>
            {loading ? (
              <div className="flex h-72 items-center justify-center text-slate-400"><Loader2 className="animate-spin" /></div>
            ) : files.length === 0 ? (
              <div className="py-20 text-center">
                <File className="mx-auto mb-3 text-slate-200" size={40} />
                <p className="font-bold text-slate-500">No files uploaded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {files.map((file) => (
                  <a
                    key={file.id}
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <File size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-900">{file.object_key?.split('/').pop() || 'File'}</p>
                      <p className="text-xs font-semibold text-slate-400">{file.mime_type || file.type} · {formatBytes(file.size_bytes)}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                      <CheckCircle2 size={12} /> {file.status}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const formatBytes = (value) => {
  const bytes = Number(value || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default Files;
