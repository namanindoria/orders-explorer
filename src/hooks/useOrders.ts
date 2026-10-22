import { useState, useEffect } from 'react';
import type { OrderRecord, RawOrderRecord } from '../types/order';
import { normalizeAndDeduplicateOrders } from '../data/normalize';

export function useOrders(jsonUrl = '/orders.json') {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Initializing dataset...');

  useEffect(() => {
    let isMounted = true;
    let worker: Worker | null = null;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      setStatusMessage('Loading 50,000 orders...');

      // Try loading via Web Worker to keep main thread completely unblocked
      try {
        if (typeof Worker !== 'undefined') {
          worker = new Worker(new URL('../workers/dataWorker.ts', import.meta.url), {
            type: 'module',
          });

          worker.onmessage = (e: MessageEvent) => {
            if (!isMounted) return;
            if (e.data.type === 'DATA_LOADED') {
              setOrders(e.data.orders);
              setIsLoading(false);
              setStatusMessage(`Ready: ${e.data.count.toLocaleString()} orders`);
            } else if (e.data.type === 'DATA_ERROR') {
              console.warn('Worker error, falling back to main thread fetch:', e.data.error);
              fallbackFetch();
            }
          };

          worker.onerror = (e) => {
            console.warn('Worker initialization error, falling back to main thread:', e);
            fallbackFetch();
          };

          worker.postMessage({ type: 'LOAD_DATA', url: jsonUrl });
          return;
        }
      } catch (err) {
        console.warn('Worker spawn failed, using main thread fallback:', err);
      }

      fallbackFetch();
    }

    async function fallbackFetch() {
      try {
        setStatusMessage('Fetching orders directly...');
        const res = await fetch(jsonUrl);
        if (!res.ok) {
          throw new Error(`Failed to load dataset: ${res.status} ${res.statusText}`);
        }
        setStatusMessage('Parsing 17MB JSON...');
        const raw: RawOrderRecord[] = await res.json();
        setStatusMessage('Sanitizing and deduplicating records...');
        const cleaned = normalizeAndDeduplicateOrders(raw);

        if (isMounted) {
          setOrders(cleaned);
          setIsLoading(false);
          setStatusMessage(`Ready: ${cleaned.length.toLocaleString()} orders`);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load orders dataset.');
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
      if (worker) {
        worker.terminate();
      }
    };
  }, [jsonUrl]);

  return { orders, isLoading, error, statusMessage };
}
