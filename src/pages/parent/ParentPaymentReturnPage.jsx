import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import ParentLayout from '../../components/layouts/ParentLayout';
import Button from '../../components/ui/Button';
import { parentPortalApi } from '../../api/services';
import { ui } from '../../theme/tokens';

export default function ParentPaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const txRef = searchParams.get('tx_ref') || searchParams.get('trx_ref');
  const studentId = searchParams.get('student_id');
  const [state, setState] = useState({ loading: true, status: null, message: null });

  useEffect(() => {
    if (!txRef) {
      setState({ loading: false, status: 'error', message: 'Missing payment reference.' });
      return;
    }
    parentPortalApi.verifyChapaPayment(txRef)
      .then((r) => {
        const d = r.data?.data || r.data;
        if (d?.status === 'success') {
          setState({ loading: false, status: 'success', message: 'Payment received. Your invoice balance will update shortly.' });
        } else {
          setState({
            loading: false,
            status: 'failed',
            message: d?.message || 'Payment was not completed. You can try again from the student page.',
          });
        }
      })
      .catch((e) => {
        setState({
          loading: false,
          status: 'error',
          message: e.response?.data?.message || 'Could not confirm payment. If you were charged, contact the school.',
        });
      });
  }, [txRef]);

  const backPath = studentId ? `/parent/children/${studentId}` : '/parent/dashboard';

  return (
    <ParentLayout>
      <div className={`${ui.card} p-8 max-w-lg mx-auto text-center`}>
        {state.loading && (
          <>
            <Loader2 className="mx-auto text-amber-500 animate-spin" size={40} />
            <p className={`mt-4 font-bold ${ui.panelTitle}`}>Confirming payment…</p>
            <p className={`text-sm mt-2 ${ui.muted}`}>Please wait while we verify with Chapa.</p>
          </>
        )}
        {!state.loading && state.status === 'success' && (
          <>
            <CheckCircle className="mx-auto text-emerald-500" size={48} />
            <p className="mt-4 text-xl font-black text-emerald-700">Payment successful</p>
            <p className={`text-sm mt-2 ${ui.muted}`}>{state.message}</p>
          </>
        )}
        {!state.loading && state.status !== 'success' && (
          <>
            <XCircle className="mx-auto text-rose-500" size={48} />
            <p className="mt-4 text-xl font-black text-rose-700">Payment not confirmed</p>
            <p className={`text-sm mt-2 ${ui.muted}`}>{state.message}</p>
          </>
        )}
        {!state.loading && (
          <Button variant="primary" className="mt-8" onClick={() => navigate(backPath)}>
            Back to student
          </Button>
        )}
      </div>
    </ParentLayout>
  );
}
