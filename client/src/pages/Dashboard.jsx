import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Moon, Target, Flame } from 'lucide-react';
import { getGreeting, formatDate } from '../utils/greetings';
import { getRandomAffirmation } from '../utils/affirmations';
import api from '../hooks/useApi';

const Dashboard = () => {
  const [sessions, setSessions]     = useState([]);
  const [affirmation]               = useState(() => getRandomAffirmation());
  const greeting                    = getGreeting();
  const user                        = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/sessions/weekly')
      .then((res) => setSessions(res.data.sessions))
      .catch(console.error);
  }, []);

  const chartData = sessions.map((s) => ({
    date:  formatDate(s.date),
    Study: Math.round(s.study_minutes / 60 * 10) / 10,
    Rest:  Math.round(s.rest_minutes / 60 * 10) / 10,
  }));

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="glass-card rounded-2xl p-6">
        <p className="text-3xl font-bold text-dark-surface dark:text-white">
          {greeting.emoji} {greeting.text}, {user.name?.split(' ')[0] || 'Student'}!
        </p>
        <p className="mt-2 text-dark-muted text-sm italic">"{affirmation}"</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Study Hours (7d)', value: `${(sessions.reduce((a, s) => a + s.study_minutes, 0) / 60).toFixed(1)}h`, icon: <BookOpen size={24} className="text-misty-deep" /> },
          { label: 'Rest Hours (7d)',  value: `${(sessions.reduce((a, s) => a + s.rest_minutes, 0) / 60).toFixed(1)}h`,  icon: <Moon size={24} className="text-sage-deep" /> },
          { label: 'Sessions',         value: sessions.filter(s => s.study_minutes > 0).length, icon: <Target size={24} className="text-lavender-deep" /> },
          { label: 'Streak',           value: '—', icon: <Flame size={24} className="text-orange-400" /> },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4 flex flex-col gap-1">
            <div className="mb-1">{stat.icon}</div>
            <span className="text-xl font-bold text-dark-surface dark:text-white">{stat.value}</span>
            <span className="text-xs text-dark-muted">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-dark-surface dark:text-white mb-4">
          📊 Last 7 Days — Study vs Rest (hours)
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="gradStudy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#BAE6FD" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#BAE6FD" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="gradRest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#86EFAC" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#86EFAC" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(30,41,59,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.75rem',
                color: '#F1F5F9',
                fontSize: '12px',
              }}
            />
            <Area type="monotone" dataKey="Study" stroke="#7DD3FC" strokeWidth={2} fill="url(#gradStudy)" />
            <Area type="monotone" dataKey="Rest"  stroke="#4ADE80" strokeWidth={2} fill="url(#gradRest)"  />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
