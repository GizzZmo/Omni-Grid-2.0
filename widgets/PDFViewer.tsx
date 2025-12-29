import React, { useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';

export const PDFViewer: React.FC = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFileUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="h-full flex flex-col gap-2">
      {!fileUrl ? (
        <div className="flex-1 border-2 border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-indigo-500/50 hover:bg-slate-900/30 transition-all relative">
          <FileText size={32} />
          <span className="text-xs">Drop PDF Whitepaper</span>
          <input
            type="file"
            onChange={handleFile}
            accept="application/pdf"
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full">
          <div className="flex justify-end mb-1">
            <button
              onClick={() => setFileUrl(null)}
              className="text-slate-500 hover:text-red-400 flex items-center gap-1 text-[10px]"
            >
              <X size={12} /> Close PDF
            </button>
          </div>
          <iframe
            src={fileUrl}
            className="flex-1 w-full rounded border border-slate-800 bg-white"
            title="PDF Reader"
          />
        </div>
      )}
    </div>
  );
};
