import React, { useState, useRef } from 'react';
import { Music2, ExternalLink, Play, Pause, Volume2, Radio } from 'lucide-react';

const SONG_ID = '652af4a0-378e-4967-a762-09b9ed7ac9fb';
const SONG_URL = `https://suno.com/song/${SONG_ID}`;
const AUDIO_URL = `https://cdn1.suno.ai/${SONG_ID}.mp3`;
const COVER_URL = `https://cdn2.suno.ai/image_${SONG_ID}.jpeg`;

const SONG_META = {
  title: 'Omni-Grid 2.0 — Official Theme',
  artist: 'Omni-Grid AI (Suno)',
  tags: ['cyberpunk', 'synthwave', 'AI-generated'],
};

export const SunoPlayer: React.FC = () => {
  const [activeView, setActiveView] = useState<'PLAYER' | 'EMBED'>('PLAYER');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [coverError, setCoverError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => setPlaying(false);

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const handleSeek = (t: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = t;
      setCurrentTime(t);
    }
  };

  const formatTime = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Tab Bar */}
      <div className="flex bg-slate-900 p-1 rounded-lg shrink-0">
        <button
          onClick={() => setActiveView('PLAYER')}
          className={`flex-1 py-1 text-xs font-bold rounded transition-colors flex items-center justify-center gap-1 ${activeView === 'PLAYER' ? 'bg-fuchsia-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Music2 size={11} /> Player
        </button>
        <button
          onClick={() => setActiveView('EMBED')}
          className={`flex-1 py-1 text-xs font-bold rounded transition-colors flex items-center justify-center gap-1 ${activeView === 'EMBED' ? 'bg-fuchsia-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Radio size={11} /> Suno Embed
        </button>
      </div>

      {activeView === 'PLAYER' ? (
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {/* Cover Art */}
          <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0 aspect-square max-h-48 mx-auto w-full flex items-center justify-center">
            {!coverError ? (
              <img
                src={COVER_URL}
                alt={SONG_META.title}
                className="w-full h-full object-cover"
                onError={() => setCoverError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-fuchsia-950 to-slate-900">
                <Music2 size={48} className="text-fuchsia-500 opacity-50" />
              </div>
            )}
            {/* Playing pulse overlay */}
            {playing && (
              <div className="absolute inset-0 bg-fuchsia-500/5 animate-pulse pointer-events-none" />
            )}
          </div>

          {/* Song Info */}
          <div className="text-center shrink-0">
            <div className="text-sm font-bold text-slate-100 truncate px-2">{SONG_META.title}</div>
            <div className="text-xs text-fuchsia-400 mt-0.5">{SONG_META.artist}</div>
            <div className="flex gap-1 justify-center mt-1 flex-wrap">
              {SONG_META.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[9px] bg-fuchsia-900/30 text-fuchsia-400 border border-fuchsia-800/50 px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Seek Bar */}
          <div className="flex items-center gap-2 shrink-0 px-1">
            <span className="text-[10px] text-slate-500 w-8 text-right font-mono">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={e => handleSeek(Number(e.target.value))}
              aria-label="Seek"
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
            />
            <span className="text-[10px] text-slate-500 w-8 font-mono">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 shrink-0 justify-center">
            <button
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Play'}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-fuchsia-700 hover:bg-fuchsia-600 text-white border border-fuchsia-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
            >
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 shrink-0 px-1">
            <Volume2 size={12} className="text-slate-500 shrink-0" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={e => handleVolumeChange(Number(e.target.value))}
              aria-label="Volume"
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
            />
            <span className="text-[10px] text-slate-500 w-8 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Open on Suno */}
          <a
            href={SONG_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 hover:text-fuchsia-400 transition-colors shrink-0"
          >
            <ExternalLink size={10} /> Open on Suno.com
          </a>

          <audio
            ref={audioRef}
            src={AUDIO_URL}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <div className="flex-1 bg-black rounded-lg overflow-hidden border border-slate-800 relative">
            <iframe
              src={SONG_URL}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay"
              className="absolute inset-0"
              title="Suno Song Embed"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
          <a
            href={SONG_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 hover:text-fuchsia-400 transition-colors shrink-0"
          >
            <ExternalLink size={10} /> Open on Suno.com
          </a>
        </div>
      )}
    </div>
  );
};
