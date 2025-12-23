
import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, AlertCircle, ArrowUp, ArrowDown, DollarSign } from 'lucide-react';

export const MarketWidget: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetching top 7 coins by market cap
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=7&page=1&sparkline=false&price_change_percentage=24h'
      );
      
      if (!response.ok) {
        if (response.status === 429) throw new Error("Rate limit exceeded. Please wait.");
        throw new Error("Failed to fetch data.");
      }

      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Auto refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2,
    }).format(price);
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Header */}
      <div className="p-2 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center backdrop-blur-sm rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500/20 p-1.5 rounded-lg text-indigo-400">
            <TrendingUp size={16} />
          </div>
          <div>
            <h2 className="font-bold text-xs text-slate-200 leading-tight uppercase">Market Watch</h2>
            <p className="text-[10px] text-slate-500">Top 7 by Cap</p>
          </div>
        </div>
        <button 
          onClick={fetchMarketData}
          disabled={loading}
          className="p-1.5 hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50 text-slate-400 hover:text-white"
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-2">
            <AlertCircle size={24} className="text-red-500 opacity-80" />
            <p className="text-xs text-slate-400">{error}</p>
            <button 
              onClick={fetchMarketData}
              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-bold uppercase transition-colors"
            >
              Retry Uplink
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {loading && data.length === 0 ? (
              // Skeleton Loading
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 animate-pulse bg-slate-900/30 rounded border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-800 rounded-full"></div>
                    <div className="flex flex-col gap-1">
                      <div className="w-12 h-2 bg-slate-800 rounded"></div>
                      <div className="w-8 h-2 bg-slate-800 rounded"></div>
                    </div>
                  </div>
                  <div className="w-16 h-3 bg-slate-800 rounded"></div>
                </div>
              ))
            ) : (
              // Data List
              data.map((coin) => (
                <div 
                  key={coin.id} 
                  className="group flex items-center justify-between p-2 hover:bg-slate-800/50 rounded border border-transparent hover:border-slate-700 transition-all duration-200 cursor-default"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-600 font-mono w-3">{coin.market_cap_rank}</span>
                    <img 
                      src={coin.image} 
                      alt={coin.name} 
                      className="w-6 h-6 rounded-full shadow-sm grayscale group-hover:grayscale-0 transition-all" 
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-slate-200">{coin.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{coin.symbol}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="font-mono font-medium text-xs text-slate-300">
                      {formatPrice(coin.current_price)}
                    </span>
                    <div className={`flex items-center text-[10px] font-medium ${
                      coin.price_change_percentage_24h >= 0 
                        ? 'text-emerald-400' 
                        : 'text-rose-400'
                    }`}>
                      {coin.price_change_percentage_24h >= 0 
                        ? <ArrowUp size={10} className="mr-0.5" /> 
                        : <ArrowDown size={10} className="mr-0.5" />
                      }
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-900/30 border-t border-slate-800 p-2 flex justify-between items-center text-[9px] text-slate-600 font-mono">
        <span>API: CoinGecko</span>
        <span>{lastUpdated.toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
