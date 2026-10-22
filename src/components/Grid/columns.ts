import type { ColumnDefinition } from '../../types/order';

export const DEFAULT_COLUMNS: ColumnDefinition[] = [
  { id: 'id', header: 'Order ID', width: 140, minWidth: 100, align: 'left', sortable: true },
  { id: 'customerName', header: 'Customer', width: 160, minWidth: 120, align: 'left', sortable: true },
  { id: 'status', header: 'Status', width: 110, minWidth: 90, align: 'center', sortable: true },
  { id: 'amount', header: 'Amount', width: 130, minWidth: 100, align: 'right', sortable: true },
  { id: 'createdAtTimestamp', header: 'Created At', width: 170, minWidth: 140, align: 'left', sortable: true },
  { id: 'updatedAtTimestamp', header: 'Updated At', width: 170, minWidth: 140, align: 'left', sortable: true },
  { id: 'region', header: 'Region', width: 110, minWidth: 80, align: 'left', sortable: true },
  { id: 'channel', header: 'Channel', width: 100, minWidth: 80, align: 'left', sortable: true },
  { id: 'priority', header: 'Priority', width: 110, minWidth: 90, align: 'center', sortable: true },
  { id: 'paymentMethod', header: 'Payment', width: 110, minWidth: 80, align: 'left', sortable: true },
  { id: 'itemCount', header: 'Items', width: 80, minWidth: 60, align: 'right', sortable: true },
  { id: 'notes', header: 'Notes', width: 220, minWidth: 140, align: 'left', sortable: false },
];
