import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Radio, Signal, Disc, Volume2, Mic, MicOff, Activity } from 'lucide-react';

type StationType = 'soundcloud' | 'suno';
type Station = { name: string; url: string; type: StationType; audioUrl?: string };

const STATIONS: Station[] = [
  {
    name: 'Jon Arve Sets',
    url: 'https://soundcloud.com/jon_arve/sets',
    type: 'soundcloud',
  },
  {
    name: '⚡ Omni-Grid Theme (Suno AI)',
    url: 'https://suno.com/song/652af4a0-378e-4967-a762-09b9ed7ac9fb',
    type: 'suno',
    audioUrl: 'https://cdn1.suno.ai/652af4a0-378e-4967-a762-09b9ed7ac9fb.mp3',
  },
];

export const SignalRadio: React.FC = () => {
  const [currentStation, setCurrentStation] = useState<Station>(STATIONS[0]);
  const [micActive, setMicActive] = useState(false);
  const [sunoPlaying, setSunoPlaying] = useState(false);
  const sunoAudioRef = useRef<HTMLAudioElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Memoize random heights to avoid calling Math.random during render
  const visualizerHeights = useMemo(
    () => Array.from({ length: 20 }, () => 20 + Math.random() * 30),
     
    []
  );

  // Construct iframe src (only for SoundCloud stations)
  const soundcloudSrc = `https://w.soundcloud.com/player/?url=${encodeURIComponent(currentStation.url)}&color=%2306b6d4&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;

  const toggleVisualizer = async () => {
    if (micActive) {
      // Stop
      if (audioContextRef.current) audioContextRef.current.close();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setMicActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioContextRef.current;

      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      sourceRef.current = ctx.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      setMicActive(true);
      draw();
    } catch (e) {
      console.error('Microphone access denied for visualizer', e);
      alert('Microphone access needed for visualizer to sync with audio.');
    }
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barCount = 30; // Number of bars to display
    const barWidth = canvas.width / barCount;

    for (let i = 0; i < barCount; i++) {
      // Map bar index to frequency index (focusing on low-mids for better visuals)
      const dataIndex = Math.floor(i * (bufferLength / (barCount * 1.5)));
      const value = dataArray[dataIndex];

      const percent = value / 255;
      const barHeight = percent * canvas.height;

      // Cyberpunk Gradient
      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, '#22d3ee'); // Cyan-400
      gradient.addColorStop(1, '#0891b2'); // Cyan-600

      ctx.fillStyle = gradient;

      // Draw bar
      ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);

      // Draw "peak" cap
      if (value > 10) {
        ctx.fillStyle = '#ec4899'; // Pink-500
        ctx.fillRect(i * barWidth, canvas.height - barHeight - 2, barWidth - 2, 2);
      }
    }

    animationFrameRef.current = requestAnimationFrame(draw);
  };

  // Cleanup
  useEffect(() => {
    const sunoAudio = sunoAudioRef.current;
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (sunoAudio) sunoAudio.pause();
    };
  }, []);

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Visualizer Header */}
      <div className="relative h-20 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center group">
        <canvas
          ref={canvasRef}
          width={300}
          height={80}
          className="absolute inset-0 w-full h-full opacity-80"
        />

        {!micActive && (
          <div className="absolute inset-0 flex items-end justify-center gap-[2px] opacity-20 px-4 pb-2">
            {/* Idle Animation Placeholder */}
            {visualizerHeights.map((height, i) => (
              <div
                key={i}
                className="w-1.5 bg-cyan-900 animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '2s',
                }}
              ></div>
            ))}
          </div>
        )}

        <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
          <div
            className={`w-2 h-2 rounded-full ${micActive ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}
          ></div>
          <span className="text-[10px] font-mono text-slate-400">
            VISUALIZER: {micActive ? 'ACTIVE (MIC)' : 'STANDBY'}
          </span>
        </div>

        <div className="absolute top-2 right-2 z-20">
          <button
            onClick={toggleVisualizer}
            className={`p-1.5 rounded-full transition-colors border ${micActive ? 'bg-cyan-900/80 text-cyan-400 border-cyan-500/50' : 'bg-slate-900/80 text-slate-500 border-slate-700 hover:text-cyan-400'}`}
            title={micActive ? 'Stop Visualizer' : 'Start Visualizer (Uses Mic)'}
          >
            {micActive ? <Mic size={12} /> : <MicOff size={12} />}
          </button>
        </div>

        {!micActive && (
          <div className="z-10 flex flex-col items-center justify-center text-slate-500 gap-1 pointer-events-none">
            <Activity size={24} className="opacity-50" />
            <span className="text-[10px] uppercase tracking-widest opacity-50">
              Enable Mic for FX
            </span>
          </div>
        )}
      </div>

      {/* Station Selector (Single Item now, but kept structure for consistency/future expansion) */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
          <Radio size={10} /> Tuned Frequency
        </label>
        <select
          value={currentStation.name}
          onChange={e => {
            const s = STATIONS.find(st => st.name === e.target.value);
            if (s) {
              // Stop Suno audio when switching away
              if (sunoAudioRef.current) {
                sunoAudioRef.current.pause();
                setSunoPlaying(false);
              }
              setCurrentStation(s);
            }
          }}
          className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
        >
          {STATIONS.map(s => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Player Embed */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden border border-slate-800 relative">
        {currentStation.type === 'soundcloud' ? (
          <iframe
            width="100%"
            height="100%"
            scrolling="no"
            frameBorder="no"
            allow="autoplay; microphone"
            src={soundcloudSrc}
            className="absolute inset-0"
            title="Signal Radio Player"
          />
        ) : (
          /* Suno AI station — native audio player */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 bg-gradient-to-br from-slate-950 via-fuchsia-950/20 to-slate-950">
            <div className="text-center">
              <div className="text-xs font-bold text-fuchsia-300 mb-1">⚡ Suno AI Track</div>
              <div className="text-[10px] text-slate-400">Omni-Grid 2.0 — Official Theme</div>
            </div>
            <button
              onClick={() => {
                const audio = sunoAudioRef.current;
                if (!audio) return;
                if (sunoPlaying) {
                  audio.pause();
                  setSunoPlaying(false);
                } else {
                  audio.play().then(() => setSunoPlaying(true)).catch(() => setSunoPlaying(false));
                }
              }}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-fuchsia-700 hover:bg-fuchsia-600 text-white border border-fuchsia-500 shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all"
              aria-label={sunoPlaying ? 'Pause Suno track' : 'Play Suno track'}
            >
              {sunoPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              )}
            </button>
            {sunoPlaying && (
              <div className="flex gap-[3px] items-end h-6">
                {[4, 7, 5, 9, 6, 8, 4].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-fuchsia-400 rounded-sm animate-pulse"
                    style={{ height: `${h * 2}px`, animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}
            <a
              href={currentStation.url}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-slate-600 hover:text-fuchsia-400 transition-colors"
            >
              Open on Suno.com ↗
            </a>
            <audio
              ref={sunoAudioRef}
              src={currentStation.audioUrl}
              onEnded={() => setSunoPlaying(false)}
            />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] text-slate-600 px-1">
        <div className="flex items-center gap-1">
          <Disc size={10} className={micActive || sunoPlaying ? 'animate-spin' : ''} />
          <span>{currentStation.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Volume2 size={10} />
          <span>{currentStation.type === 'suno' ? 'Suno AI' : 'SoundCloud Embed'}</span>
        </div>
      </div>
    </div>
  );
};
