import React from 'react';
import { Book, ExternalLink } from 'lucide-react';
import { DEV_DOCS_LANGUAGES } from './devdocsLanguages';

export const DocuHub: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="bg-slate-900 border-b border-slate-800 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold uppercase">
          <Book size={14} /> Local Documentation
        </div>
        <a
          href="https://devdocs.io"
          target="_blank"
          rel="noreferrer"
          className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-white"
        >
          Open Source <ExternalLink size={10} />
        </a>
      </div>
      <div className="bg-slate-900/60 border-b border-slate-800 px-2 py-1 text-[10px] text-slate-400">
        <span className="font-semibold text-slate-300 mr-1">DevDocs languages:</span>
        <span className="leading-relaxed">{DEV_DOCS_LANGUAGES.join(', ')}</span>
      </div>
      {/* We use DevDocs.io as it is a SPA friendly PWA that works well in iframes for this specific "Web Wrapper" widget use case */}
      <iframe
        src="https://devdocs.io"
        className="flex-1 w-full border-none bg-white filter invert-[.93] hue-rotate-180"
        title="DevDocs"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
      <div className="p-1 text-[9px] text-center text-slate-600 bg-slate-900">
        Powered by DevDocs.io
      </div>
    </div>
  );
};
