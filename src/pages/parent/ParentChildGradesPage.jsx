import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';
import ParentLayout from '../../components/layouts/ParentLayout';
import Button from '../../components/ui/Button';
import GradeReportView from '../../components/grading/GradeReportView';
import { parentPortalApi } from '../../api/services';
import { downloadBlob } from '../../utils/downloadBlob';
import { useToast } from '../../context/ToastContext';
import { ui } from '../../theme/tokens';

export default function ParentChildGradesPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    Promise.all([
      parentPortalApi.childGrades(studentId),
      parentPortalApi.childDetail(studentId),
    ])
      .then(([gradesRes, detailRes]) => {
        setData(gradesRes.data.data);
        const s = detailRes.data.data?.student;
        if (s) setStudentName(`${s.first_name} ${s.last_name}`);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [studentId]);

  const downloadPdf = async (termId) => {
    setDownloadingPdf(true);
    try {
      const res = await parentPortalApi.childReportCard(studentId, termId ? { term_id: termId } : {});
      downloadBlob(res.data, `report-card-${studentId}.pdf`);
    } catch (err) {
      toast(err.response?.data?.message || 'Could not download report card', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <ParentLayout>
      <Button variant="secondary" className="mb-6" onClick={() => navigate(`/parent/children/${studentId}`)}>
        <ArrowLeft size={16} /> Back to child profile
      </Button>
      <header className="mb-6">
        <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Award className="text-violet-600" size={26} /> Grades & results
        </h1>
        {studentName && <p className={`${ui.muted} text-sm mt-1`}>{studentName}</p>}
      </header>
      <GradeReportView
        data={data}
        loading={loading}
        showStudentName={studentName}
        onDownloadPdf={downloadPdf}
        downloadingPdf={downloadingPdf}
      />
    </ParentLayout>
  );
}
