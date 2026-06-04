import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import api from '../hooks/useApi';

const Login = () => {
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-base via-dark-surface to-dark-base p-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender to-misty flex items-center justify-center text-white shadow-lg mx-auto mb-3">
            <Brain size={28} />
          </div>
          <h1 className="text-xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-dark-muted mt-1">Sign in to StudyFlow</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-medium text-dark-muted mb-1.5">Email</label>
            <input
              id="login-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-dark-muted text-sm focus:outline-none focus:ring-2 focus:ring-lavender/50 transition"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-medium text-dark-muted mb-1.5">Password</label>
            <input
              id="login-password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-dark-muted text-sm focus:outline-none focus:ring-2 focus:ring-lavender/50 transition"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            id="btn-login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-lavender/80 hover:bg-lavender text-dark-base font-semibold text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-dark-muted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-lavender hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
