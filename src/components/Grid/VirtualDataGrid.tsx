import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { OrderRecord, SortState } from '../../types/order';
import { DEFAULT_COLUMNS } from './columns';
import { GridHeader } from './GridHeader';
import { GridRow } from './GridRow';
import { EmptyState } from './EmptyState';

interface VirtualDataGridProps {
  orders: OrderRecord[];
  totalDatasetCount: number;
  sortState: SortState | null;
  onSort: (field: keyof OrderRecord) => void;
  pinnedColumn: keyof OrderRecord | null;
  onTogglePin: (colId: keyof OrderRecord) => void;
  selectedIds: string[];
  onToggleSelect: (id: string, isShift: boolean, index: number) => void;
  onSelectAllVisible: (ids: string[]) => void;
  onInspectOrder: (order: OrderRecord) => void;
  onClearFilters: () => void;
}

const ROW_HEIGHT = 34; // 34px dense height for 13-inch displays
const OVERSCAN = 6; // Extra buffer rows above and below

export const VirtualDataGrid: React.FC<VirtualDataGridProps> = ({
  orders,
  totalDatasetCount,
  sortState,
  onSort,
  pinnedColumn,
  onTogglePin,
  selectedIds,
  onToggleSelect,
  onSelectAllVisible,
  onInspectOrder,
  onClearFilters,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // Column resizing state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    DEFAULT_COLUMNS.forEach((col) => {
      initial[col.id] = col.width;
    });
    return initial;
  });

  const resizingRef = useRef<{
    colId: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Keyboard navigation & focused cell state
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; colIndex: number } | null>(() => {
    return orders.length > 0 ? { rowIndex: 0, colIndex: 0 } : null;
  });

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Measure container height on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle high-performance scrolling with requestAnimationFrame
  const scrollRafRef = useRef<number | null>(null);
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const currentScrollTop = containerRef.current.scrollTop;

    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
    }

    scrollRafRef.current = requestAnimationFrame(() => {
      setScrollTop(currentScrollTop);
    });
  }, []);

  // Virtual slice calculations
  const totalRows = orders.length;

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    totalRows - 1,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN
  );

  const visibleOrders = useMemo(() => {
    if (totalRows === 0) return [];
    return orders.slice(startIndex, endIndex + 1);
  }, [orders, startIndex, endIndex, totalRows]);

  const topSpacerHeight = startIndex * ROW_HEIGHT;
  const bottomSpacerHeight = Math.max(0, (totalRows - endIndex - 1) * ROW_HEIGHT);

  // Column Resizing handlers
  const handleStartResize = useCallback((e: React.MouseEvent, colId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const currentWidth = columnWidths[colId] || DEFAULT_COLUMNS.find((c) => c.id === colId)?.width || 120;
    resizingRef.current = {
      colId,
      startX: e.clientX,
      startWidth: currentWidth,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingRef.current) return;
      const { colId: activeColId, startX, startWidth } = resizingRef.current;
      const diff = moveEvent.clientX - startX;
      const minW = DEFAULT_COLUMNS.find((c) => c.id === activeColId)?.minWidth || 60;
      const newWidth = Math.max(minW, startWidth + diff);

      setColumnWidths((prev) => ({
        ...prev,
        [activeColId]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [columnWidths]);

  // Keyboard navigation & scroll-into-view
  const scrollToFocusedCell = useCallback((rowIndex: number) => {
    if (!containerRef.current) return;
    const targetTop = rowIndex * ROW_HEIGHT;
    const headerOffset = 36; // Header height
    const currentTop = containerRef.current.scrollTop;
    const currentBottom = currentTop + containerRef.current.clientHeight - headerOffset;

    if (targetTop < currentTop) {
      containerRef.current.scrollTop = targetTop;
    } else if (targetTop + ROW_HEIGHT > currentBottom) {
      containerRef.current.scrollTop = targetTop + ROW_HEIGHT - containerRef.current.clientHeight + headerOffset;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if (orders.length === 0) return;

      const current = focusedCell || { rowIndex: 0, colIndex: 0 };
      const numCols = DEFAULT_COLUMNS.length;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const nextRow = Math.min(totalRows - 1, current.rowIndex + 1);
          setFocusedCell({ ...current, rowIndex: nextRow });
          scrollToFocusedCell(nextRow);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const nextRow = Math.max(0, current.rowIndex - 1);
          setFocusedCell({ ...current, rowIndex: nextRow });
          scrollToFocusedCell(nextRow);
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const nextCol = Math.min(numCols - 1, current.colIndex + 1);
          setFocusedCell({ ...current, colIndex: nextCol });
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          const nextCol = Math.max(0, current.colIndex - 1);
          setFocusedCell({ ...current, colIndex: nextCol });
          break;
        }
        case ' ': {
          // Space toggles selection on focused row
          e.preventDefault();
          if (orders[current.rowIndex]) {
            onToggleSelect(orders[current.rowIndex].id, false, current.rowIndex);
          }
          break;
        }
        case 'Enter': {
          // Enter opens details drawer for focused row
          e.preventDefault();
          if (orders[current.rowIndex]) {
            onInspectOrder(orders[current.rowIndex]);
          }
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedCell, orders, totalRows, scrollToFocusedCell, onToggleSelect, onInspectOrder]);

  // Selection helpers
  const visibleIds = useMemo(() => orders.map((o) => o.id), [orders]);
  const isAllSelected = orders.length > 0 && orders.every((o) => selectedSet.has(o.id));
  const isSomeSelected = orders.some((o) => selectedSet.has(o.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      onSelectAllVisible([]);
    } else {
      onSelectAllVisible(visibleIds);
    }
  };

  const handleRowSelect = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const order = orders[index];
    if (order) {
      onToggleSelect(order.id, e.shiftKey, index);
    }
  };

  const handleFocusCell = (rowIndex: number, colIndex: number) => {
    setFocusedCell({ rowIndex, colIndex });
  };

  if (totalRows === 0) {
    return (
      <div className="flex-1 flex flex-col bg-slate-900/40 rounded-lg border border-slate-800 overflow-hidden">
        <EmptyState onClearFilters={onClearFilters} totalOrders={totalDatasetCount} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      tabIndex={0}
      className="flex-1 overflow-auto rounded-lg border border-slate-800/80 bg-slate-950/40 focus:outline-none relative"
      style={{ willChange: 'transform' }}
    >
      <GridHeader
        columns={DEFAULT_COLUMNS}
        columnWidths={columnWidths}
        sortState={sortState}
        onSort={onSort}
        pinnedColumn={pinnedColumn}
        onTogglePin={onTogglePin}
        onStartResize={handleStartResize}
        isAllSelected={isAllSelected}
        isSomeSelected={isSomeSelected}
        onToggleSelectAll={handleToggleSelectAll}
      />

      {/* Top Phantom Spacer */}
      <div style={{ height: `${topSpacerHeight}px` }} />

      {/* Virtualized Rows in DOM */}
      {visibleOrders.map((order, i) => {
        const actualIndex = startIndex + i;
        const isSelected = selectedSet.has(order.id);
        const focusedColIndex = focusedCell?.rowIndex === actualIndex ? focusedCell.colIndex : null;

        return (
          <GridRow
            key={order.id}
            order={order}
            rowIndex={actualIndex}
            columns={DEFAULT_COLUMNS}
            columnWidths={columnWidths}
            pinnedColumn={pinnedColumn}
            isSelected={isSelected}
            focusedColIndex={focusedColIndex}
            onSelectRow={handleRowSelect}
            onFocusCell={handleFocusCell}
            onInspectRow={onInspectOrder}
          />
        );
      })}

      {/* Bottom Phantom Spacer */}
      <div style={{ height: `${bottomSpacerHeight}px` }} />
    </div>
  );
};
