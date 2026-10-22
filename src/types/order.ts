export type SchemaVersion = 1 | 2;

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type Region = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'CENTRAL' | 'NORTHEAST';

export type Channel = 'web' | 'app' | 'phone' | 'store';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod' | 'wallet';

export type Priority = 1 | 2 | 3 | null; // null represents 'None'

/** Raw record shape coming directly from orders.json */
export interface RawOrderRecord {
  id: string;
  schemaVersion: SchemaVersion;
  customerName?: string;
  customer_name?: string;
  customerEmail: string;
  status: string;
  amount: number | string;
  currency: string;
  createdAt: string | number;
  updatedAt?: string | null;
  region: string;
  channel: string;
  priority?: number | null;
  paymentMethod: string;
  itemCount: number;
  notes?: string | null;
}

/** Normalized and clean order record used across the UI, grid, and filter engine */
export interface OrderRecord {
  id: string;
  schemaVersion: SchemaVersion;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  amount: number; // In Rupees
  amountFormatted: string; // Indian currency format e.g. ₹1,23,456.50
  currency: string; // 'INR'
  createdAtTimestamp: number; // Epoch timestamp (ms) for fast sorting and filtering
  createdAtFormatted: string; // Consistent date string
  updatedAtTimestamp: number | null; // Epoch timestamp (ms) or null
  updatedAtFormatted: string; // Formatted date string or '-'
  region: Region;
  channel: Channel;
  priority: Priority; // 1, 2, 3 or null
  priorityLabel: string; // '1 (High)', '2 (Medium)', '3 (Low)', or 'None'
  paymentMethod: PaymentMethod;
  itemCount: number;
  notes: string; // Plain text, sanitized
}

export type OrderField = keyof OrderRecord;

export type FilterFieldType = 'text' | 'number' | 'date' | 'enum';

export type TextOperator = 'contains' | 'does_not_contain' | 'equals';
export type NumberOperator = 'equals' | 'greater_than' | 'less_than' | 'between';
export type DateOperator = 'before' | 'after' | 'between';
export type EnumOperator = 'is_one_of';

export type FilterOperator = TextOperator | NumberOperator | DateOperator | EnumOperator;

export interface FilterCondition {
  id: string;
  field: 'id' | 'customerName' | 'customerEmail' | 'status' | 'amount' | 'createdAt' | 'updatedAt' | 'region' | 'channel' | 'priority' | 'paymentMethod' | 'itemCount' | 'notes';
  operator: FilterOperator;
  value: string | number | string[] | { min: number | string; max: number | string } | null;
}

export interface FilterGroup {
  id: string;
  conditions: FilterCondition[]; // Combined with OR
}

export interface FilterQuery {
  groups: FilterGroup[]; // Groups combined with AND
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: keyof OrderRecord;
  direction: SortDirection;
}

export interface ColumnDefinition {
  id: keyof OrderRecord;
  header: string;
  width: number;
  minWidth: number;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
}
