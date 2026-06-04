import { create } from 'zustand';

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
const BREAK_DURATION = 5 * 60;  // 5 minutes in seconds

let intervalId = null;

const useTimerStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────
  timeLeft:       FOCUS_DURATION,
  isRunning:      false,
  isBreak:        false,
  focusDuration:  FOCUS_DURATION,
  breakDuration:  BREAK_DURATION,

  // ── Actions ────────────────────────────────────────────

  /**
   * Advance the timer by 1 second.
   * Called every second by the interval — lives inside the store
   * so it persists across page navigation.
   */
  tick: () => {
    const { timeLeft, isBreak, breakDuration, focusDuration } = get();

    if (timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 });
      return;
    }

    // Timer hit 0 — toggle between focus and break
    if (!isBreak) {
      // Focus ended → start break
      set({ isBreak: true, timeLeft: breakDuration, isRunning: true });

      // Web Notification for break start
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🌿 Break Time!', {
          body: 'Your focus session ended. Take a well-deserved rest.',
          icon: '/favicon.ico',
        });
      }
    } else {
      // Break ended → start new focus session
      set({ isBreak: false, timeLeft: focusDuration, isRunning: true });

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('📚 Focus Time!', {
          body: 'Break over. Time to get back to studying!',
          icon: '/favicon.ico',
        });
      }
    }
  },

  /**
   * Start the timer interval. Interval lives in module scope
   * (not React state) so it survives navigation.
   */
  startTimer: () => {
    if (intervalId) return; // already running

    // Request notification permission on first start
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    set({ isRunning: true });
    intervalId = setInterval(() => {
      get().tick();
    }, 1000);
  },

  pauseTimer: () => {
    clearInterval(intervalId);
    intervalId = null;
    set({ isRunning: false });
  },

  resetTimer: () => {
    clearInterval(intervalId);
    intervalId = null;
    set({
      timeLeft:  get().focusDuration,
      isRunning: false,
      isBreak:   false,
    });
  },

  setFocusDuration: (minutes) => {
    const secs = minutes * 60;
    set({ focusDuration: secs, timeLeft: secs, isBreak: false });
  },

  setBreakDuration: (minutes) => {
    set({ breakDuration: minutes * 60 });
  },
}));

export default useTimerStore;
