import type { OrderRecord, SortState } from '../types/order';

/**
 * Sorts an array of orders according to SortState.
 * Adheres strictly to:
 * - Dates sort as dates (using epoch timestamp)
 * - Amounts sort as numbers
 * - Text sorts as text (case-insensitive localeCompare)
 * - For updatedAt, null values ALWAYS sort to the bottom (last)
 */
export function sortOrders(orders: OrderRecord[], sortState: SortState | null): OrderRecord[] {
  if (!sortState) {
    return orders;
  }

  const { field, direction } = sortState;
  const multiplier = direction === 'asc' ? 1 : -1;

  // Clone array to prevent mutating source
  const sorted = [...orders];

  sorted.sort((a, b) => {
    // Special rule 5 from data-notes.md:
    // "updatedAt is sometimes null and sometimes missing... When sorting by this column, these rows go last."
    if (field === 'updatedAtTimestamp' || field === 'updatedAtFormatted') {
      const aVal = a.updatedAtTimestamp;
      const bVal = b.updatedAtTimestamp;

      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1; // a goes last
      if (bVal === null) return -1; // b goes last

      return (aVal - bVal) * multiplier;
    }

    // Date sorting
    if (field === 'createdAtTimestamp' || field === 'createdAtFormatted') {
      return (a.createdAtTimestamp - b.createdAtTimestamp) * multiplier;
    }

    // Number sorting: amount, itemCount
    if (field === 'amount' || field === 'amountFormatted') {
      return (a.amount - b.amount) * multiplier;
    }
    if (field === 'itemCount') {
      return (a.itemCount - b.itemCount) * multiplier;
    }

    // Priority sorting: 1 (High) < 2 (Medium) < 3 (Low) < null (None goes last)
    if (field === 'priority' || field === 'priorityLabel') {
      const aPrio = a.priority ?? 999;
      const bPrio = b.priority ?? 999;
      return (aPrio - bPrio) * multiplier;
    }

    // String / Text sorting
    const valA = String(a[field] ?? '').toLowerCase();
    const valB = String(b[field] ?? '').toLowerCase();

    return valA.localeCompare(valB) * multiplier;
  });

  return sorted;
}
