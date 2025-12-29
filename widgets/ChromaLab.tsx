import React, { useState, useEffect } from 'react';
import { Palette, Copy, Check, Pipette } from 'lucide-react';

export const ChromaLab: React.FC = () => {
  const [hex, setHex] = useState('#6366f1');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Simple lighten/darken logic for demo purposes
  // Real implementation would use HSL conversion
  const generateShades = (baseHex: string) => {
    // This is a simplified visual generator
    return [
      { w: '50', op: 0.1 },
      { w: '100', op: 0.2 },
      { w: '200', op: 0.3 },
      { w: '300', op: 0.4 },
      { w: '400', op: 0.6 },
      { w: '500', op: 1 }, // Base
      { w: '600', op: 0.9, blend: 'black' },
      { w: '700', op: 0.7, blend: 'black' },
      { w: '800', op: 0.5, blend: 'black' },
      { w: '900', op: 0.3, blend: 'black' },
    ];
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 h-10 rounded-lg overflow-hidden border border-slate-700 group">
          <input
            type="color"
            value={hex}
            onChange={e => setHex(e.target.value)}
            className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] cursor-pointer p-0 border-0"
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/10 group-hover:bg-transparent text-white font-mono font-bold shadow-sm">
            {hex.toUpperCase()}
          </div>
        </div>
        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
          <Pipette size={20} className="text-slate-400" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1">
        {generateShades(hex).map((shade, idx) => (
          <div
            key={idx}
            onClick={() => copyToClipboard(`bg-${hex}`, idx)} // In real app, calculate real hex
            className="flex items-center justify-between p-2 rounded cursor-pointer hover:scale-[1.02] transition-transform group"
            style={{
              backgroundColor: shade.blend === 'black' ? '#000' : hex,
              opacity: shade.blend === 'black' ? 1 : shade.op,
            }}
          >
            <div className="flex items-center gap-3">
              {/* Visual trick for the demo to show shades without complex math lib */}
              <div
                className="w-4 h-4 rounded border border-white/20"
                style={{
                  backgroundColor: hex,
                  opacity: shade.blend === 'black' ? shade.op : 1,
                }}
              ></div>
              <span
                className={`text-[10px] font-mono font-bold ${shade.w === '500' ? 'text-white underline' : 'text-white/80'}`}
              >
                {shade.w}
              </span>
            </div>
            {copiedIndex === idx ? (
              <Check size={12} className="text-white" />
            ) : (
              <Copy size={12} className="text-white/0 group-hover:text-white/70" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
