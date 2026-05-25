/** Trigger browser download from axios blob response. */
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
