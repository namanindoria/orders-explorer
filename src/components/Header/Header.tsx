import React from 'react';
import { Download, Keyboard, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  selectedCount: number;
  onExport: () => void;
  datasetCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCount,
  onExport,
  datasetCount,
}) => {
  return (
    <header className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 select-none">
      {/* Brand & Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sky-400">
          <div className="w-6 h-6 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center font-bold text-xs tracking-tighter">
            ◈
          </div>
          <span className="font-bold text-sm tracking-wide text-slate-100">
            MERKLE SCIENCE
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">
            Orders Explorer
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5" />
            <span>{datasetCount.toLocaleString()} Rows Live</span>
          </span>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint Bar (Designed for fast 13" laptop power-users) */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono">
        <Keyboard className="w-3.5 h-3.5 text-slate-500" />
        <span>[↑↓←→ Move]</span>
        <span className="text-slate-700">•</span>
        <span>[Space Select]</span>
        <span className="text-slate-700">•</span>
        <span>[Enter Details]</span>
        <span className="text-slate-700">•</span>
        <span>[Esc Close]</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          13" Dense Ops Mode
        </span>

        <button
          onClick={onExport}
          disabled={selectedCount === 0}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded shadow-sm transition-all duration-150 ${
            selectedCount > 0
              ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer shadow-sky-600/20 active:scale-95'
              : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
          title={
            selectedCount > 0
              ? `Export ${selectedCount} matching selected rows to CSV`
              : 'Select one or more rows to export CSV'
          }
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
        </button>
      </div>
    </header>
  );
};
