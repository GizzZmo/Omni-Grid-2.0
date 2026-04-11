import React, { useState } from 'react';
import { Palette, Copy, Check, Pipette } from 'lucide-react';

// Convert hex to RGB components
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3 ? clean.replace(/./g, '$&$&') : clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Convert RGB [0,255] to HSL [0,360 / 0,100 / 0,100]
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Convert HSL to hex string
function hslToHex(h: number, s: number, l: number): string {
  const ln = l / 100, sn = s / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => Math.round(255 * (ln - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return `#${[f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

// Lightness targets for Tailwind-style shade scale
const SHADE_LIGHTNESS: Record<string, number> = {
  '50': 96, '100': 92, '200': 82, '300': 68,
  '400': 55, '500': 44, '600': 35, '700': 28, '800': 20, '900': 13,
};

function generateShades(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  const [h, s] = rgbToHsl(r, g, b);
  return Object.entries(SHADE_LIGHTNESS).map(([w, l]) => ({
    w,
    hex: hslToHex(h, s, l),
  }));
}

export const ChromaLab: React.FC = () => {
  const [hex, setHex] = useState('#6366f1');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const shades = generateShades(hex);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 h-10 rounded-lg overflow-hidden border border-slate-700 group">
          <input
            type="color"
            value={hex}
            onChange={e => setHex(e.target.value)}
            className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] cursor-pointer p-0 border-0"
          />
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center font-mono font-bold text-xs shadow-sm"
            style={{ color: l > 50 ? '#000' : '#fff' }}
          >
            {hex.toUpperCase()}
          </div>
        </div>
        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
          <Pipette size={20} className="text-slate-400" />
        </div>
      </div>

      <div className="text-[10px] text-slate-500 font-mono flex gap-3 px-1">
        <span>HSL({h}°, {s}%, {l}%)</span>
        <span>RGB({r}, {g}, {b})</span>
      </div>

      <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar pr-1">
        {shades.map(shade => (
          <div
            key={shade.w}
            onClick={() => copyToClipboard(shade.hex, shade.w)}
            className="flex items-center justify-between px-2 py-1.5 rounded cursor-pointer hover:scale-[1.02] transition-transform group"
            style={{ backgroundColor: shade.hex }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-mono font-bold"
                style={{ color: SHADE_LIGHTNESS[shade.w] > 50 ? '#000' : '#fff' }}
              >
                {shade.w}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-mono"
                style={{ color: SHADE_LIGHTNESS[shade.w] > 50 ? '#000000aa' : '#ffffffaa' }}
              >
                {shade.hex.toUpperCase()}
              </span>
              {copiedKey === shade.w ? (
                <Check size={10} style={{ color: SHADE_LIGHTNESS[shade.w] > 50 ? '#000' : '#fff' }} />
              ) : (
                <Copy
                  size={10}
                  className="opacity-0 group-hover:opacity-70 transition-opacity"
                  style={{ color: SHADE_LIGHTNESS[shade.w] > 50 ? '#000' : '#fff' }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 text-[9px] text-slate-600 justify-center">
        <Palette size={9} /> Click any swatch to copy hex
      </div>
    </div>
  );
};
