import React from 'react';
import { Download, Upload, Trash2, HardDrive } from 'lucide-react';
import { downloadJson, uploadJson } from '../../utils';
import { useAppStore } from '../../store';

export const DataTab: React.FC = () => {
  const setGlobalState = useAppStore(s => s.setGlobalState);

  const handleExport = () => {
    const currentState = useAppStore.getState();
    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      state: currentState,
    };
    downloadJson(`omni-grid-backup-${new Date().toISOString().slice(0, 10)}.json`, backup);
  };

  const handleImport = () => {
    uploadJson(data => {
      if (data.state) {
        if (confirm('RESTORE BACKUP? CURRENT SESSION DATA WILL BE OVERWRITTEN.')) {
          setGlobalState(data.state);
          alert('Backup restored successfully!');
        }
      } else {
        alert('INVALID BACKUP FILE DETECTED.');
      }
    });
  };

  const handleClearData = () => {
    if (confirm('CLEAR ALL DATA? This action cannot be undone.')) {
      if (confirm('Are you absolutely sure? This will reset Omni-Grid to defaults.')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wide mb-4">
          Data Management
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Import, export, and manage your Omni-Grid data
        </p>
      </div>

      {/* Backup & Restore */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Backup & Restore
        </h4>
        
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 py-3 px-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded transition-colors text-left"
          >
            <Download className="w-5 h-5 text-cyan-400" />
            <div className="flex-1">
              <div className="text-sm text-cyan-400 font-medium">Export Data</div>
              <div className="text-xs text-slate-400">Download all your data as JSON</div>
            </div>
          </button>

          <button
            onClick={handleImport}
            className="w-full flex items-center gap-3 py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors text-left"
          >
            <Upload className="w-5 h-5 text-slate-400" />
            <div className="flex-1">
              <div className="text-sm text-slate-300 font-medium">Import Data</div>
              <div className="text-xs text-slate-500">Restore from backup file</div>
            </div>
          </button>
        </div>
      </div>

      {/* Storage Info */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Storage Information
        </h4>
        
        <div className="py-4 px-4 bg-slate-900/50 rounded border border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <div className="text-sm text-slate-200 font-medium">Local Storage</div>
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Storage Type:</span>
              <span className="text-slate-300">Browser LocalStorage</span>
            </div>
            <div className="flex justify-between">
              <span>Data Location:</span>
              <span className="text-slate-300">Client-side only</span>
            </div>
            <div className="flex justify-between">
              <span>Encryption:</span>
              <span className="text-slate-300">Browser default</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500">
            Your data is stored locally in your browser and never sent to any server.
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider">
          Danger Zone
        </h4>
        
        <div className="py-4 px-4 bg-red-950/20 rounded border border-red-500/30">
          <button
            onClick={handleClearData}
            className="w-full flex items-center gap-3 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded transition-colors text-left"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <div className="flex-1">
              <div className="text-sm text-red-400 font-medium">Clear All Data</div>
              <div className="text-xs text-red-400/70">Reset to factory defaults</div>
            </div>
          </button>
          <div className="mt-3 text-xs text-red-400/70">
            ⚠️ This action cannot be undone. Export your data first!
          </div>
        </div>
      </div>
    </div>
  );
};
