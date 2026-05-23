import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2, File, FileUp, Loader2, RefreshCw, Trash2, UploadCloud, HardDrive,
} from 'lucide-react';
import AdminLayout from '../components/layouts/AdminLayout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { filesApi } from '../api/services';

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || '';
      const base64 = String(result).split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Files() {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [storageMode, setStorageMode] = useState('local');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await filesApi.list();
      setFiles(res.data.data?.files || []);
      setStorageMode(res.data.data?.storage_mode || 'local');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFiles(); }, []);

  const uploadFile = async () => {
    if (!selected) return;
    setUploading(true);
    setMessage('');
    try {
      const presigned = await filesApi.presign({
        fileName: selected.name,
        mimeType: selected.type || 'application/octet-stream',
        sizeBytes: selected.size,
        type: 'document',
      });
      const body = presigned.data.data;
      const upload = body.upload;
      const file = body.file;

      if (body.storage_mode === 's3' && upload.mode === 's3') {
        const uploadResponse = await fetch(upload.uploadUrl, {
          method: upload.method,
          headers: upload.headers,
          body: selected,
        });
        if (!uploadResponse.ok) throw new Error('Storage upload failed.');
        await filesApi.complete({ fileId: file.id, fileUrl: upload.publicUrl });
      } else {
        const base64 = await readFileAsBase64(selected);
        await filesApi.uploadLocal({
          fileId: file.id,
          contentBase64: base64,
          fileName: selected.name,
          mimeType: selected.type,
        });
      }

      setSelected(null);
      if (inputRef.current) inputRef.current.value = '';
      setMessage('File uploaded successfully.');
      await loadFiles();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (n) => {
    if (!n) return '—';
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 dark:text-slate-100">School files</h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <HardDrive size={14} />
              Storage: <Badge color={storageMode === 's3' ? 'green' : 'blue'}>{storageMode === 's3' ? 'Cloud (S3)' : 'Local server'}</Badge>
              {storageMode === 'local' && ' — set S3_* env vars for cloud storage'}
            </p>
          </div>
          <Button variant="secondary" onClick={loadFiles}><RefreshCw size={16} /> Refresh</Button>
        </header>

        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <div
            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <UploadCloud className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="font-bold text-slate-700 dark:text-slate-300">Drop or click to choose a file</p>
            <p className="text-xs text-slate-400 mt-1">Max 25 MB · PDF, images, documents</p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => setSelected(e.target.files?.[0] || null)}
            />
          </div>
          {selected && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl">
              <span className="text-sm font-bold truncate">{selected.name} ({formatSize(selected.size)})</span>
              <Button onClick={uploadFile} loading={uploading}><FileUp size={16} /> Upload</Button>
            </div>
          )}
          {message && (
            <p className={`text-sm flex items-center gap-2 ${message.includes('success') ? 'text-emerald-600' : 'text-rose-500'}`}>
              {message.includes('success') ? <CheckCircle2 size={16} /> : null}
              {message}
            </p>
          )}
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-black">Library ({files.length})</h2>
          </div>
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
          ) : files.length === 0 ? (
            <p className="p-12 text-center text-slate-400 text-sm">No files uploaded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-50 dark:divide-slate-800 dark:divide-slate-800">
              {files.map((f) => (
                <li key={f.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:bg-slate-800">
                  <File className="text-emerald-600 shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{f.object_key?.split('/').pop() || f.type}</p>
                    <p className="text-xs text-slate-400">{formatSize(f.size_bytes)} · {new Date(f.created_at).toLocaleString()}</p>
                  </div>
                  <Badge color={f.status === 'ready' ? 'green' : 'amber'}>{f.status}</Badge>
                  {f.status === 'ready' && f.file_url && (
                    <a href={f.file_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-600">Open</a>
                  )}
                  <button type="button" className="p-2 text-slate-400 hover:text-rose-500" onClick={async () => { await filesApi.remove(f.id); loadFiles(); }}>
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
