import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters: () => void;
  totalOrders: number;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onClearFilters, totalOrders }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center h-full min-h-[350px]">
      <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
        <SearchX className="w-8 h-8 text-sky-400" />
      </div>

      <h3 className="text-lg font-semibold text-slate-100 mb-1">
        No orders match your filter criteria
      </h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        We searched across all {totalOrders.toLocaleString()} orders, but none matched the current combination of conditions.
      </p>

      <button
        onClick={onClearFilters}
        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-md shadow-lg shadow-sky-600/20 transition-all duration-150 active:scale-95"
      >
        <RotateCcw className="w-4 h-4" />
        Reset All Filters
      </button>
    </div>
  );
};
