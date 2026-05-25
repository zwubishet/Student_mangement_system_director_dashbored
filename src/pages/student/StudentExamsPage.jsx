import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import StudentLayout from '../../components/layouts/StudentLayout';
import GradeReportView from '../../components/grading/GradeReportView';
import { studentPortalApi } from '../../api/services';
import { downloadBlob } from '../../utils/downloadBlob';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

export default function StudentExamsPage() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    studentPortalApi.exams()
      .then((r) => setData(r.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const downloadPdf = async (termId) => {
    setDownloadingPdf(true);
    try {
      const res = await studentPortalApi.reportCard(termId ? { term_id: termId } : {});
      downloadBlob(res.data, 'my-report-card.pdf');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not download report card', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <StudentLayout>
      <header className="mb-6">
        <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Award className="text-violet-600" size={26} /> My grades
        </h1>
        <p className={`${ui.muted} text-sm mt-1`}>
          Official results after your school publishes each exam — drafts and pending marks are hidden.
        </p>
      </header>
      <GradeReportView
        data={data}
        loading={loading}
        onDownloadPdf={downloadPdf}
        downloadingPdf={downloadingPdf}
      />
    </StudentLayout>
  );
}
