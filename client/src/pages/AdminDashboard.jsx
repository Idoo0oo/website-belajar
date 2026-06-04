import { useState, useEffect } from 'react';
import { Users, FileText, Layers, Trash2, Key } from 'lucide-react';
import api from '../hooks/useApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, materials: 0, flashcards: 0 });
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, matRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/materials')
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setMaterials(matRes.data.materials);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!confirm('WARNING: Deleting a user will permanently delete ALL their materials, flashcards, and data. Proceed?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this material and its associated flashcards?')) return;
    try {
      await api.delete(`/admin/materials/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete material.');
    }
  };

  const handleResetPassword = async (id, name) => {
    const newPassword = prompt(`Enter new password for ${name} (minimum 8 characters):`);
    if (!newPassword) return; // User cancelled
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }

    try {
      await api.put(`/admin/users/${id}/password`, { newPassword });
      alert(`Password for ${name} has been successfully changed.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change password.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-dark-muted">Loading Admin Data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-dark-surface dark:text-white mb-1">Superadmin Dashboard</h1>
        <p className="text-sm text-dark-muted">Global system management and overview.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats.users, icon: <Users size={24} className="text-lavender-deep" /> },
          { label: 'Total Materials', value: stats.materials, icon: <FileText size={24} className="text-sage-deep" /> },
          { label: 'Total Flashcards', value: stats.flashcards, icon: <Layers size={24} className="text-misty-deep" /> },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl">{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold text-dark-surface dark:text-white">{stat.value}</p>
              <p className="text-xs text-dark-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'users' ? 'bg-lavender text-dark-base' : 'glass-card text-dark-muted hover:text-dark-surface dark:hover:text-white'
          }`}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'materials' ? 'bg-lavender text-dark-base' : 'glass-card text-dark-muted hover:text-dark-surface dark:hover:text-white'
          }`}
        >
          Manage Materials
        </button>
      </div>

      {/* Tab Content */}
      <div className="glass-card rounded-2xl p-1 overflow-hidden">
        {activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-dark-muted uppercase bg-white/5">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors text-dark-surface dark:text-white">
                    <td className="px-6 py-4">{u.id}</td>
                    <td className="px-6 py-4 font-semibold">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === 'superadmin' ? 'bg-misty/20 text-misty-deep' : 'bg-white/10 text-dark-muted'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleResetPassword(u.id, u.name)} className="p-2 text-lavender-deep hover:bg-lavender/20 rounded-lg transition-colors" title="Change Password">
                        <Key size={16} />
                      </button>
                      {u.role !== 'superadmin' && (
                        <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors" title="Delete User">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-dark-muted uppercase bg-white/5">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">File</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {materials.map(m => (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors text-dark-surface dark:text-white">
                    <td className="px-6 py-4">{m.id}</td>
                    <td className="px-6 py-4 font-semibold truncate max-w-xs">{m.title}</td>
                    <td className="px-6 py-4 text-dark-muted">
                      <p className="font-semibold text-dark-surface dark:text-white">{m.user_name}</p>
                      <p className="text-xs">{m.user_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/uploads/${m.file_path}`} target="_blank" rel="noreferrer" className="text-misty-deep hover:underline">
                        View PDF
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteMaterial(m.id)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors" title="Delete Material">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
