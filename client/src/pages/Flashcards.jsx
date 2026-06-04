import { useState, useEffect } from 'react';
import { Inbox } from 'lucide-react';
import api from '../hooks/useApi';

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' or 'weak'
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({ material_id: '', question: '', answer: '' });
  const [loading, setLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  const fetchFlashcards = () => {
    const url = filter === 'weak' ? '/flashcards?filter=weak' : '/flashcards';
    api.get(url).then(res => setFlashcards(res.data.flashcards)).catch(console.error);
  };

  const fetchMaterials = () => {
    api.get('/materials').then(res => setMaterials(res.data.materials)).catch(console.error);
  };

  useEffect(() => {
    fetchFlashcards();
    fetchMaterials();
  }, [filter]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.material_id || !form.question || !form.answer) return;
    setLoading(true);
    try {
      await api.post('/flashcards', form);
      setForm({ ...form, question: '', answer: '' });
      fetchFlashcards();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/flashcards/${id}`);
    fetchFlashcards();
  };

  const toggleFlip = (id) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-card rounded-2xl p-4">
        <div>
          <h2 className="text-lg font-bold text-dark-surface dark:text-white">Active Recall</h2>
          <p className="text-xs text-dark-muted">Test your knowledge to strengthen memory.</p>
        </div>
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-lavender text-dark-base shadow-sm' : 'text-dark-muted hover:text-dark-surface dark:hover:text-white'}`}
          >
            All Cards
          </button>
          <button
            onClick={() => setFilter('weak')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'weak' ? 'bg-red-400 text-dark-base shadow-sm' : 'text-dark-muted hover:text-dark-surface dark:hover:text-white'}`}
          >
            Weak Areas Only
          </button>
        </div>
      </div>

      {/* Manual Creation Form */}
      <form onSubmit={handleAdd} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-1/4">
          <label className="block text-xs font-semibold text-dark-muted mb-1.5">Material</label>
          <select
            value={form.material_id}
            onChange={(e) => setForm({ ...form, material_id: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-lavender/50 text-dark-surface dark:text-white"
          >
            <option value="" disabled className="text-gray-500">Select material...</option>
            {materials.map(m => <option key={m.id} value={m.id} className="text-black">{m.title}</option>)}
          </select>
        </div>
        <div className="w-full md:w-1/3">
          <label className="block text-xs font-semibold text-dark-muted mb-1.5">Question</label>
          <input
            type="text"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-lavender/50 text-dark-surface dark:text-white placeholder:text-dark-muted/50"
            placeholder="e.g. What is Active Recall?"
          />
        </div>
        <div className="w-full md:w-1/3">
          <label className="block text-xs font-semibold text-dark-muted mb-1.5">Answer</label>
          <input
            type="text"
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-lavender/50 text-dark-surface dark:text-white placeholder:text-dark-muted/50"
            placeholder="e.g. Testing memory to strengthen retention."
          />
        </div>
        <div className="w-full md:w-auto md:self-end">
          <button type="submit" disabled={loading} className="w-full px-6 py-2 rounded-xl bg-lavender/80 hover:bg-lavender text-dark-base font-bold text-sm transition-all hover:scale-105 disabled:opacity-50">
            Add
          </button>
        </div>
      </form>

      {/* Cards Grid */}
      {flashcards.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-dark-muted flex flex-col items-center">
          <Inbox size={48} className="mb-4 text-dark-muted/50" />
          <p className="text-sm font-medium">No flashcards found.</p>
          <p className="text-xs mt-1 max-w-sm mx-auto">Create some manually, or use the Smart Viewer to auto-generate them from your tagged pages!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.map(card => {
            const isFlipped = flippedCards[card.id] || false;
            return (
              <div key={card.id} className="relative h-64 flashcard-scene group">
                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(card.id); }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-red-400/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-400/40"
                  title="Delete Flashcard"
                >
                  ✕
                </button>

                <div
                  className={`flashcard-card cursor-pointer ${isFlipped ? 'flipped' : ''}`}
                  onClick={() => toggleFlip(card.id)}
                >
                  {/* Front - Question */}
                  <div className="flashcard-face glass-card bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="absolute top-4 left-4 text-xs font-bold text-lavender-deep">Q.</span>
                    <p className="text-lg font-semibold text-center text-dark-surface dark:text-white">{card.question}</p>
                    <p className="absolute bottom-4 text-xs text-dark-muted font-medium">Click to reveal</p>
                  </div>

                  {/* Back - Answer */}
                  <div className="flashcard-face flashcard-back glass-card bg-lavender/10 border-lavender/30">
                    <span className="absolute top-4 left-4 text-xs font-bold text-lavender-deep">A.</span>
                    <p className="text-base text-center text-dark-surface dark:text-white px-2 overflow-y-auto max-h-full py-6 w-full">
                      {card.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Flashcards;
