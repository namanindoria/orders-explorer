/**
 * Indian Number / Currency Formatter (e.g. ₹1,23,456.50)
 */
const inrCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0.00';
  return inrCurrencyFormatter.format(amount);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Consistent date formatting across the entire app.
 * Output: "14 Mar 2025, 09:30 UTC"
 */
export function formatTimestamp(timestamp: number | null): string {
  if (timestamp === null || isNaN(timestamp)) return '-';
  const d = new Date(timestamp);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes} UTC`;
}

/**
 * Format timestamp as YYYY-MM-DD for native <input type="date">
 */
export function formatTimestampToDateInput(timestamp: number | null): string {
  if (timestamp === null || isNaN(timestamp)) return '';
  const d = new Date(timestamp);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Sanitizes notes to ensure plain text rendering only.
 * Strips HTML tags or entities safely so malicious scripts or broken markup cannot execute.
 */
export function sanitizePlainText(raw: string | null | undefined): string {
  if (!raw) return '';
  // Strip any HTML tags
  const stripped = raw.replace(/<[^>]*>?/gm, '');
  return stripped.trim();
}
