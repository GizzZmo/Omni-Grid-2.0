
import React, { useState, useEffect, useRef } from 'react';
import { Radio, Signal, Disc, Volume2, Mic, MicOff, Activity } from 'lucide-react';

const STATIONS = [
  { name: 'Jon Arve Sets', url: 'https://soundcloud.com/jon_arve/sets' }
];

export const SignalRadio: React.FC = () => {
  const [currentStation, setCurrentStation] = useState(STATIONS[0]);
  const [micActive, setMicActive] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Construct iframe src
  const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(currentStation.url)}&color=%2306b6d4&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;

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
      console.error("Microphone access denied for visualizer", e);
      alert("Microphone access needed for visualizer to sync with audio.");
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
    return () => {
       if (audioContextRef.current) audioContextRef.current.close();
       if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
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
                {[...Array(30)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-cyan-900 animate-pulse"
                      style={{ 
                          height: `${20 + Math.random() * 30}%`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '2s'
                      }}
                    ></div>
                ))}
             </div>
         )}
         
         <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
             <div className={`w-2 h-2 rounded-full ${micActive ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
             <span className="text-[10px] font-mono text-slate-400">
                VISUALIZER: {micActive ? 'ACTIVE (MIC)' : 'STANDBY'}
             </span>
         </div>

         <div className="absolute top-2 right-2 z-20">
             <button 
               onClick={toggleVisualizer}
               className={`p-1.5 rounded-full transition-colors border ${micActive ? 'bg-cyan-900/80 text-cyan-400 border-cyan-500/50' : 'bg-slate-900/80 text-slate-500 border-slate-700 hover:text-cyan-400'}`}
               title={micActive ? "Stop Visualizer" : "Start Visualizer (Uses Mic)"}
             >
                 {micActive ? <Mic size={12} /> : <MicOff size={12} />}
             </button>
         </div>
         
         {!micActive && (
            <div className="z-10 flex flex-col items-center justify-center text-slate-500 gap-1 pointer-events-none">
                <Activity size={24} className="opacity-50" />
                <span className="text-[10px] uppercase tracking-widest opacity-50">Enable Mic for FX</span>
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
            onChange={(e) => {
                const s = STATIONS.find(st => st.name === e.target.value);
                if (s) setCurrentStation(s);
            }}
            className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
         >
            {STATIONS.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
            ))}
         </select>
      </div>

      {/* Player Embed */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden border border-slate-800 relative">
          <iframe
            width="100%"
            height="100%"
            scrolling="no"
            frameBorder="no"
            allow="autoplay; microphone"
            src={src}
            className="absolute inset-0"
            title="Signal Radio Player"
          ></iframe>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] text-slate-600 px-1">
         <div className="flex items-center gap-1">
             <Disc size={10} className={micActive ? 'animate-spin' : ''} />
             <span>{currentStation.name}</span>
         </div>
         <div className="flex items-center gap-1">
             <Volume2 size={10} />
             <span>SoundCloud Embed</span>
         </div>
      </div>
    </div>
  );
};
