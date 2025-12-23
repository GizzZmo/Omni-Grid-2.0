
import React, { useState } from 'react';
import { GitPullRequest, GitMerge, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store';

const MOCK_PRS = [
    { id: 102, title: 'feat: add dark mode support', repo: 'frontend/core', status: 'open', author: 'jconstantine', time: '2h ago' },
    { id: 101, title: 'fix: memory leak in grid', repo: 'frontend/core', status: 'merged', author: 'sarah_connor', time: '5h ago' },
    { id: 99, title: 'chore: update deps', repo: 'backend/api', status: 'review', author: 'system_admin', time: '1d ago' },
    { id: 98, title: 'refactor: authentication flow', repo: 'frontend/auth', status: 'open', author: 'neo', time: '1d ago' },
    { id: 95, title: 'docs: update readme', repo: 'docs/wiki', status: 'merged', author: 'morpheus', time: '2d ago' },
];

export const GitPulse: React.FC = () => {
  const { gitToken, setGitToken } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusIcon = (status: string) => {
      switch(status) {
          case 'open': return <GitPullRequest size={14} className="text-emerald-400" />;
          case 'merged': return <GitMerge size={14} className="text-purple-400" />;
          case 'review': return <Clock size={14} className="text-amber-400" />;
          default: return <AlertCircle size={14} className="text-slate-500" />;
      }
  };

  return (
    <div className="h-full flex flex-col gap-2">
        <div className="flex gap-2">
            <input 
                type="password" 
                value={gitToken}
                onChange={(e) => setGitToken(e.target.value)}
                placeholder="Personal Access Token (Local Only)"
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-indigo-500 outline-none"
            />
            <button 
                onClick={refresh}
                className="bg-slate-800 p-1.5 rounded hover:bg-slate-700 text-slate-300"
            >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
             {MOCK_PRS.map(pr => (
                 <div key={pr.id} className="bg-slate-900/50 border border-slate-800 rounded p-2 flex flex-col gap-1 hover:border-indigo-500/30 group">
                     <div className="flex justify-between items-start">
                         <div className="flex items-center gap-2">
                             {getStatusIcon(pr.status)}
                             <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">{pr.title}</span>
                         </div>
                         <span className="text-[10px] text-slate-500 font-mono">#{pr.id}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] text-slate-500 pl-6">
                         <span>{pr.repo}</span>
                         <div className="flex items-center gap-2">
                            <span>@{pr.author}</span>
                            <span>{pr.time}</span>
                         </div>
                     </div>
                 </div>
             ))}
             {!gitToken && (
                 <div className="p-4 text-center text-xs text-slate-500 italic border border-dashed border-slate-800 rounded">
                     Showing demo data. Add Token to connect live.
                 </div>
             )}
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-600 px-1">
            <span>Open: 2</span>
            <span>Review: 1</span>
            <span>Merged: 2</span>
        </div>
    </div>
  );
};
