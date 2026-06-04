export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good Morning', emoji: '☀️' };
  if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
  if (hour >= 17 && hour < 21) return { text: 'Good Evening', emoji: '🌅' };
  return { text: 'Good Night', emoji: '🌙' };
};

export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};
