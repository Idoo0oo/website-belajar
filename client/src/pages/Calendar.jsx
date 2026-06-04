import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Inbox } from 'lucide-react';
import api from '../hooks/useApi';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS = ['bg-lavender/30', 'bg-sage/30', 'bg-misty/30', 'bg-yellow-200/30', 'bg-orange-200/30'];

const Calendar = () => {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({ title: '', remind_at: '' });
  const [loading, setLoading] = useState(false);

  const fetchReminders = () => {
    api.get('/reminders').then((res) => setReminders(res.data.reminders)).catch(console.error);
  };

  useEffect(() => { fetchReminders(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title || !form.remind_at) return;
    setLoading(true);
    try {
      await api.post('/reminders', form);
      setForm({ title: '', remind_at: '' });
      fetchReminders();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/reminders/${id}`);
    fetchReminders();
  };

  // Group reminders by date
  const grouped = reminders.reduce((acc, r) => {
    const date = r.remind_at.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Add reminder form */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-dark-surface dark:text-white mb-4 flex items-center gap-2">
          <CalendarIcon size={16} /> Schedule a Study Session
        </h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            id="reminder-title"
            type="text"
            placeholder="Subject or topic..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-dark-surface dark:text-white placeholder:text-dark-muted text-sm focus:outline-none focus:ring-2 focus:ring-lavender/50"
          />
          <input
            id="reminder-datetime"
            type="datetime-local"
            value={form.remind_at}
            onChange={(e) => setForm({ ...form, remind_at: e.target.value })}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-dark-surface dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-lavender/50"
          />
          <button
            id="btn-add-reminder"
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-lavender/70 hover:bg-lavender text-dark-base font-semibold text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </div>

      {/* Schedule view */}
      {Object.keys(grouped).sort().length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-dark-muted flex flex-col items-center">
          <Inbox size={48} className="mb-4 text-dark-muted/50" />
          <p className="text-sm">No study sessions scheduled yet.</p>
          <p className="text-xs mt-1">Add sessions above to build your schedule.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, items], idx) => {
            const d = new Date(date + 'T00:00:00');
            const dayName = DAYS[d.getDay()];
            return (
              <div key={date} className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${COLORS[idx % COLORS.length]} flex flex-col items-center justify-center`}>
                    <span className="text-xs font-bold text-dark-surface dark:text-white leading-none">{dayName}</span>
                    <span className="text-sm font-bold text-dark-surface dark:text-white">{d.getDate()}</span>
                  </div>
                  <p className="text-sm font-semibold text-dark-surface dark:text-white">
                    {d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="space-y-2 ml-13">
                  {items.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 py-1">
                      <span className="text-xs text-dark-muted shrink-0">
                        {new Date(r.remind_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-sm text-dark-surface dark:text-white flex-1">{r.title}</span>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-xs text-dark-muted hover:text-red-400 transition-colors"
                        aria-label="Delete reminder"
                      >✕</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Calendar;
