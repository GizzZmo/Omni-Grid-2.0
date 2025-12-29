import React, { useState } from 'react';
import {
  FileText,
  Cpu,
  Layout,
  Layers,
  Calendar,
  CheckCircle,
  BarChart,
  ArrowRight,
  User,
  Activity,
  Search,
  Zap,
  Eye,
  Terminal,
  Grid,
} from 'lucide-react';

export const StrategicBlueprint: React.FC = () => {
  const [activeSection, setActiveSection] = useState('executive');

  const sections = [
    { id: 'executive', label: '1. Executive Summary', icon: FileText },
    { id: 'enhancement', label: '2. Widget Enhancement', icon: Cpu },
    { id: 'gui', label: '3. GUI Optimization', icon: Layout },
    { id: 'new-features', label: '4. New Widgets', icon: Layers },
    { id: 'roadmap', label: '5. Roadmap', icon: Calendar },
    { id: 'conclusion', label: '6. Conclusion & Approval', icon: CheckCircle },
    { id: 'supplement', label: 'Data Analyst Supplement', icon: BarChart, highlight: true },
  ];

  return (
    <div className="h-full w-full bg-slate-50 text-slate-800 font-sans flex flex-col overflow-hidden">
      {/* Document Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 p-4 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Grid size={80} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
              Strategic Blueprint
            </h1>
            <p className="text-slate-500 font-medium text-xs">
              UI/UX Enhancement & Widget Development
            </p>
          </div>
          <div className="mt-2 md:mt-0 px-3 py-1 bg-blue-600 text-white rounded shadow-md text-xs font-semibold flex items-center gap-1">
            <Activity size={12} /> APPROVED
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-1/3 max-w-[200px] border-r border-slate-200 bg-slate-50 flex flex-col overflow-y-auto custom-scrollbar">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-3 text-xs font-medium transition-colors border-l-4 text-left
                      ${
                        activeSection === section.id
                          ? 'bg-blue-50 border-blue-600 text-blue-700'
                          : 'border-transparent text-slate-600 hover:bg-white hover:text-slate-900'
                      }
                      ${section.highlight ? 'mt-auto border-t border-t-slate-200' : ''}
                    `}
              >
                <Icon size={14} className={section.highlight ? 'text-amber-500' : ''} />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white relative custom-scrollbar">
          {/* 1. EXECUTIVE SUMMARY */}
          {activeSection === 'executive' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} /> Executive Summary
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm mb-4">
                The <strong className="text-slate-900">Omni-Grid</strong> platform is entering a
                critical scaling phase. To maintain its competitive edge as a premier data-grid
                solution, we must transition from a &quot;feature-complete&quot; tool to a
                &quot;performance-optimized&quot; ecosystem.
              </p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Core Objectives
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 bg-green-100 text-green-700 rounded-full p-0.5">
                      <CheckCircle size={10} />
                    </div>
                    <div>
                      <strong className="block text-slate-800 text-xs">
                        Increase User Retention
                      </strong>
                      <span className="text-slate-500 text-[10px]">
                        Reducing friction in complex data manipulation.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 bg-green-100 text-green-700 rounded-full p-0.5">
                      <CheckCircle size={10} />
                    </div>
                    <div>
                      <strong className="block text-slate-800 text-xs">
                        Lower Total Cost of Ownership
                      </strong>
                      <span className="text-slate-500 text-[10px]">
                        Streamlining code maintenance through standardization.
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* 2. ENHANCEMENT */}
          {activeSection === 'enhancement' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Cpu className="text-blue-600" size={20} /> Enhancement of Existing Widgets
              </h2>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">UI/UX Audit</h3>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li>
                      <strong className="text-blue-700">Atomic Design:</strong> Breaking widgets
                      down into atoms.
                    </li>
                    <li>
                      <strong className="text-blue-700">Design Tokens:</strong> Moving to
                      `color-primary-600` variables.
                    </li>
                    <li>
                      <strong className="text-blue-700">A11y:</strong> WCAG 2.1 AA compliance
                      target.
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Performance Hardening</h3>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li>
                      <strong className="text-purple-700">Passive Events:</strong> Better scroll
                      performance.
                    </li>
                    <li>
                      <strong className="text-purple-700">Tree-shaking:</strong> Reducing bundle
                      size.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 3. GUI OPTIMIZATION */}
          {activeSection === 'gui' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Layout className="text-blue-600" size={20} /> GUI Optimization
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-1">
                  <h3 className="text-sm font-bold text-slate-900">Rendering Efficiency</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100 shadow-sm">
                      <div className="text-blue-600 mb-1">
                        <Layers size={14} />
                      </div>
                      <strong className="block text-xs text-slate-900">Virtual Scrolling</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100 shadow-sm">
                      <div className="text-blue-600 mb-1">
                        <Zap size={14} />
                      </div>
                      <strong className="block text-xs text-slate-900">Atomic State</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. NEW WIDGETS */}
          {activeSection === 'new-features' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="text-blue-600" size={20} /> New Widgets
              </h2>
              <div className="bg-blue-900 text-white p-4 rounded-lg mb-4 shadow-lg">
                <h3 className="font-bold text-sm mb-1">Philosophy: &quot;Widget Sandbox&quot;</h3>
                <p className="text-xs opacity-90">
                  Widgets must be &quot;Data Agnostic&quot; handling JSON or gRPC via middleware.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-green-200 bg-green-50 rounded p-3">
                  <h4 className="font-bold text-slate-800 text-xs mb-1 flex items-center gap-1">
                    <CheckCircle size={10} className="text-green-600" /> Advanced Visualizers
                  </h4>
                  <p className="text-[10px] text-slate-600">
                    Sankey Diagrams (MacroNet) & Time-Series Heatmaps.
                  </p>
                </div>
                <div className="border border-slate-200 rounded p-3">
                  <h4 className="font-bold text-slate-800 text-xs mb-1">Contextual Utility</h4>
                  <p className="text-[10px] text-slate-600">
                    NLP Command Bar (Cmd+K), Smart Filtering.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. ROADMAP */}
          {activeSection === 'roadmap' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="text-blue-600" size={20} /> Roadmap
              </h2>
              <table className="w-full text-left border-collapse bg-slate-50 text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="p-2">Phase</th>
                    <th className="p-2">Focus</th>
                    <th className="p-2">Metric</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-bold">I</td>
                    <td className="p-2">Benchmark</td>
                    <td className="p-2">Baseline</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">II</td>
                    <td className="p-2">Hardening</td>
                    <td className="p-2">-30% TTI</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">III</td>
                    <td className="p-2">Expansion</td>
                    <td className="p-2">Beta Release</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* 6. CONCLUSION */}
          {activeSection === 'conclusion' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-blue-600" size={20} /> Conclusion
              </h2>
              <p className="text-slate-600 mb-4 text-sm">
                This blueprint represents a shift from reactive maintenance to proactive innovation.
                By prioritizing <strong className="text-slate-900">Performance Hardening</strong>,
                Omni-Grid will serve the next generation of data complexity.
              </p>
              <div className="border-t border-slate-200 pt-4">
                <div className="font-serif text-2xl text-slate-800 italic mb-1">
                  Jon Constantine
                </div>
                <div className="text-xs text-slate-500">Admin Director, Omni-Grid</div>
              </div>
            </div>
          )}

          {/* SUPPLEMENT */}
          {activeSection === 'supplement' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h2 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <Search className="text-amber-600" size={20} /> Analyst Supplement
                </h2>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-amber-900 text-xs">Immediate ROI</h4>
                    <p className="text-amber-800 text-[10px] mt-1">
                      Transition icons to SVGs and implement debouncing.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 text-xs">
                      The &quot;A11y&quot; Advantage
                    </h4>
                    <p className="text-amber-800 text-[10px] mt-1">
                      Target Section 508 for Gov/Enterprise contracts.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-900 text-xs">Technical Debt Warning</h4>
                    <p className="text-amber-800 text-[10px] mt-1">
                      Do not build Phase III before Phase II is 80% complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
