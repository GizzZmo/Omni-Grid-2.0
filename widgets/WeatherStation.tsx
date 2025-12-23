import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, MapPin, Search, Loader2, Thermometer } from 'lucide-react';
import { useAppStore } from '../store';

interface WeatherData {
    temp: string;
    desc: string;
    humidity: string;
    wind: string;
    city: string;
    country: string;
}

export const WeatherStation: React.FC = () => {
  const { weatherLocation, setWeatherLocation } = useAppStore();
  const [localLoc, setLocalLoc] = useState(weatherLocation);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update local state if store changes externally (e.g. import)
  useEffect(() => {
    setLocalLoc(weatherLocation);
    if(weatherLocation) fetchWeather(undefined, weatherLocation);
  }, [weatherLocation]);

  const fetchWeather = async (e?: React.FormEvent, locOverride?: string) => {
    if (e) e.preventDefault();
    const query = locOverride || localLoc;
    if (!query.trim()) return;

    // Update store on search
    if (!locOverride) setWeatherLocation(localLoc);

    setLoading(true);
    setError('');
    setWeather(null);

    try {
        // wttr.in returns JSON with format=j1
        const res = await fetch(`https://wttr.in/${encodeURIComponent(query)}?format=j1`);
        if (!res.ok) throw new Error('Weather service unavailable');
        const data = await res.json();
        
        const current = data.current_condition[0];
        const area = data.nearest_area[0];
        
        setWeather({
            temp: current.temp_C,
            desc: current.weatherDesc[0].value,
            humidity: current.humidity,
            wind: current.windspeedKmph,
            city: area.areaName[0].value,
            country: area.country[0].value
        });
    } catch (err) {
        setError('Location not found or service down.');
    } finally {
        setLoading(false);
    }
  };

  const getWeatherIcon = (desc: string) => {
      const d = desc.toLowerCase();
      if (d.includes('rain') || d.includes('drizzle') || d.includes('shower')) return <CloudRain size={48} className="text-blue-400" />;
      if (d.includes('cloud') || d.includes('overcast') || d.includes('mist') || d.includes('fog')) return <Cloud size={48} className="text-slate-400" />;
      if (d.includes('sunny') || d.includes('clear')) return <Sun size={48} className="text-yellow-400" />;
      if (d.includes('snow') || d.includes('ice')) return <div className="text-white font-bold text-4xl">❄️</div>;
      return <Sun size={48} className="text-slate-200" />;
  };

  return (
    <div className="h-full flex flex-col gap-3">
        <form onSubmit={(e) => fetchWeather(e)} className="flex gap-2">
            <div className="relative flex-1">
                <MapPin size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                    value={localLoc}
                    onChange={(e) => setLocalLoc(e.target.value)}
                    placeholder="City or Postcode, Country"
                    className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="bg-cyan-900/30 text-cyan-400 border border-cyan-800/50 p-1.5 rounded hover:bg-cyan-900/50 transition-colors"
            >
                {loading ? <Loader2 size={14} className="animate-spin"/> : <Search size={14}/>}
            </button>
        </form>

        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/50 rounded-lg border border-white/5 relative overflow-hidden">
            {error ? (
                <div className="text-red-400 text-xs text-center px-4">{error}</div>
            ) : weather ? (
                <div className="w-full h-full p-4 flex flex-col items-center justify-between">
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-200">{weather.city}</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{weather.country}</p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1 my-2">
                        {getWeatherIcon(weather.desc)}
                        <div className="text-4xl font-mono font-bold text-white mt-2">{weather.temp}°C</div>
                        <div className="text-xs text-cyan-300 capitalize">{weather.desc}</div>
                    </div>

                    <div className="flex w-full justify-between gap-2 mt-auto">
                        <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded text-[10px] text-slate-400">
                            <Droplets size={10} className="text-blue-400"/> {weather.humidity}%
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded text-[10px] text-slate-400">
                            <Wind size={10} className="text-slate-200"/> {weather.wind} km/h
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 text-slate-600">
                    <Cloud size={32} className="opacity-50" />
                    <span className="text-xs italic">Enter location</span>
                </div>
            )}
        </div>
    </div>
  );
};