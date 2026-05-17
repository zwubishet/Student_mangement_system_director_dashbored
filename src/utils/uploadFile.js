import api from '../api/http.js';

/**
 * Upload via S3 presign when configured; otherwise base64 fallback for dev.
 * @returns {Promise<{ fileUrl: string, fileId?: string }>}
 */
export async function uploadSchoolFile(file, type = 'document') {
  if (!file) throw new Error('No file selected');

  try {
    const presignRes = await api.post('/files/presign', {
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      type,
    });
    const body = presignRes.data?.data || presignRes.data;
    const fileMeta = body.file;
    const uploadMeta = body.upload;

    if (!uploadMeta?.uploadUrl || !fileMeta?.id) throw new Error('Presign unavailable');

    await fetch(uploadMeta.uploadUrl, {
      method: uploadMeta.method || 'PUT',
      headers: uploadMeta.headers || { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });

    await api.post('/files/complete', {
      fileId: fileMeta.id,
      fileUrl: uploadMeta.publicUrl,
    });

    return { fileUrl: uploadMeta.publicUrl, fileId: fileMeta.id };
  } catch {
    const fileUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    return { fileUrl };
  }
}
