import { normalizeAndDeduplicateOrders } from '../data/normalize';
import type { RawOrderRecord } from '../types/order';

self.onmessage = async (e: MessageEvent) => {
  const { type, url } = e.data;

  if (type === 'LOAD_DATA') {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load dataset: HTTP ${response.status}`);
      }
      const rawData: RawOrderRecord[] = await response.json();
      const cleaned = normalizeAndDeduplicateOrders(rawData);

      self.postMessage({
        type: 'DATA_LOADED',
        orders: cleaned,
        count: cleaned.length,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown worker error';
      self.postMessage({
        type: 'DATA_ERROR',
        error: message,
      });
    }
  }
};
