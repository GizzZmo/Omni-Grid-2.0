import React, { useState } from 'react';
import { Rss, ExternalLink, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store';

const MOCK_NEWS = [
  { title: 'The Future of Local-First Software', source: 'Hacker News', url: '#' },
  { title: 'Why Cloud Subscriptions are Dying', source: 'TechCrunch', url: '#' },
  { title: 'React 19 features revealed', source: 'React Blog', url: '#' },
  { title: 'Building a Second Brain with AI', source: 'Verge', url: '#' },
  { title: 'Cyberpunk Aesthetic Design Guide', source: 'Smashing Mag', url: '#' },
];

export const NewsFeed: React.FC = () => {
  const { rssFeeds } = useAppStore();
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between bg-slate-900 p-2 rounded">
        <div className="flex items-center gap-2 text-xs text-orange-400 font-bold">
          <Rss size={14} /> RSS Stream
        </div>
        <button onClick={refresh} className="text-slate-500 hover:text-white">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
        {MOCK_NEWS.map((item, i) => (
          <div
            key={i}
            className="bg-slate-900/50 border border-slate-800 p-2 rounded hover:border-orange-500/30 transition-colors group cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-300 group-hover:text-orange-300 leading-tight mb-1">
              {item.title}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>{item.source}</span>
              <ExternalLink size={10} className="opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-slate-600 text-center">
        Monitoring {rssFeeds.length} Sources
      </div>
    </div>
  );
};
