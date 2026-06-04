import useTimerStore from '../store/useTimerStore';
import { formatTime } from '../utils/greetings';

const TimerPill = () => {
  const { timeLeft, isRunning, isBreak, startTimer, pauseTimer } = useTimerStore();

  const display = formatTime(timeLeft);
  const label   = isBreak ? 'Break' : 'Focus';

  const pillColor = isBreak
    ? 'bg-sage/20 border-sage/40 text-sage-deep'
    : 'bg-lavender/20 border-lavender/40 text-lavender-deep';

  return (
    <button
      id="timer-pill"
      onClick={isRunning ? pauseTimer : startTimer}
      title={isRunning ? 'Pause timer' : 'Start timer'}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold
        transition-all duration-200 hover:scale-105 select-none cursor-pointer
        ${pillColor}
      `}
    >
      {/* Status dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isRunning
            ? isBreak ? 'bg-sage animate-pulse' : 'bg-lavender animate-pulse'
            : 'bg-current opacity-40'
        }`}
      />
      <span>{label}</span>
      <span className="font-mono tracking-tight">{display}</span>
    </button>
  );
};

export default TimerPill;
