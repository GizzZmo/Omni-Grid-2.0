import React, { useState, useRef } from 'react';
import {
  FileJson,
  ArrowRightLeft,
  FileType,
  Check,
  Copy,
  GripHorizontal,
  Upload,
} from 'lucide-react';

export const UniversalTransformer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'json-csv' | 'unit'>('json-csv');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [unitValue, setUnitValue] = useState<number>(0);
  const [unitFrom, setUnitFrom] = useState('px');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // JSON <-> CSV Logic
  const convertToCSV = () => {
    try {
      const jsonData = JSON.parse(inputText);
      const array = Array.isArray(jsonData) ? jsonData : [jsonData];
      if (array.length === 0) {
        setOutputText('Empty Array');
        return;
      }
      const header = Object.keys(array[0]).join(',');
      const rows = array.map((obj: any) => Object.values(obj).join(',')).join('\n');
      setOutputText(`${header}\n${rows}`);
    } catch (e) {
      setOutputText('Invalid JSON');
    }
  };

  const convertToJSON = () => {
    try {
      const rows = inputText.trim().split('\n');
      const headers = rows[0].split(',');
      const json = rows.slice(1).map(row => {
        const values = row.split(',');
        return headers.reduce((obj: any, header, index) => {
          obj[header.trim()] = values[index]?.trim();
          return obj;
        }, {});
      });
      setOutputText(JSON.stringify(json, null, 2));
    } catch (e) {
      setOutputText('Invalid CSV');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Unit Conversion Logic
  const calculateConversion = (val: number, from: string) => {
    if (isNaN(val)) return '...';
    switch (from) {
      case 'px':
        return `${(val / 16).toFixed(3).replace(/\.000$/, '')}rem`;
      case 'rem':
        return `${(val * 16).toFixed(0)}px`;
      case 'epoch':
        return new Date(val * 1000).toLocaleString();
      case 'c':
        return `${((val * 9) / 5 + 32).toFixed(1)}°F`;
      case 'f':
        return `${(((val - 32) * 5) / 9).toFixed(1)}°C`;
      case 'm':
        return `${(val * 3.28084).toFixed(2)}ft`;
      case 'ft':
        return `${(val / 3.28084).toFixed(2)}m`;
      case 'kg':
        return `${(val * 2.20462).toFixed(2)}lb`;
      case 'lb':
        return `${(val / 2.20462).toFixed(2)}kg`;
      default:
        return '';
    }
  };

  const unitResult = calculateConversion(unitValue, unitFrom);

  const handleUnitCopy = () => {
    if (unitResult && unitResult !== '...') {
      navigator.clipboard.writeText(unitResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Drag and Drop Handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      readFile(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
    // Reset to allow selecting same file again
    e.target.value = '';
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = event => {
      if (event.target?.result) {
        setInputText(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Allows dragging the output text directly to another widget
    e.dataTransfer.setData('text/plain', outputText);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-900 rounded-lg">
        <button
          onClick={() => {
            setActiveTab('json-csv');
            setCopied(false);
          }}
          className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'json-csv' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          JSON / CSV
        </button>
        <button
          onClick={() => {
            setActiveTab('unit');
            setCopied(false);
          }}
          className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'unit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Units
        </button>
      </div>

      {activeTab === 'json-csv' ? (
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".json,.csv,.txt"
          />
          <div
            className={`flex-1 relative transition-all duration-200 ${isDragOver ? 'ring-2 ring-indigo-500 bg-slate-800' : ''}`}
            onDragOver={e => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
          >
            <textarea
              className="w-full h-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 resize-none focus:outline-none focus:border-indigo-500"
              placeholder="Paste JSON/CSV here, Drag & Drop, or use the Upload button..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
            />
            {isDragOver && (
              <div className="absolute inset-0 bg-indigo-900/20 flex items-center justify-center pointer-events-none">
                <div className="bg-slate-900 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl border border-indigo-500/50">
                  <Upload size={14} /> Drop File Here
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs text-indigo-400 font-medium flex items-center gap-1 border border-indigo-900/30"
              title="Upload file"
            >
              <Upload size={12} /> Upload
            </button>
            <button
              onClick={convertToCSV}
              className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs text-indigo-400 font-medium"
            >
              to CSV
            </button>
            <button
              onClick={convertToJSON}
              className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs text-indigo-400 font-medium"
            >
              to JSON
            </button>
          </div>

          <div className="flex-1 relative group">
            <div className="absolute top-0 right-0 left-0 h-1 cursor-ns-resize z-10"></div>
            <textarea
              readOnly
              draggable={!!outputText}
              onDragStart={handleDragStart}
              className={`w-full h-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-emerald-400 resize-none focus:outline-none cursor-grab active:cursor-grabbing ${outputText ? 'hover:border-emerald-500/50' : ''}`}
              placeholder="Output (Drag me to Scratchpad)..."
              value={outputText}
            />
            {outputText && (
              <>
                <div className="absolute top-2 left-2 p-1 bg-slate-800/80 rounded pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                  <GripHorizontal size={14} className="text-emerald-500" />
                </div>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 transition-colors z-20"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-2">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-[10px] uppercase text-slate-500 font-bold">Input</label>
              <input
                type="number"
                value={unitValue}
                onChange={e => setUnitValue(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <select
            value={unitFrom}
            onChange={e => setUnitFrom(e.target.value)}
            className="w-full bg-slate-800 text-slate-300 text-xs p-2 rounded outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <optgroup label="Web / Time">
              <option value="px">Pixels → REM (16px base)</option>
              <option value="rem">REM → Pixels</option>
              <option value="epoch">Epoch → Local Date</option>
            </optgroup>
            <optgroup label="Temperature">
              <option value="c">Celsius → Fahrenheit</option>
              <option value="f">Fahrenheit → Celsius</option>
            </optgroup>
            <optgroup label="Length">
              <option value="m">Meters → Feet</option>
              <option value="ft">Feet → Meters</option>
            </optgroup>
            <optgroup label="Weight">
              <option value="kg">Kilograms → Pounds</option>
              <option value="lb">Pounds → Kilograms</option>
            </optgroup>
          </select>

          <div className="flex items-center justify-center text-slate-600 my-1">
            <ArrowRightLeft size={16} />
          </div>

          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
              Result
            </label>
            <div className="text-xl text-emerald-400 font-mono font-bold truncate select-all">
              {unitResult}
            </div>
            {unitResult && unitResult !== '...' && (
              <button
                onClick={handleUnitCopy}
                className="absolute top-2 right-2 p-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
