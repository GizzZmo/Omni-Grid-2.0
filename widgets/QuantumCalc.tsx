import React, { useState } from 'react';
import { Delete, Eraser, Calculator } from 'lucide-react';

export const QuantumCalc: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handlePress = (val: string) => {
    if (display === '0' && val !== '.') {
      setDisplay(val);
    } else if (display === 'Error') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const calculate = () => {
    try {
      // Pre-process for scientific functions
      let expr = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(');

      // Security: Replace non-math chars (allowing standard math functions)
      const sanitized = expr.replace(/[^0-9+\-*/.()MathPIE,_**]/g, '');

      const result = eval(sanitized);

      // Format result
      const resultStr = Number.isInteger(result)
        ? String(result)
        : String(parseFloat(result.toFixed(8)));
      setDisplay(resultStr);
      setLastResult(resultStr);
    } catch (e) {
      setDisplay('Error');
      setTimeout(() => setDisplay('0'), 1500);
    }
  };

  const clear = () => setDisplay('0');

  const backspace = () => {
    if (display.length > 1 && display !== 'Error') {
      // Handle removing function names completely if possible, or just char by char
      // Simple char by char is safer for now
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const addFunc = (func: string) => {
    if (display === '0') setDisplay(func + '(');
    else setDisplay(display + func + '(');
  };

  const btnClass =
    'bg-slate-800 hover:bg-slate-700 text-slate-200 rounded p-1.5 text-xs font-bold active:scale-95 transition-transform shadow-sm border border-white/5';
  const opClass =
    'bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-200 rounded p-1.5 text-xs font-bold active:scale-95 transition-transform border border-cyan-800/50';
  const sciClass =
    'bg-fuchsia-900/30 hover:bg-fuchsia-800/50 text-fuchsia-300 rounded p-1.5 text-[10px] font-bold active:scale-95 transition-transform border border-fuchsia-800/30';

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="bg-slate-950 border border-slate-800 rounded p-3 flex flex-col justify-end items-end font-mono overflow-hidden h-20 relative">
        {lastResult && (
          <div className="text-[10px] text-slate-600 absolute top-2 right-2">Ans: {lastResult}</div>
        )}
        <div className="text-xl text-cyan-400 break-all text-right w-full custom-scrollbar overflow-x-auto whitespace-nowrap">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 flex-1">
        {/* Scientific Row 1 */}
        <button onClick={() => addFunc('sin')} className={sciClass}>
          sin
        </button>
        <button onClick={() => addFunc('cos')} className={sciClass}>
          cos
        </button>
        <button onClick={() => addFunc('tan')} className={sciClass}>
          tan
        </button>
        <button onClick={() => handlePress('π')} className={sciClass}>
          π
        </button>

        {/* Scientific Row 2 */}
        <button onClick={() => addFunc('log')} className={sciClass}>
          log
        </button>
        <button onClick={() => addFunc('ln')} className={sciClass}>
          ln
        </button>
        <button onClick={() => addFunc('sqrt')} className={sciClass}>
          √
        </button>
        <button onClick={() => handlePress('^')} className={sciClass}>
          ^
        </button>

        {/* Scientific Row 3 */}
        <button onClick={() => handlePress('(')} className={sciClass}>
          (
        </button>
        <button onClick={() => handlePress(')')} className={sciClass}>
          )
        </button>
        <button onClick={() => handlePress('e')} className={sciClass}>
          e
        </button>
        <button
          onClick={clear}
          className="bg-red-900/30 text-red-300 rounded p-1.5 font-bold hover:bg-red-900/50 text-xs"
        >
          AC
        </button>

        {/* Numpad & Ops */}
        <button onClick={() => handlePress('7')} className={btnClass}>
          7
        </button>
        <button onClick={() => handlePress('8')} className={btnClass}>
          8
        </button>
        <button onClick={() => handlePress('9')} className={btnClass}>
          9
        </button>
        <button onClick={() => handlePress('÷')} className={opClass}>
          ÷
        </button>

        <button onClick={() => handlePress('4')} className={btnClass}>
          4
        </button>
        <button onClick={() => handlePress('5')} className={btnClass}>
          5
        </button>
        <button onClick={() => handlePress('6')} className={btnClass}>
          6
        </button>
        <button onClick={() => handlePress('×')} className={opClass}>
          ×
        </button>

        <button onClick={() => handlePress('1')} className={btnClass}>
          1
        </button>
        <button onClick={() => handlePress('2')} className={btnClass}>
          2
        </button>
        <button onClick={() => handlePress('3')} className={btnClass}>
          3
        </button>
        <button onClick={() => handlePress('-')} className={opClass}>
          -
        </button>

        <button onClick={() => handlePress('0')} className={btnClass}>
          0
        </button>
        <button onClick={() => handlePress('.')} className={btnClass}>
          .
        </button>
        <button onClick={backspace} className={btnClass}>
          <Delete size={12} />
        </button>
        <button onClick={() => handlePress('+')} className={opClass}>
          +
        </button>

        <button
          onClick={calculate}
          className="col-span-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded p-2 font-bold flex items-center justify-center shadow-lg shadow-emerald-900/50 mt-1"
        >
          =
        </button>
      </div>
    </div>
  );
};
