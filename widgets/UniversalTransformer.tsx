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
    } catch (_e) {
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
    } catch (_e) {
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
        return '...';
    }
  };

  const unitResult = calculateConversion(unitValue, unitFrom);

  const handleUnitCopy = () => {
    navigator.clipboard.writeText(unitResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileLoad = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileLoad(file);
    const text = e.dataTransfer.getData('text/plain');
    if (text) setInputText(text);
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Tabs */}
      <div className="flex bg-slate-900 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('json-csv')}
          className={`flex-1 py-1 text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'json-csv'
              ? 'bg-indigo-700 text-white'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <FileJson size={12} /> JSON ↔ CSV
        </button>
        <button
          onClick={() => setActiveTab('unit')}
          className={`flex-1 py-1 text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'unit'
              ? 'bg-indigo-700 text-white'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <ArrowRightLeft size={12} /> Units
        </button>
      </div>

      {activeTab === 'json-csv' ? (
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <div
            className={`flex-1 flex flex-col gap-2 relative rounded transition-all ${
              isDragOver ? 'ring-2 ring-indigo-500' : ''
            }`}
            onDragOver={e => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Paste JSON or CSV here, or drop a file..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 resize-none focus:outline-none focus:border-indigo-500"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.txt"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleFileLoad(f);
              }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={convertToCSV}
              className="flex-1 py-1.5 bg-indigo-900/50 hover:bg-indigo-800 border border-indigo-700 rounded text-xs font-bold text-indigo-200 transition-colors"
            >
              → CSV
            </button>
            <button
              onClick={convertToJSON}
              className="flex-1 py-1.5 bg-indigo-900/50 hover:bg-indigo-800 border border-indigo-700 rounded text-xs font-bold text-indigo-200 transition-colors"
            >
              → JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-400 hover:text-white transition-colors"
              title="Upload file"
            >
              <Upload size={14} />
            </button>
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-400 hover:text-white transition-colors disabled:opacity-40"
              title="Copy output"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>

          <textarea
            value={outputText}
            readOnly
            placeholder="Output appears here..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-emerald-300 resize-none focus:outline-none"
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center gap-3">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-2">
              Value
            </label>
            <input
              type="number"
              value={unitValue}
              onChange={e => setUnitValue(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-lg font-mono text-white outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={unitFrom}
            onChange={e => setUnitFrom(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs p-2 rounded outline-none border border-slate-700"
          >
            <optgroup label="Length / CSS">
              <option value="px">Pixels → Rem</option>
              <option value="rem">Rem → Pixels</option>
              <option value="m">Meters → Feet</option>
              <option value="ft">Feet → Meters</option>
            </optgroup>
            <optgroup label="Temperature">
              <option value="c">Celsius → Fahrenheit</option>
              <option value="f">Fahrenheit → Celsius</option>
            </optgroup>
            <optgroup label="Time">
              <option value="epoch">Unix Epoch → Date</option>
            </optgroup>
            <optgroup label="Mass">
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
