import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, ArrowRightLeft, TrendingUp, Loader2 } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'BRL', 'MXN', 'ZAR'];

export const ValutaExchange: React.FC = () => {
  const [amount, setAmount] = useState<number>(1);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchRate = async () => {
    setLoading(true);
    try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
        const data = await res.json();
        if (data && data.rates) {
            setRate(data.rates[to]);
            setLastUpdated(new Date().toLocaleTimeString());
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, [from, to]);

  const handleSwap = () => {
      const temp = from;
      setFrom(to);
      setTo(temp);
  };

  return (
    <div className="h-full flex flex-col gap-4">
        {/* Converter Section */}
        <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] uppercase text-slate-500 font-bold">Amount</label>
                    <span className="text-[10px] text-slate-600 font-mono">{from}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">$</span>
                    <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent text-xl font-mono text-white outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <select 
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="flex-1 bg-slate-800 text-slate-200 text-xs p-2 rounded outline-none border border-slate-700"
                >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <button onClick={handleSwap} className="p-1.5 bg-slate-800 rounded-full hover:bg-slate-700 text-emerald-400 transition-colors">
                    <ArrowRightLeft size={14} />
                </button>

                <select 
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="flex-1 bg-slate-800 text-slate-200 text-xs p-2 rounded outline-none border border-slate-700"
                >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <DollarSign size={48} className="text-emerald-500" />
                </div>
                <div className="flex justify-between items-center mb-1">
                     <label className="text-[10px] uppercase text-slate-500 font-bold">Converted</label>
                     <span className="text-[10px] text-slate-600 font-mono">{to}</span>
                </div>
                <div className="text-2xl font-mono font-bold text-emerald-400 truncate">
                    {rate ? (amount * rate).toFixed(2) : '...'}
                </div>
                 <div className="text-[10px] text-slate-600 mt-1">
                    1 {from} = {rate?.toFixed(4)} {to}
                </div>
            </div>
        </div>

        {/* Footer Info */}
        <div className="flex justify-between items-center text-[10px] text-slate-600 bg-slate-900/50 p-1.5 rounded">
            <div className="flex items-center gap-1">
                <TrendingUp size={10} /> Market Rate
            </div>
            <div className="flex items-center gap-1">
                {loading && <Loader2 size={8} className="animate-spin" />}
                Updated: {lastUpdated}
            </div>
        </div>
    </div>
  );
};