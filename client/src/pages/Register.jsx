import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import api from '../hooks/useApi';

const Register = () => {
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      setSuccess(res.data.message);
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light-base via-white to-light-base dark:from-dark-base dark:via-dark-surface dark:to-dark-base p-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <img src="/favicon.png" alt="StudyFlow Logo" className="w-14 h-14 object-contain drop-shadow-md mx-auto mb-3" />
          <h1 className="text-xl font-bold text-dark-surface dark:text-white">Start your journey</h1>
          <p className="text-sm text-dark-muted mt-1">Create your StudyFlow account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'reg-name',     type: 'text',     label: 'Full Name',  key: 'name',     placeholder: 'Your name' },
            { id: 'reg-email',    type: 'email',    label: 'Email',      key: 'email',    placeholder: 'you@example.com' },
            { id: 'reg-password', type: 'password', label: 'Password',   key: 'password', placeholder: '8+ characters' },
          ].map((field) => (
            <div key={field.key}>
              <label htmlFor={field.id} className="block text-xs font-medium text-dark-muted mb-1.5">{field.label}</label>
              <input
                id={field.id}
                type={field.type}
                required
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-dark-border/5 dark:bg-white/5 border border-dark-border/20 dark:border-white/10 text-dark-surface dark:text-white placeholder:text-dark-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 transition"
              />
            </div>
          ))}

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          {success && (
            <p className="text-xs text-sage bg-sage/10 border border-sage/20 rounded-lg px-3 py-3 text-center font-medium leading-relaxed">
              {success}
            </p>
          )}

          {!success && (
            <button
              id="btn-register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-sage/70 hover:bg-sage text-dark-base font-semibold text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          )}
        </form>

        <p className="text-center text-xs text-dark-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-sage hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
