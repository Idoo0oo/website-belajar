import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, SendHorizonal } from 'lucide-react';
import api from '../hooks/useApi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-light-base dark:bg-dark-base">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 space-y-6">
          <Link to="/login" className="flex items-center gap-2 text-sm text-dark-muted hover:text-dark-surface dark:hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Login
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-dark-surface dark:text-white mb-1">Forgot Password</h1>
            <p className="text-dark-muted text-sm">Enter your email and we'll send you a reset link.</p>
          </div>

          {sent ? (
            <div className="p-4 rounded-xl bg-sage/10 border border-sage/30 text-sage text-sm text-center">
              ✅ Check your inbox! A password reset link has been sent to <strong>{email}</strong>.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-surface dark:text-white mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-dark-border/5 dark:bg-white/5 border border-dark-border/20 dark:border-white/10 rounded-xl text-dark-surface dark:text-white placeholder-dark-muted focus:outline-none focus:border-lavender/50 transition-colors"
                  />
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-lavender to-misty text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : <><SendHorizonal size={16} /> Send Reset Link</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
