import { create } from 'zustand';

const TRACKS = {
  lofi:       'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  whitenoise: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg',
  rain:       'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
};

// Audio object lives in module scope — survives page navigation
let audioElement = null;

const initAudio = (track, volume) => {
  if (audioElement) {
    audioElement.pause();
    audioElement.src = '';
  }
  audioElement = new Audio(TRACKS[track]);
  audioElement.loop = true;
  audioElement.volume = volume;
  return audioElement;
};

const useAudioStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────
  isPlaying:    false,
  currentTrack: 'lofi',
  volume:       0.5,

  // ── Actions ────────────────────────────────────────────

  play: () => {
    const { currentTrack, volume } = get();

    if (!audioElement) {
      initAudio(currentTrack, volume);
    }

    audioElement.play().catch((err) => {
      console.warn('[AudioStore] Autoplay blocked:', err);
    });
    set({ isPlaying: true });
  },

  pause: () => {
    if (audioElement) {
      audioElement.pause();
    }
    set({ isPlaying: false });
  },

  setTrack: (track) => {
    if (!TRACKS[track]) return;

    const { volume, isPlaying } = get();
    initAudio(track, volume);

    if (isPlaying) {
      audioElement.play().catch(console.warn);
    }

    set({ currentTrack: track });
  },

  setVolume: (vol) => {
    const clamped = Math.max(0, Math.min(1, vol));
    if (audioElement) {
      audioElement.volume = clamped;
    }
    set({ volume: clamped });
  },
}));

export default useAudioStore;
