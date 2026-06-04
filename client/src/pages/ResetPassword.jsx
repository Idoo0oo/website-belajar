import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import api from '../hooks/useApi';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-light-base dark:bg-dark-base">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <p className="text-red-400">Invalid reset link. Please request a new one.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      return setError('Passwords do not match.');
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-light-base dark:bg-dark-base">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-dark-surface dark:text-white mb-1">Reset Password</h1>
            <p className="text-dark-muted text-sm">Choose a new secure password for your account.</p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle2 size={48} className="text-sage" />
              <p className="text-sage font-bold">Password reset successfully!</p>
              <p className="text-dark-muted text-sm">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-surface dark:text-white mb-1.5">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-10 py-3 bg-dark-border/5 dark:bg-white/5 border border-dark-border/20 dark:border-white/10 rounded-xl text-dark-surface dark:text-white placeholder-dark-muted focus:outline-none focus:border-lavender/50 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-surface dark:text-white mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-3 bg-dark-border/5 dark:bg-white/5 border border-dark-border/20 dark:border-white/10 rounded-xl text-dark-surface dark:text-white placeholder-dark-muted focus:outline-none focus:border-lavender/50 transition-colors"
                  />
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-lavender to-misty text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
