/**
 * Example: Weather API Widget
 * Demonstrates external API integration patterns.
 * Uses Open-Meteo (no API key needed) for live weather data.
 */
import React, { useState, useEffect } from 'react';
import { Cloud, Loader2, MapPin, RefreshCw } from 'lucide-react';

interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
}

const WMO_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  51: 'Light drizzle',
  61: 'Slight rain',
  71: 'Slight snow',
  80: 'Rain showers',
  95: 'Thunderstorm',
};

export const WeatherExampleWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Oslo, Norway as the example location
  const LAT = 59.91;
  const LON = 10.75;

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`
      );
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      setWeather(data.current_weather);
    } catch (e) {
      setError('Could not fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <div className="h-full flex flex-col gap-4 bg-slate-950 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud size={14} className="text-sky-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Weather
          </span>
        </div>
        <button
          onClick={fetchWeather}
          disabled={loading}
          aria-label="Refresh weather"
          className="p-1 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <MapPin size={10} />
        <span>Oslo, Norway</span>
      </div>

      {/* Data */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-sky-400" />
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center text-red-400 text-xs">{error}</div>
      )}

      {weather && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <span className="text-5xl font-mono font-bold text-white">
            {Math.round(weather.temperature)}°C
          </span>
          <span className="text-sm text-sky-400">
            {WMO_CODES[weather.weathercode] ?? 'Unknown'}
          </span>
          <span className="text-xs text-slate-500">Wind: {weather.windspeed} km/h</span>
        </div>
      )}
    </div>
  );
};
