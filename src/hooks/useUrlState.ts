import { useState, useEffect, useCallback, useRef } from 'react';
import type { FilterQuery, SortState, OrderRecord } from '../types/order';

export interface UrlState {
  filter: FilterQuery;
  sort: SortState | null;
  pinnedColumn: keyof OrderRecord | null;
  selectedIds: string[];
}

const DEFAULT_STATE: UrlState = {
  filter: { groups: [] },
  sort: { field: 'createdAtTimestamp', direction: 'desc' },
  pinnedColumn: 'id',
  selectedIds: [],
};

export function useUrlState() {
  const [urlWarning, setUrlWarning] = useState<string | null>(null);

  // Parse initial state from window.location.search with robust fallback
  const parseFromUrl = (): UrlState => {
    try {
      const params = new URLSearchParams(window.location.search);
      const state: UrlState = { ...DEFAULT_STATE };

      // 1. Sort parsing: "field:dir"
      const sortParam = params.get('sort');
      if (sortParam) {
        const [field, dir] = sortParam.split(':');
        if (field && (dir === 'asc' || dir === 'desc')) {
          state.sort = {
            field: field as keyof OrderRecord,
            direction: dir,
          };
        }
      }

      // 2. Pinned column parsing
      const pinnedParam = params.get('pinned');
      if (pinnedParam) {
        state.pinnedColumn = pinnedParam as keyof OrderRecord;
      }

      // 3. Selected rows parsing
      const selParam = params.get('sel');
      if (selParam) {
        state.selectedIds = selParam.split(',').filter(Boolean);
      }

      // 4. Filter query parsing
      const filterParam = params.get('filter');
      if (filterParam) {
        try {
          const parsed = JSON.parse(decodeURIComponent(filterParam));
          if (parsed && Array.isArray(parsed.groups)) {
            state.filter = parsed;
          } else {
            throw new Error('Invalid filter structure');
          }
        } catch (e) {
          console.warn('Failed to parse URL filter parameter:', e);
          setUrlWarning('The filter configuration in the URL was corrupted. Restored default view.');
        }
      }

      return state;
    } catch (err) {
      console.warn('Failed to parse URL state:', err);
      setUrlWarning('Malformed URL parameters detected. Resetting to defaults.');
      return DEFAULT_STATE;
    }
  };

  const [state, setState] = useState<UrlState>(parseFromUrl);
  const debounceTimerRef = useRef<number | null>(null);

  // Sync state to URL in replaceState (debounced to avoid history flood)
  const syncToUrl = useCallback((nextState: UrlState) => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      try {
        const params = new URLSearchParams();

        if (nextState.sort) {
          params.set('sort', `${String(nextState.sort.field)}:${nextState.sort.direction}`);
        }

        if (nextState.pinnedColumn) {
          params.set('pinned', String(nextState.pinnedColumn));
        }

        if (nextState.selectedIds.length > 0) {
          // Keep URL safe and reasonable length
          params.set('sel', nextState.selectedIds.join(','));
        }

        if (nextState.filter.groups.length > 0) {
          params.set('filter', encodeURIComponent(JSON.stringify(nextState.filter)));
        }

        const newSearch = params.toString();
        const newUrl = `${window.location.pathname}${newSearch ? '?' + newSearch : ''}`;
        window.history.replaceState(null, '', newUrl);
      } catch (e) {
        console.error('Failed to update URL search parameters:', e);
      }
    }, 150);
  }, []);

  // Setters
  const setFilter = useCallback((updater: FilterQuery | ((prev: FilterQuery) => FilterQuery)) => {
    setState((prev) => {
      const nextFilter = typeof updater === 'function' ? updater(prev.filter) : updater;
      const next = { ...prev, filter: nextFilter };
      syncToUrl(next);
      return next;
    });
  }, [syncToUrl]);

  const setSort = useCallback((updater: SortState | null | ((prev: SortState | null) => SortState | null)) => {
    setState((prev) => {
      const nextSort = typeof updater === 'function' ? updater(prev.sort) : updater;
      const next = { ...prev, sort: nextSort };
      syncToUrl(next);
      return next;
    });
  }, [syncToUrl]);

  const setPinnedColumn = useCallback((col: keyof OrderRecord | null) => {
    setState((prev) => {
      const next = { ...prev, pinnedColumn: col };
      syncToUrl(next);
      return next;
    });
  }, [syncToUrl]);

  const setSelectedIds = useCallback((updater: string[] | ((prev: string[]) => string[])) => {
    setState((prev) => {
      const nextSel = typeof updater === 'function' ? updater(prev.selectedIds) : updater;
      const next = { ...prev, selectedIds: nextSel };
      syncToUrl(next);
      return next;
    });
  }, [syncToUrl]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setState(parseFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const dismissWarning = () => setUrlWarning(null);

  return {
    filter: state.filter,
    setFilter,
    sort: state.sort,
    setSort,
    pinnedColumn: state.pinnedColumn,
    setPinnedColumn,
    selectedIds: state.selectedIds,
    setSelectedIds,
    urlWarning,
    dismissWarning,
  };
}
