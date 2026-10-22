import type { FilterFieldType, FilterOperator } from '../../types/order';

export interface FieldConfig {
  id: string;
  label: string;
  type: FilterFieldType;
  operators: { id: FilterOperator; label: string }[];
  options?: { value: string; label: string }[];
}

export const FILTER_FIELDS: FieldConfig[] = [
  {
    id: 'id',
    label: 'Order ID',
    type: 'text',
    operators: [
      { id: 'contains', label: 'contains' },
      { id: 'does_not_contain', label: 'does not contain' },
      { id: 'equals', label: 'equals' },
    ],
  },
  {
    id: 'customerName',
    label: 'Customer Name',
    type: 'text',
    operators: [
      { id: 'contains', label: 'contains' },
      { id: 'does_not_contain', label: 'does not contain' },
      { id: 'equals', label: 'equals' },
    ],
  },
  {
    id: 'customerEmail',
    label: 'Customer Email',
    type: 'text',
    operators: [
      { id: 'contains', label: 'contains' },
      { id: 'does_not_contain', label: 'does not contain' },
      { id: 'equals', label: 'equals' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    type: 'enum',
    operators: [{ id: 'is_one_of', label: 'is one of' }],
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'processing', label: 'Processing' },
      { value: 'shipped', label: 'Shipped' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    id: 'amount',
    label: 'Amount (₹)',
    type: 'number',
    operators: [
      { id: 'equals', label: 'equals' },
      { id: 'greater_than', label: 'greater than' },
      { id: 'less_than', label: 'less than' },
      { id: 'between', label: 'between' },
    ],
  },
  {
    id: 'createdAt',
    label: 'Created Date',
    type: 'date',
    operators: [
      { id: 'before', label: 'before' },
      { id: 'after', label: 'after' },
      { id: 'between', label: 'between' },
    ],
  },
  {
    id: 'updatedAt',
    label: 'Updated Date',
    type: 'date',
    operators: [
      { id: 'before', label: 'before' },
      { id: 'after', label: 'after' },
      { id: 'between', label: 'between' },
    ],
  },
  {
    id: 'region',
    label: 'Region',
    type: 'enum',
    operators: [{ id: 'is_one_of', label: 'is one of' }],
    options: [
      { value: 'NORTH', label: 'North' },
      { value: 'SOUTH', label: 'South' },
      { value: 'EAST', label: 'East' },
      { value: 'WEST', label: 'West' },
      { value: 'CENTRAL', label: 'Central' },
      { value: 'NORTHEAST', label: 'Northeast' },
    ],
  },
  {
    id: 'channel',
    label: 'Channel',
    type: 'enum',
    operators: [{ id: 'is_one_of', label: 'is one of' }],
    options: [
      { value: 'web', label: 'Web' },
      { value: 'app', label: 'App' },
      { value: 'phone', label: 'Phone' },
      { value: 'store', label: 'Store' },
    ],
  },
  {
    id: 'priority',
    label: 'Priority',
    type: 'enum',
    operators: [{ id: 'is_one_of', label: 'is one of' }],
    options: [
      { value: '1', label: '1 (High)' },
      { value: '2', label: '2 (Medium)' },
      { value: '3', label: '3 (Low)' },
      { value: 'None', label: 'None' },
    ],
  },
  {
    id: 'paymentMethod',
    label: 'Payment Method',
    type: 'enum',
    operators: [{ id: 'is_one_of', label: 'is one of' }],
    options: [
      { value: 'upi', label: 'UPI' },
      { value: 'card', label: 'Card' },
      { value: 'netbanking', label: 'Netbanking' },
      { value: 'cod', label: 'Cash on Delivery (COD)' },
      { value: 'wallet', label: 'Wallet' },
    ],
  },
  {
    id: 'itemCount',
    label: 'Item Count',
    type: 'number',
    operators: [
      { id: 'equals', label: 'equals' },
      { id: 'greater_than', label: 'greater than' },
      { id: 'less_than', label: 'less than' },
      { id: 'between', label: 'between' },
    ],
  },
  {
    id: 'notes',
    label: 'Staff Notes',
    type: 'text',
    operators: [
      { id: 'contains', label: 'contains' },
      { id: 'does_not_contain', label: 'does not contain' },
      { id: 'equals', label: 'equals' },
    ],
  },
];
