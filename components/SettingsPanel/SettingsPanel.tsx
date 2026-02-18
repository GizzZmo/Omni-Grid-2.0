import React, { useState } from 'react';
import { X, Settings, Monitor, Grid3x3, Database, Wrench } from 'lucide-react';
import { GeneralTab } from './GeneralTab';
import { AppearanceTab } from './AppearanceTab';
import { WidgetsTab } from './WidgetsTab';
import { DataTab } from './DataTab';
import { AdvancedTab } from './AdvancedTab';

type TabId = 'general' | 'appearance' | 'widgets' | 'data' | 'advanced';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  if (!isOpen) return null;

  const tabs = [
    { id: 'general' as TabId, label: 'General', icon: Settings },
    { id: 'appearance' as TabId, label: 'Appearance', icon: Monitor },
    { id: 'widgets' as TabId, label: 'Widgets', icon: Grid3x3 },
    { id: 'data' as TabId, label: 'Data', icon: Database },
    { id: 'advanced' as TabId, label: 'Advanced', icon: Wrench },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab />;
      case 'appearance':
        return <AppearanceTab />;
      case 'widgets':
        return <WidgetsTab />;
      case 'data':
        return <DataTab />;
      case 'advanced':
        return <AdvancedTab />;
      default:
        return <GeneralTab />;
    }
  };

  // Close on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl h-[80vh] bg-slate-950 border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-cyan-400 uppercase tracking-wider">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cyan-500/10 rounded transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-cyan-400" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-cyan-500/30 bg-slate-950/50 p-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded text-left text-sm
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/5'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">{renderTabContent()}</div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyan-500/30 bg-slate-950/50 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Settings are saved automatically
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
