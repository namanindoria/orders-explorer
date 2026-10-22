import type {
  RawOrderRecord,
  OrderRecord,
  OrderStatus,
  Region,
  Channel,
  PaymentMethod,
  Priority,
} from '../types/order';
import { formatINR, formatTimestamp, sanitizePlainText } from './formatters';

/**
 * Parses any of the 4 date formats specified in data-notes.md:
 * 1. ISO with timezone: "2025-03-14T09:30:00.000Z"
 * 2. ISO without timezone: "2025-03-14T09:30:00" (treated as UTC)
 * 3. Epoch seconds as a number: 1741944600
 * 4. Day/month/year string: "14/03/2025" (midnight UTC)
 */
export function parseDateToTimestamp(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') return null;

  // Epoch seconds as a number
  if (typeof raw === 'number') {
    return raw * 1000;
  }

  const str = String(raw).trim();
  if (!str) return null;

  // DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split('/').map(Number);
    return Date.UTC(y, m - 1, d, 0, 0, 0);
  }

  // ISO without timezone (e.g. "2025-03-14T09:30:00") -> treat as UTC
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(str)) {
    const ts = Date.parse(str + 'Z');
    return isNaN(ts) ? null : ts;
  }

  // ISO with timezone or standard parse
  const parsed = Date.parse(str);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Normalizes a single raw record adhering strictly to data-notes.md
 */
export function normalizeRecord(raw: RawOrderRecord): OrderRecord {
  // 1. Unified customer name
  const customerName = (raw.customerName || raw.customer_name || 'Unknown').trim();

  // 2 & 3. Amount unit & string handling
  // Schema v1 stores amount in paise (1 rupee = 100 paise)
  // Schema v2 stores amount in rupees
  let rawAmount = typeof raw.amount === 'string' ? parseFloat(raw.amount) : Number(raw.amount);
  if (isNaN(rawAmount)) rawAmount = 0;

  const amount = raw.schemaVersion === 1 ? rawAmount / 100 : rawAmount;
  const amountFormatted = formatINR(amount);

  // 4 & 5. Date parsing
  const createdAtTimestamp = parseDateToTimestamp(raw.createdAt) ?? 0;
  const createdAtFormatted = formatTimestamp(createdAtTimestamp);

  const updatedAtTimestamp = parseDateToTimestamp(raw.updatedAt);
  const updatedAtFormatted = formatTimestamp(updatedAtTimestamp);

  // 6. Inconsistent casing for status and region
  const normalizedStatus = (raw.status || 'pending').trim().toLowerCase() as OrderStatus;
  const normalizedRegion = (raw.region || 'NORTH').trim().toUpperCase() as Region;
  const normalizedChannel = (raw.channel || 'web').trim().toLowerCase() as Channel;
  const normalizedPayment = (raw.paymentMethod || 'upi').trim().toLowerCase() as PaymentMethod;

  // 8. Priority handling
  let priority: Priority = null;
  let priorityLabel = 'None';
  if (raw.priority === 1 || raw.priority === 2 || raw.priority === 3) {
    priority = raw.priority;
    priorityLabel = priority === 1 ? '1 (High)' : priority === 2 ? '2 (Medium)' : '3 (Low)';
  }

  // 9. Notes sanitized
  const notes = sanitizePlainText(raw.notes);

  // 10. Currency trimmed
  const currency = (raw.currency || 'INR').trim();

  return {
    id: raw.id,
    schemaVersion: raw.schemaVersion,
    customerName,
    customerEmail: (raw.customerEmail || '').trim(),
    status: normalizedStatus,
    amount,
    amountFormatted,
    currency,
    createdAtTimestamp,
    createdAtFormatted,
    updatedAtTimestamp,
    updatedAtFormatted,
    region: normalizedRegion,
    channel: normalizedChannel,
    priority,
    priorityLabel,
    paymentMethod: normalizedPayment,
    itemCount: Number(raw.itemCount) || 1,
    notes,
  };
}

/**
 * Normalizes and deduplicates the complete raw dataset in accordance with:
 * "About 30 order IDs are present in two records. The grid should show each ID once.
 *  Keep only one of each pair:
 *  - If both records have an updatedAt, keep the one with the later updatedAt.
 *  - If only one has an updatedAt, keep that one.
 *  - If neither has one, keep the one that appears later in the file."
 */
export function normalizeAndDeduplicateOrders(rawList: RawOrderRecord[]): OrderRecord[] {
  interface Candidate {
    record: OrderRecord;
    index: number;
    updatedAtTs: number | null;
  }

  const idMap = new Map<string, Candidate>();

  for (let i = 0; i < rawList.length; i++) {
    const raw = rawList[i];
    const normalized = normalizeRecord(raw);
    const existing = idMap.get(normalized.id);

    if (!existing) {
      idMap.set(normalized.id, {
        record: normalized,
        index: i,
        updatedAtTs: normalized.updatedAtTimestamp,
      });
      continue;
    }

    const currentTs = normalized.updatedAtTimestamp;
    const prevTs = existing.updatedAtTs;

    let replace = false;
    if (currentTs !== null && prevTs !== null) {
      if (currentTs > prevTs) replace = true;
    } else if (currentTs !== null && prevTs === null) {
      replace = true;
    } else if (currentTs === null && prevTs === null) {
      // Both lack updatedAt, keep the one appearing later in file
      replace = true;
    }

    if (replace) {
      idMap.set(normalized.id, {
        record: normalized,
        index: i,
        updatedAtTs: currentTs,
      });
    }
  }

  return Array.from(idMap.values()).map((c) => c.record);
}
