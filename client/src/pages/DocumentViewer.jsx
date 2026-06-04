import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { Leaf, CheckCircle2, AlertTriangle, AlertOctagon, Sparkles } from 'lucide-react';
import api from '../hooks/useApi';
import useTimerStore from '../store/useTimerStore';
import { getRandomAffirmation } from '../utils/affirmations';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Fix API/Worker version mismatch by loading the worker matching the exact pdfjs version
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isBreak, isRunning, startTimer } = useTimerStore();

  const [material, setMaterial] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [tags, setTags] = useState([]);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const [matRes, tagsRes] = await Promise.all([
          api.get(`/materials/${id}`),
          api.get(`/materials/${id}/tags`)
        ]);
        setMaterial(matRes.data.material);
        setTags(tagsRes.data.tags);
      } catch (err) {
        setError('Failed to load material.');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [id]);

  const handleTagPage = async (status) => {
    try {
      await api.post(`/materials/${id}/tags`, { page_number: pageNumber, status });
      // Re-fetch tags
      const res = await api.get(`/materials/${id}/tags`);
      setTags(res.data.tags);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/flashcards/auto-generate', { material_id: id });
      alert(res.data.message);
      navigate('/flashcards');
    } catch (err) {
      alert('Failed to generate flashcards.');
    } finally {
      setGenerating(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const currentPageTag = tags.find(t => t.page_number === pageNumber)?.status;

  if (loading) return <div className="p-8 text-center text-dark-muted">Loading document...</div>;
  if (error || !material) return <div className="p-8 text-center text-red-400">{error}</div>;

  // The Vite proxy handles /uploads routing to Express in dev
  const fileUrl = `/uploads/${material.file_path}`;

  return (
    <div className="relative flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
      {/* Break Overlay — Covers only the viewer area, cannot be dismissed directly */}
      {isBreak && (
        <div className="absolute inset-0 z-30 glass-card bg-dark-base/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center rounded-2xl overflow-hidden animate-fade-in">
          <Leaf size={64} className="mb-6 text-sage animate-bounce" />
          <h2 className="text-3xl font-bold text-dark-surface dark:text-white mb-4">Mandatory Break Time</h2>
          <p className="text-lg text-white/80 max-w-md mb-8">
            Your brain needs this time to consolidate what you just learned. Step away from the screen, stretch, or get some water.
          </p>
          <div className="glass-card p-6 rounded-2xl max-w-sm w-full bg-white/10">
            <p className="text-sage font-medium italic">"{getRandomAffirmation()}"</p>
          </div>
        </div>
      )}

      {/* Main PDF Viewer Area */}
      <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden relative bg-white/40 dark:bg-dark-base/40">
        {/* Toolbar */}
        <div className="h-14 border-b border-white/20 flex items-center justify-between px-4 shrink-0 bg-white/5 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/materials')} className="text-xs font-semibold text-dark-muted hover:text-dark-surface dark:hover:text-white transition-colors">
              ← Back
            </button>
            <h2 className="text-sm font-semibold truncate max-w-[200px] text-dark-surface dark:text-white">{material.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-dark-surface dark:text-white font-bold" title="Zoom Out">-</button>
            <span className="text-xs font-mono w-10 text-center text-dark-surface dark:text-white">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-dark-surface dark:text-white font-bold" title="Zoom In">+</button>
          </div>
        </div>

        {/* PDF Document Container */}
        <div className="flex-1 overflow-auto flex justify-center p-4">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="mt-20 text-dark-muted font-medium animate-pulse">Rendering PDF...</div>}
            className="flex flex-col items-center"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className="shadow-2xl rounded-sm overflow-hidden"
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>

        {/* Bottom Pagination */}
        <div className="h-14 border-t border-white/20 flex items-center justify-center gap-4 shrink-0 bg-white/5 backdrop-blur-md z-10">
          <button
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(p => p - 1)}
            className="px-4 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 text-sm font-semibold transition-colors text-dark-surface dark:text-white"
          >
            Prev
          </button>
          <span className="text-sm font-medium text-dark-muted">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(p => p + 1)}
            className="px-4 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 text-sm font-semibold transition-colors text-dark-surface dark:text-white"
          >
            Next
          </button>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        {!isRunning && (
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between bg-lavender/10 border-lavender/30">
            <div>
              <p className="text-sm font-bold text-lavender-deep">Timer is paused</p>
              <p className="text-xs text-dark-muted">Start focusing to track your time.</p>
            </div>
            <button onClick={startTimer} className="px-4 py-2 rounded-xl bg-lavender text-dark-base font-bold text-sm hover:scale-105 transition-transform shadow-md">
              Start
            </button>
          </div>
        )}

        {/* Tagging */}
        <div className="glass-card p-5 rounded-2xl">
          <h3 className="text-sm font-semibold text-dark-surface dark:text-white mb-3">Page {pageNumber} Understanding</h3>
          <div className="flex flex-col gap-2">
            {[
              { status: 'UNDERSTOOD', label: 'Understood', color: 'bg-sage', icon: <CheckCircle2 size={18} /> },
              { status: 'REVIEW', label: 'Needs Review', color: 'bg-yellow-400', icon: <AlertTriangle size={18} /> },
              { status: 'FOCUS', label: 'High Priority/Hard', color: 'bg-red-400', icon: <AlertOctagon size={18} /> }
            ].map(t => {
              const isActive = currentPageTag === t.status;
              return (
                <button
                  key={t.status}
                  onClick={() => handleTagPage(t.status)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? `${t.color} text-dark-base font-bold ring-2 ring-white/50 scale-[1.02] shadow-md`
                      : 'bg-white/5 hover:bg-white/10 text-dark-muted hover:text-dark-surface dark:hover:text-white'
                  }`}
                >
                  <span className="shrink-0">{t.icon}</span>
                  <span className="text-sm">{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* AI Action */}
        <div className="glass-card p-5 rounded-2xl bg-misty/5 border-misty/20">
          <h3 className="text-sm font-semibold text-dark-surface dark:text-white mb-2">Smart Actions</h3>
          <p className="text-xs text-dark-muted mb-4">
            Automatically generate active recall flashcards from pages tagged as <span className="text-yellow-500 font-bold">Review</span> or <span className="text-red-400 font-bold">Focus</span>.
          </p>
          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-misty/80 hover:bg-misty text-dark-base font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-50 shadow-md"
          >
            <Sparkles size={16} />
            {generating ? 'Generating...' : 'Generate Flashcards'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
