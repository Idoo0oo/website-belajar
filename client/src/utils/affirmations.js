export const affirmations = [
  "You are doing better than you think. Keep going! 🌟",
  "Every page you study today is a step toward your goals. 📚",
  "Rest is productive. Your brain grows during breaks. 🧠",
  "Small consistent efforts beat cramming every time. 💪",
  "You've got this. One concept at a time. ✨",
  "Learning is not a race. Your pace is the right pace. 🐢",
  "Be proud of how far you've come. 🌈",
  "Difficult roads often lead to beautiful destinations. 🏔️",
  "Your effort today is an investment in tomorrow's success. 💡",
  "Don't compare your progress to others. Focus on your own journey. 🧭",
  "Understanding matters more than memorizing. Stay curious! 🔍",
  "A calm mind absorbs more than an anxious one. Breathe. 🌿",
  "Every expert was once a beginner. 🌱",
  "You're learning. That's already something to be proud of. 🎯",
  "Take breaks without guilt — rest is part of the process. ☕",
  "Your brain is literally building new connections right now. ⚡",
  "Progress, not perfection. 🌻",
  "You showed up today. That's half the battle. 🏆",
  "Hard topics become easy with enough gentle repetition. 🔄",
  "Study with curiosity, not fear. The material will come to you. 💫",
  "Great things take time — and so does mastering a subject. ⏳",
  "You are capable of understanding this. Trust the process. 🤝",
];

export const getRandomAffirmation = () =>
  affirmations[Math.floor(Math.random() * affirmations.length)];
