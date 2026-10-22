import React from 'react';
import type { ColumnDefinition, OrderRecord, SortState } from '../../types/order';
import { ArrowUp, ArrowDown, Pin, PinOff } from 'lucide-react';

interface GridHeaderProps {
  columns: ColumnDefinition[];
  columnWidths: Record<string, number>;
  sortState: SortState | null;
  onSort: (field: keyof OrderRecord) => void;
  pinnedColumn: keyof OrderRecord | null;
  onTogglePin: (colId: keyof OrderRecord) => void;
  onStartResize: (e: React.MouseEvent, colId: string) => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onToggleSelectAll: () => void;
}

export const GridHeader: React.FC<GridHeaderProps> = ({
  columns,
  columnWidths,
  sortState,
  onSort,
  pinnedColumn,
  onTogglePin,
  onStartResize,
  isAllSelected,
  isSomeSelected,
  onToggleSelectAll,
}) => {
  return (
    <div className="sticky top-0 z-20 flex bg-slate-900 border-b border-slate-700/80 text-xs font-semibold text-slate-300 select-none shadow-sm min-w-max">
      {/* Selection Checkbox Header */}
      <div className="w-10 min-w-[40px] px-3 py-2 flex items-center justify-center border-r border-slate-800 bg-slate-900 sticky left-0 z-30">
        <input
          type="checkbox"
          checked={isAllSelected}
          ref={(input) => {
            if (input) {
              input.indeterminate = !isAllSelected && isSomeSelected;
            }
          }}
          onChange={onToggleSelectAll}
          className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
          title="Select all visible orders"
        />
      </div>

      {/* Dynamic Columns */}
      {columns.map((col) => {
        const isPinned = pinnedColumn === col.id;
        const width = columnWidths[col.id] || col.width;
        const isSorted = sortState?.field === col.id;

        return (
          <div
            key={col.id}
            style={{
              width: `${width}px`,
              minWidth: `${col.minWidth}px`,
              left: isPinned ? '40px' : undefined,
            }}
            className={`group relative flex items-center justify-between px-2.5 py-2 border-r border-slate-800/80 transition-colors ${
              isPinned
                ? 'sticky z-25 bg-slate-900/95 shadow-[2px_0_4px_rgba(0,0,0,0.3)]'
                : 'bg-slate-900 hover:bg-slate-800/60'
            }`}
          >
            {/* Header Title & Sort Button */}
            <button
              onClick={() => col.sortable && onSort(col.id)}
              disabled={!col.sortable}
              className={`flex-1 flex items-center gap-1.5 overflow-hidden text-left ${
                col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
              } ${col.sortable ? 'cursor-pointer hover:text-white' : 'cursor-default'}`}
              title={col.sortable ? `Sort by ${col.header}` : undefined}
            >
              <span className="truncate">{col.header}</span>
              {isSorted && (
                <span className="text-sky-400 shrink-0">
                  {sortState.direction === 'asc' ? (
                    <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                  ) : (
                    <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                  )}
                </span>
              )}
            </button>

            {/* Pin Column Action */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(col.id);
              }}
              title={isPinned ? 'Unpin column' : 'Pin column to left'}
              className={`p-0.5 rounded transition-opacity ${
                isPinned
                  ? 'text-sky-400 opacity-100'
                  : 'text-slate-500 opacity-0 group-hover:opacity-100 hover:text-slate-200'
              }`}
            >
              {isPinned ? <Pin className="w-2.5 h-2.5 fill-current" /> : <PinOff className="w-2.5 h-2.5" />}
            </button>

            {/* Resize Drag Handle */}
            <div
              onMouseDown={(e) => onStartResize(e, col.id)}
              className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-sky-500 active:bg-sky-400 transition-colors z-10"
              title="Drag to resize column"
            />
          </div>
        );
      })}
    </div>
  );
};
