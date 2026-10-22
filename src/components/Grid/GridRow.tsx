import React from 'react';
import type { ColumnDefinition, OrderRecord } from '../../types/order';

interface GridRowProps {
  order: OrderRecord;
  rowIndex: number;
  columns: ColumnDefinition[];
  columnWidths: Record<string, number>;
  pinnedColumn: keyof OrderRecord | null;
  isSelected: boolean;
  focusedColIndex: number | null;
  onSelectRow: (e: React.MouseEvent, index: number) => void;
  onFocusCell: (rowIndex: number, colIndex: number) => void;
  onInspectRow: (order: OrderRecord) => void;
}

export const GridRow: React.FC<GridRowProps> = React.memo(({
  order,
  rowIndex,
  columns,
  columnWidths,
  pinnedColumn,
  isSelected,
  focusedColIndex,
  onSelectRow,
  onFocusCell,
  onInspectRow,
}) => {
  const renderCellContent = (colId: keyof OrderRecord) => {
    switch (colId) {
      case 'id':
        return <span className="font-mono text-sky-400 font-medium">{order.id}</span>;

      case 'customerName':
        return (
          <span className="truncate block" title={`${order.customerName} (${order.customerEmail})`}>
            {order.customerName}
          </span>
        );

      case 'status': {
        const statusMap: Record<string, string> = {
          delivered: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
          shipped: 'bg-blue-950/70 text-blue-300 border-blue-700/50',
          processing: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
          pending: 'bg-yellow-950/70 text-yellow-300 border-yellow-700/50',
          cancelled: 'bg-rose-950/70 text-rose-300 border-rose-700/50',
        };
        return (
          <span className={`inline-block px-1.5 py-0.5 text-[10px] uppercase font-semibold rounded border ${statusMap[order.status] || 'bg-slate-800'}`}>
            {order.status}
          </span>
        );
      }

      case 'amount':
        return <span className="font-mono font-medium text-slate-100">{order.amountFormatted}</span>;

      case 'createdAtTimestamp':
        return <span className="font-mono text-slate-300 truncate">{order.createdAtFormatted}</span>;

      case 'updatedAtTimestamp':
        return (
          <span className={`font-mono truncate ${order.updatedAtTimestamp ? 'text-slate-300' : 'text-slate-600'}`}>
            {order.updatedAtFormatted}
          </span>
        );

      case 'priority': {
        const prioColors: Record<string, string> = {
          '1': 'text-rose-400 font-bold',
          '2': 'text-amber-400 font-medium',
          '3': 'text-slate-400',
        };
        return (
          <span className={order.priority ? prioColors[String(order.priority)] : 'text-slate-500'}>
            {order.priorityLabel}
          </span>
        );
      }

      case 'itemCount':
        return <span className="font-mono text-slate-300">{order.itemCount}</span>;

      case 'notes':
        return (
          <span className="truncate block text-slate-400" title={order.notes || undefined}>
            {order.notes || <span className="text-slate-600">-</span>}
          </span>
        );

      default:
        return <span className="truncate block text-slate-300">{String(order[colId] ?? '')}</span>;
    }
  };

  return (
    <div
      className={`flex items-stretch border-b border-slate-800/60 text-xs transition-colors h-[34px] min-w-max ${
        isSelected
          ? 'bg-blue-950/40 hover:bg-blue-900/50'
          : rowIndex % 2 === 0
          ? 'bg-slate-900/60 hover:bg-slate-800/50'
          : 'bg-slate-900/20 hover:bg-slate-800/50'
      }`}
      onDoubleClick={() => onInspectRow(order)}
    >
      {/* Row Checkbox */}
      <div 
        className={`w-10 min-w-[40px] px-3 flex items-center justify-center border-r border-slate-800/60 sticky left-0 z-15 ${
          isSelected ? 'bg-blue-950/90' : 'bg-slate-900'
        }`}
        onClick={(e) => onSelectRow(e, rowIndex)}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectRow(e as unknown as React.MouseEvent, rowIndex)}
          className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
        />
      </div>

      {/* Columns */}
      {columns.map((col, colIdx) => {
        const isPinned = pinnedColumn === col.id;
        const width = columnWidths[col.id] || col.width;
        const isFocused = focusedColIndex === colIdx;

        return (
          <div
            key={col.id}
            onClick={() => onFocusCell(rowIndex, colIdx)}
            style={{
              width: `${width}px`,
              minWidth: `${col.minWidth}px`,
              left: isPinned ? '40px' : undefined,
            }}
            className={`relative flex items-center px-2.5 py-1.5 border-r border-slate-800/60 select-none ${
              col.align === 'right' ? 'justify-end text-right' : col.align === 'center' ? 'justify-center text-center' : 'justify-start text-left'
            } ${
              isPinned
                ? 'sticky z-10 bg-slate-900/95 shadow-[2px_0_4px_rgba(0,0,0,0.3)]'
                : ''
            } ${
              isFocused
                ? 'outline-2 outline-sky-400 -outline-offset-2 bg-sky-500/15 z-20 font-medium'
                : ''
            }`}
          >
            {renderCellContent(col.id)}
          </div>
        );
      })}
    </div>
  );
});

GridRow.displayName = 'GridRow';
