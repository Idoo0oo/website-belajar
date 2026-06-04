import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, X } from 'lucide-react';
import api from '../hooks/useApi';

const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return setError('New passwords do not match.');
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-6 w-full max-w-sm space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Change Password</h2>
          <button onClick={onClose} className="text-dark-muted hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 size={40} className="text-sage" />
            <p className="text-sage font-bold text-sm">Password changed!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'currentPassword', label: 'Current Password' },
              { name: 'newPassword', label: 'New Password', hint: 'min 8 characters' },
              { name: 'confirmPassword', label: 'Confirm New Password' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-dark-muted mb-1.5">
                  {field.label} {field.hint && <span className="text-dark-muted/60">({field.hint})</span>}
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    required
                    minLength={field.name !== 'currentPassword' ? 8 : undefined}
                    className="w-full pl-8 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-dark-muted focus:outline-none focus:border-lavender/50 transition-colors"
                  />
                  {field.name === 'confirmPassword' && (
                    <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-lavender hover:bg-lavender-deep text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
