import { create } from 'zustand';

const TRACKS = {
  lofi:       'https://upload.wikimedia.org/wikipedia/commons/4/4b/Lofi_Beat_Loop.ogg',
  whitenoise: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Waves_on_a_gravel_beach.ogg',
  rain:       'https://upload.wikimedia.org/wikipedia/commons/4/44/Rain_on_roof_of_car.ogg',
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
