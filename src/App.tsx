import React, { useState, useMemo, useCallback } from 'react';
import { useOrders } from './hooks/useOrders';
import { useUrlState } from './hooks/useUrlState';
import { filterOrders } from './data/filterEngine';
import { sortOrders } from './data/sortEngine';
import { exportOrdersToCsv } from './utils/exportCsv';
import { Header } from './components/Header/Header';
import { FilterBuilder } from './components/FilterBuilder/FilterBuilder';
import { ActiveFilterChips } from './components/FilterBuilder/ActiveFilterChips';
import { VirtualDataGrid } from './components/Grid/VirtualDataGrid';
import { OrderDetailDrawer } from './components/DetailDrawer/OrderDetailDrawer';
import type { OrderRecord } from './types/order';
import { AlertTriangle, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const { orders, isLoading, error, statusMessage } = useOrders('/orders.json');
  const {
    filter,
    setFilter,
    sort,
    setSort,
    pinnedColumn,
    setPinnedColumn,
    selectedIds,
    setSelectedIds,
    urlWarning,
    dismissWarning,
  } = useUrlState();

  const [inspectedOrder, setInspectedOrder] = useState<OrderRecord | null>(null);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // 1. Filter orders based on active FilterQuery
  const filteredOrders = useMemo(() => {
    return filterOrders(orders, filter);
  }, [orders, filter]);

  // 2. Sort filtered orders based on active SortState
  const sortedOrders = useMemo(() => {
    return sortOrders(filteredOrders, sort);
  }, [filteredOrders, sort]);

  // 3. Dual-track selection for the "200 rows" operations dilemma:
  // Visible selected orders that match active filter criteria
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleSelectedOrders = useMemo(() => {
    return sortedOrders.filter((o) => selectedSet.has(o.id));
  }, [sortedOrders, selectedSet]);

  // Shift+Click and Single Click selection handler
  const handleToggleSelect = useCallback(
    (id: string, isShift: boolean, index: number) => {
      setSelectedIds((prev) => {
        const prevSet = new Set(prev);

        if (isShift && lastSelectedIndex !== null && sortedOrders.length > 0) {
          // Range selection
          const start = Math.min(lastSelectedIndex, index);
          const end = Math.max(lastSelectedIndex, index);
          const nextSet = new Set(prevSet);

          for (let i = start; i <= end; i++) {
            if (sortedOrders[i]) {
              nextSet.add(sortedOrders[i].id);
            }
          }
          return Array.from(nextSet);
        }

        // Toggle single row
        if (prevSet.has(id)) {
          prevSet.delete(id);
        } else {
          prevSet.add(id);
        }
        setLastSelectedIndex(index);
        return Array.from(prevSet);
      });
    },
    [lastSelectedIndex, sortedOrders, setSelectedIds]
  );

  const handleSelectAllVisible = useCallback(
    (visibleIds: string[]) => {
      setSelectedIds((prev) => {
        if (visibleIds.length === 0) {
          // Deselect all visible rows while preserving out-of-filter selections
          const visibleSet = new Set(sortedOrders.map((o) => o.id));
          return prev.filter((id) => !visibleSet.has(id));
        }

        // Add all visible IDs
        const nextSet = new Set(prev);
        visibleIds.forEach((id) => nextSet.add(id));
        return Array.from(nextSet);
      });
    },
    [sortedOrders, setSelectedIds]
  );

  // Sorting handler: click to sort, click to reverse, click third time to reset
  const handleSort = useCallback(
    (field: keyof OrderRecord) => {
      setSort((prev) => {
        if (!prev || prev.field !== field) {
          return { field, direction: 'asc' };
        }
        if (prev.direction === 'asc') {
          return { field, direction: 'desc' };
        }
        return null;
      });
    },
    [setSort]
  );

  // Column pinning toggle
  const handleTogglePin = useCallback(
    (colId: keyof OrderRecord) => {
      setPinnedColumn(pinnedColumn === colId ? null : colId);
    },
    [pinnedColumn, setPinnedColumn]
  );

  // Filter handlers
  const handleClearAllFilters = useCallback(() => {
    setFilter({ groups: [] });
  }, [setFilter]);

  const handleRemoveChipCondition = useCallback(
    (groupId: string, conditionId: string) => {
      setFilter((prev) => {
        const nextGroups = prev.groups
          .map((g) => {
            if (g.id !== groupId) return g;
            return {
              ...g,
              conditions: g.conditions.filter((c) => c.id !== conditionId),
            };
          })
          .filter((g) => g.conditions.length > 0);

        return { groups: nextGroups };
      });
    },
    [setFilter]
  );

  // CSV Export: Exports currently visible selected orders (20 rows dilemma resolved transparently)
  const handleExport = useCallback(() => {
    exportOrdersToCsv(visibleSelectedOrders);
  }, [visibleSelectedOrders]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <Header
        selectedCount={visibleSelectedOrders.length}
        onExport={handleExport}
        datasetCount={orders.length}
      />

      {/* URL Warning Banner if corrupted parameter was detected */}
      {urlWarning && (
        <div className="bg-amber-950/90 border-b border-amber-800 px-4 py-2 flex items-center justify-between text-xs text-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{urlWarning}</span>
          </div>
          <button
            onClick={dismissWarning}
            className="text-amber-400 hover:text-white underline font-medium cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 flex flex-col p-3 gap-2.5 overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
            <p className="text-sm font-medium text-slate-300">{statusMessage}</p>
            <p className="text-xs text-slate-500 font-mono">Parsing 17MB raw orders dataset...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6">
            <AlertTriangle className="w-10 h-10 text-rose-500 mb-2" />
            <h2 className="text-lg font-semibold text-rose-200">Failed to Load Orders</h2>
            <p className="text-sm text-slate-400 max-w-md">{error}</p>
          </div>
        ) : (
          <>
            {/* Filter Builder Drawer/Bar */}
            <FilterBuilder
              filter={filter}
              onChangeFilter={setFilter}
              onClearAll={handleClearAllFilters}
            />

            {/* Active Filter Chips & Counter Bar */}
            <ActiveFilterChips
              filter={filter}
              onRemoveCondition={handleRemoveChipCondition}
              onClearAll={handleClearAllFilters}
              filteredCount={sortedOrders.length}
              totalCount={orders.length}
              selectedVisibleCount={visibleSelectedOrders.length}
              totalSelectedCount={selectedIds.length}
            />

            {/* Custom Virtualized Data Grid */}
            <VirtualDataGrid
              orders={sortedOrders}
              totalDatasetCount={orders.length}
              sortState={sort}
              onSort={handleSort}
              pinnedColumn={pinnedColumn}
              onTogglePin={handleTogglePin}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAllVisible={handleSelectAllVisible}
              onInspectOrder={setInspectedOrder}
              onClearFilters={handleClearAllFilters}
            />
          </>
        )}
      </main>

      {/* Slide-out Order Detail Drawer */}
      <OrderDetailDrawer
        order={inspectedOrder}
        onClose={() => setInspectedOrder(null)}
      />
    </div>
  );
};

export default App;
