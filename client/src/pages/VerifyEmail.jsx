import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MailCheck, XCircle, Loader2 } from 'lucide-react';
import api from '../hooks/useApi';

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const token = params.get('token');

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    api.post('/auth/verify-email', { token })
      .then(res => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-light-base dark:bg-dark-base">
      <div className="glass-card rounded-2xl p-10 max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="animate-spin mx-auto text-lavender-deep" />
            <h2 className="text-xl font-bold text-dark-surface dark:text-white">Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <MailCheck size={56} className="mx-auto text-sage" />
            <h2 className="text-2xl font-bold text-dark-surface dark:text-white">Email Verified!</h2>
            <p className="text-dark-muted text-sm">{message}</p>
            <Link to="/login" className="block w-full py-3 bg-sage/20 hover:bg-sage/30 text-sage font-bold rounded-xl transition-all">
              Go to Login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={56} className="mx-auto text-red-400" />
            <h2 className="text-2xl font-bold text-dark-surface dark:text-white">Verification Failed</h2>
            <p className="text-dark-muted text-sm">{message}</p>
            <Link to="/login" className="block w-full py-3 bg-dark-border/5 dark:bg-white/5 hover:bg-dark-border/10 dark:hover:bg-white/10 text-dark-surface dark:text-white font-bold rounded-xl transition-all">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
