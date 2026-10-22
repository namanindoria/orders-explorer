import React from 'react';
import type { FilterQuery, FilterCondition } from '../../types/order';
import { FILTER_FIELDS } from './fieldDefinitions';
import { X, RotateCcw, CheckSquare } from 'lucide-react';

interface ActiveFilterChipsProps {
  filter: FilterQuery;
  onRemoveCondition: (groupId: string, conditionId: string) => void;
  onClearAll: () => void;
  filteredCount: number;
  totalCount: number;
  selectedVisibleCount: number;
  totalSelectedCount: number;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filter,
  onRemoveCondition,
  onClearAll,
  filteredCount,
  totalCount,
  selectedVisibleCount,
  totalSelectedCount,
}) => {
  // Extract all active conditions across all groups
  const chips: { groupId: string; condition: FilterCondition; label: string }[] = [];

  filter.groups.forEach((group) => {
    group.conditions.forEach((c) => {
      // Check if condition is active
      const hasValue =
        c.value !== null &&
        c.value !== undefined &&
        c.value !== '' &&
        (!Array.isArray(c.value) || c.value.length > 0) &&
        (typeof c.value !== 'object' || Array.isArray(c.value) || ('min' in c.value && (c.value.min !== '' || c.value.max !== '')));

      if (!hasValue) return;

      const fieldConfig = FILTER_FIELDS.find((f) => f.id === c.field);
      const fieldName = fieldConfig?.label || c.field;
      const opName = c.operator.replace(/_/g, ' ');

      let valText = '';
      if (Array.isArray(c.value)) {
        valText = c.value.join(', ');
      } else if (typeof c.value === 'object' && c.value !== null && 'min' in c.value) {
        valText = `${c.value.min || '0'} to ${c.value.max || '∞'}`;
      } else {
        valText = String(c.value);
      }

      chips.push({
        groupId: group.id,
        condition: c,
        label: `${fieldName} ${opName} "${valText}"`,
      });
    });
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs">
      {/* Chips Area */}
      <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-[280px]">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
          Active Filters:
        </span>

        {chips.length === 0 ? (
          <span className="text-slate-500 italic text-[11px]">None (Showing all records)</span>
        ) : (
          <>
            {chips.map(({ groupId, condition, label }) => (
              <span
                key={`${groupId}_${condition.id}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-700/60 text-sky-300 font-medium text-[11px]"
              >
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() => onRemoveCondition(groupId, condition.id)}
                  className="hover:bg-sky-800/60 rounded-full p-0.5 hover:text-white transition-colors"
                  title="Remove this filter"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}

            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 px-2 py-0.5 rounded hover:bg-rose-950/30 transition-colors"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Clear all</span>
            </button>
          </>
        )}
      </div>

      {/* Result Counters & Selection Badge */}
      <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
        {/* Selection Count Pill */}
        {totalSelectedCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-sky-300">
            <CheckSquare className="w-3 h-3 text-sky-400" />
            <span>
              {selectedVisibleCount === totalSelectedCount ? (
                <>
                  <strong className="text-white">{selectedVisibleCount}</strong> selected
                </>
              ) : (
                <>
                  <strong className="text-white">{selectedVisibleCount}</strong> selected{' '}
                  <span className="text-slate-400 font-sans">({totalSelectedCount} total)</span>
                </>
              )}
            </span>
          </div>
        )}

        {/* Total Count */}
        <div className="text-slate-400">
          Showing <span className="font-bold text-slate-100">{filteredCount.toLocaleString()}</span> of{' '}
          <span className="font-bold text-slate-300">{totalCount.toLocaleString()}</span> orders
        </div>
      </div>
    </div>
  );
};
