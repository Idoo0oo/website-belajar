import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Inbox, FileText, BrainCircuit, Trash2, Search } from 'lucide-react';
import api from '../hooks/useApi';
import Swal from 'sweetalert2';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [title, setTitle]         = useState('');
  const [error, setError]         = useState('');
  const fileRef                   = useRef(null);
  const navigate                  = useNavigate();

  const fetchMaterials = () => {
    api.get('/materials').then((r) => setMaterials(r.data.materials)).catch(console.error);
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    const file = fileRef.current?.files[0];
    if (!file || !title) return setError('Please select a PDF and enter a title.');
    if (file.type !== 'application/pdf') return setError('Only PDF files are allowed.');

    const form = new FormData();
    form.append('pdf', file);
    form.append('title', title);
    setUploading(true);
    try {
      await api.post('/materials/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTitle('');
      fileRef.current.value = '';
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this material and all its tags/flashcards?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;

    await api.delete(`/materials/${id}`);
    fetchMaterials();
  };

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Upload form */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-dark-surface dark:text-white mb-4 flex items-center gap-2">
          <Upload size={16} /> Upload Study Material
        </h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <input
            id="material-title"
            type="text"
            placeholder="Document title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-dark-border/5 dark:bg-white/5 border border-dark-border/20 dark:border-white/10 text-dark-surface dark:text-white placeholder:text-dark-muted text-sm focus:outline-none focus:ring-2 focus:ring-lavender/50"
          />
          <div className="flex gap-3">
            <input
              id="material-file"
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="flex-1 text-sm text-dark-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-lavender/20 file:text-lavender-deep hover:file:bg-lavender/30 file:cursor-pointer"
            />
            <button
              id="btn-upload-material"
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl bg-lavender/70 hover:bg-lavender text-dark-base font-semibold text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 shrink-0"
            >
              {uploading ? '⏳' : 'Upload'}
            </button>
          </div>
          {error && <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
        </form>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h3 className="font-bold text-dark-surface dark:text-white text-lg">My Materials</h3>
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-border/5 dark:bg-white/5 border border-dark-border/20 dark:border-white/10 text-dark-surface dark:text-white placeholder-dark-muted text-sm focus:outline-none focus:border-lavender/50 transition-colors"
          />
        </div>
      </div>

      {/* Materials list */}
      {filteredMaterials.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-dark-muted flex flex-col items-center">
          <Inbox size={48} className="mb-4 text-dark-muted/50" />
          <p className="text-sm">{searchQuery ? 'No materials match your search.' : 'No materials yet. Upload your first PDF above.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((m) => (
            <div key={m.id} className="glass-card rounded-2xl p-4 flex flex-col gap-3 hover:scale-[1.01] transition-transform">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-misty/20 flex items-center justify-center text-misty-deep shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-dark-surface dark:text-white truncate">{m.title}</p>
                  <p className="text-xs text-dark-muted mt-0.5">
                    {new Date(m.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => navigate(`/viewer/${m.id}`)}
                  className="flex-1 py-2 rounded-xl bg-dark-border/5 dark:bg-white/5 hover:bg-dark-border/10 dark:hover:bg-white/10 text-xs font-bold text-dark-surface dark:text-white transition-colors"
                >
                  Read & Tag
                </button>
                <button
                  onClick={() => navigate(`/quiz/${m.id}`)}
                  className="flex-1 py-2 rounded-xl bg-lavender/20 hover:bg-lavender/30 text-lavender-deep text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <BrainCircuit size={14} /> AI Quiz
                </button>
              </div>
              <button
                id={`btn-delete-material-${m.id}`}
                onClick={() => handleDelete(m.id)}
                className="w-full py-1.5 rounded-lg bg-red-400/10 hover:bg-red-400/20 text-xs font-medium text-red-400 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Materials;
