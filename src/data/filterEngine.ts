import type { OrderRecord, FilterQuery, FilterGroup, FilterCondition } from '../types/order';

/**
 * Checks whether an order satisfies a single condition.
 */
export function evaluateCondition(order: OrderRecord, condition: FilterCondition): boolean {
  const { field, operator, value } = condition;

  // If value is null, undefined, or empty string (unless operator handles empty), condition is inactive/matches
  if (value === null || value === undefined || value === '') {
    return true;
  }

  switch (field) {
    case 'id':
    case 'customerName':
    case 'customerEmail':
    case 'notes': {
      const targetStr = (order[field] || '').toLowerCase();
      const queryStr = String(value).toLowerCase().trim();
      if (!queryStr) return true;

      if (operator === 'contains') {
        return targetStr.includes(queryStr);
      } else if (operator === 'does_not_contain') {
        return !targetStr.includes(queryStr);
      } else if (operator === 'equals') {
        return targetStr === queryStr;
      }
      return true;
    }

    case 'amount':
    case 'itemCount': {
      const numValue = order[field];
      if (operator === 'between') {
        if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
          const min = value.min !== '' && value.min !== null ? Number(value.min) : -Infinity;
          const max = value.max !== '' && value.max !== null ? Number(value.max) : Infinity;
          return numValue >= min && numValue <= max;
        }
        return true;
      }
      const targetNum = Number(value);
      if (isNaN(targetNum)) return true;

      if (operator === 'equals') return numValue === targetNum;
      if (operator === 'greater_than') return numValue > targetNum;
      if (operator === 'less_than') return numValue < targetNum;
      return true;
    }

    case 'createdAt':
    case 'updatedAt': {
      const ts = field === 'createdAt' ? order.createdAtTimestamp : order.updatedAtTimestamp;

      // Special case: if updatedAt is null, comparisons evaluate to false unless comparing null
      if (ts === null) {
        return false;
      }

      if (operator === 'between') {
        if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
          const minStr = String(value.min || '').trim();
          const maxStr = String(value.max || '').trim();
          const minTs = minStr ? Date.parse(minStr + 'T00:00:00Z') : -Infinity;
          // Set max to end of the day 23:59:59.999Z so selecting the same date includes the whole day
          const maxTs = maxStr ? Date.parse(maxStr + 'T23:59:59.999Z') : Infinity;
          return ts >= minTs && ts <= maxTs;
        }
        return true;
      }

      const dateStr = String(value).trim();
      if (!dateStr) return true;

      if (operator === 'before') {
        // Before date starts at 00:00:00 UTC
        const compTs = Date.parse(dateStr + 'T00:00:00Z');
        return isNaN(compTs) ? true : ts < compTs;
      } else if (operator === 'after') {
        // After date ends at 23:59:59.999 UTC
        const compTs = Date.parse(dateStr + 'T23:59:59.999Z');
        return isNaN(compTs) ? true : ts > compTs;
      }
      return true;
    }

    case 'status':
    case 'region':
    case 'channel':
    case 'paymentMethod':
    case 'priority': {
      // Pick one or more from list (value is string[] or (number | string)[])
      if (Array.isArray(value)) {
        if (value.length === 0) return true; // empty selection matches all
        if (field === 'priority') {
          // priority can be 1, 2, 3 or null ('None')
          const stringified = order.priority === null ? 'None' : String(order.priority);
          return value.map(String).includes(stringified);
        }
        return value.includes(order[field] as string);
      }
      return true;
    }

    default:
      return true;
  }
}

/**
 * Evaluates a single filter group. Conditions inside the group are combined with OR.
 * If a group has no conditions, it evaluates to true.
 */
export function evaluateGroup(order: OrderRecord, group: FilterGroup): boolean {
  if (!group.conditions || group.conditions.length === 0) {
    return true;
  }
  // OR logic: true if ANY condition matches
  return group.conditions.some((condition) => evaluateCondition(order, condition));
}

/**
 * Evaluates the full filter query. Groups are combined with AND.
 */
export function evaluateFilterQuery(order: OrderRecord, query: FilterQuery): boolean {
  if (!query.groups || query.groups.length === 0) {
    return true;
  }
  // AND logic: true if ALL groups match
  return query.groups.every((group) => evaluateGroup(order, group));
}

/**
 * Filter an array of orders given a FilterQuery
 */
export function filterOrders(orders: OrderRecord[], query: FilterQuery): OrderRecord[] {
  // Fast path if query has no active conditions
  const hasActiveConditions = query.groups.some(
    (g) =>
      g.conditions &&
      g.conditions.some((c) => {
        if (c.value === null || c.value === undefined || c.value === '') return false;
        if (Array.isArray(c.value) && c.value.length === 0) return false;
        if (typeof c.value === 'object' && 'min' in c.value && 'max' in c.value) {
          return c.value.min !== '' || c.value.max !== '';
        }
        return true;
      })
  );

  if (!hasActiveConditions) {
    return orders;
  }

  const result: OrderRecord[] = [];
  for (let i = 0; i < orders.length; i++) {
    if (evaluateFilterQuery(orders[i], query)) {
      result.push(orders[i]);
    }
  }
  return result;
}
