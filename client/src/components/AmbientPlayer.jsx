import useAudioStore from '../store/useAudioStore';
import { Music, Waves, CloudRain, VolumeX, Volume1, Volume2, Play, Pause } from 'lucide-react';

const TRACKS = [
  { id: 'lofi',       label: 'Lo-Fi',        icon: <Music size={14} /> },
  { id: 'whitenoise', label: 'Ocean Waves',  icon: <Waves size={14} /> },
  { id: 'rain',       label: 'Rain',         icon: <CloudRain size={14} /> },
];

const AmbientPlayer = ({ isCollapsed }) => {
  const { isPlaying, currentTrack, volume, play, pause, setTrack, setVolume } = useAudioStore();

  const toggle = () => (isPlaying ? pause() : play());

  return (
    <div
      id="ambient-player"
      className={`
        fixed bottom-0 right-0 z-20 h-14 flex items-center gap-4 px-4
        glass-card border-t border-white/20
        transition-all duration-300
        ${isCollapsed ? 'left-0 lg:left-16' : 'left-0 lg:left-64'}
      `}
    >
      {/* Play/Pause */}
      <button
        id="btn-audio-play-pause"
        onClick={toggle}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-lavender/20 hover:bg-lavender/30 transition-colors shrink-0 text-lavender-deep"
        aria-label={isPlaying ? 'Pause ambient audio' : 'Play ambient audio'}
      >
        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
      </button>

      {/* Track switcher */}
      <div className="flex gap-1">
        {TRACKS.map((t) => (
          <button
            key={t.id}
            id={`btn-track-${t.id}`}
            onClick={() => setTrack(t.id)}
            title={t.label}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
              transition-all duration-200
              ${currentTrack === t.id
                ? 'bg-lavender/30 text-lavender-deep ring-1 ring-lavender/50'
                : 'text-dark-muted hover:bg-white/10'
              }
            `}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Volume slider */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-dark-muted shrink-0 flex items-center justify-center w-5">
          {volume === 0 ? <VolumeX size={16} /> : volume < 0.5 ? <Volume1 size={16} /> : <Volume2 size={16} />}
        </span>
        <input
          id="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-20 accent-lavender"
          aria-label="Volume"
        />
      </div>

      {/* Now playing indicator */}
      {isPlaying && (
        <div className="flex gap-0.5 items-end h-4 shrink-0" aria-label="Playing">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-0.5 bg-sage rounded-full animate-bounce"
              style={{ height: `${40 + i * 20}%`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AmbientPlayer;
