import type { OrderRecord } from '../types/order';

/**
 * Escapes a cell value for standard CSV format (RFC 4180).
 */
function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  // Replace double quotes with pair of double quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Exports an array of OrderRecord objects to a downloadable CSV file.
 */
export function exportOrdersToCsv(orders: OrderRecord[], filename?: string): void {
  if (!orders || orders.length === 0) {
    alert('No rows selected for export.');
    return;
  }

  const headers = [
    'Order ID',
    'Schema Version',
    'Customer Name',
    'Customer Email',
    'Status',
    'Amount (Rupees)',
    'Amount Formatted',
    'Currency',
    'Created At',
    'Updated At',
    'Region',
    'Channel',
    'Priority',
    'Payment Method',
    'Item Count',
    'Notes',
  ];

  const rows = orders.map((o) => [
    escapeCsvCell(o.id),
    escapeCsvCell(o.schemaVersion),
    escapeCsvCell(o.customerName),
    escapeCsvCell(o.customerEmail),
    escapeCsvCell(o.status),
    escapeCsvCell(o.amount.toFixed(2)),
    escapeCsvCell(o.amountFormatted),
    escapeCsvCell(o.currency),
    escapeCsvCell(o.createdAtFormatted),
    escapeCsvCell(o.updatedAtFormatted),
    escapeCsvCell(o.region),
    escapeCsvCell(o.channel),
    escapeCsvCell(o.priorityLabel),
    escapeCsvCell(o.paymentMethod),
    escapeCsvCell(o.itemCount),
    escapeCsvCell(o.notes),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const defaultName = `orders_export_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', filename || defaultName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
