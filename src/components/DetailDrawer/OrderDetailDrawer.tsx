import React, { useEffect } from 'react';
import type { OrderRecord } from '../../types/order';
import { X, Copy, Check, Clock, User, DollarSign, ShieldAlert, Tag, Calendar } from 'lucide-react';

interface OrderDetailDrawerProps {
  order: OrderRecord | null;
  onClose: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({ order, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60';
      case 'shipped':
        return 'bg-blue-950/80 text-blue-400 border-blue-700/60';
      case 'processing':
        return 'bg-amber-950/80 text-amber-400 border-amber-700/60';
      case 'pending':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-700/60';
      case 'cancelled':
        return 'bg-rose-950/80 text-rose-400 border-rose-700/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer content */}
      <aside className="relative w-[440px] max-w-[90vw] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full z-10 text-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-bold text-base text-sky-400 tracking-wider">
              {order.id}
            </span>
            <button
              onClick={handleCopyId}
              title="Copy Order ID"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              v{order.schemaVersion}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">[Esc]</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Status & Priority Badge Banner */}
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${getStatusColor(order.status)}`}>
              {order.status}
            </div>

            <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300">
              Priority: <span className="font-bold text-white">{order.priorityLabel}</span>
            </div>
          </div>

          {/* Amount Card */}
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>TOTAL ORDER AMOUNT</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {order.amountFormatted}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              {order.schemaVersion === 1 ? 'Converted from Schema v1 (original in paise)' : 'Schema v2 (original in rupees)'}
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Customer Information</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Name</span>
                <span className="font-medium text-slate-200 text-sm">{order.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Email</span>
                <span className="font-mono text-slate-300">{order.customerEmail || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Logistics & Channel */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-sky-400" />
              <span>Logistics &amp; Attribution</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-md bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px] uppercase">Region</span>
                <span className="font-semibold text-slate-200">{order.region}</span>
              </div>
              <div className="p-3 rounded-md bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px] uppercase">Channel</span>
                <span className="font-semibold text-slate-200 uppercase">{order.channel}</span>
              </div>
              <div className="p-3 rounded-md bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px] uppercase">Payment Method</span>
                <span className="font-semibold text-slate-200 uppercase">{order.paymentMethod}</span>
              </div>
              <div className="p-3 rounded-md bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px] uppercase">Item Count</span>
                <span className="font-semibold text-slate-200 font-mono">{order.itemCount} items</span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>Timeline</span>
            </div>
            <div className="p-3 rounded-md bg-slate-950/40 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Created At:</span>
                <span className="font-mono text-slate-200">{order.createdAtFormatted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Updated At:</span>
                <span className="font-mono text-slate-200">{order.updatedAtFormatted}</span>
              </div>
            </div>
          </div>

          {/* Notes Section (Sanitized Plain Text) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Staff Notes</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {order.notes ? `${order.notes.length} chars` : 'Empty'}
              </span>
            </div>

            <div className="p-3 rounded-md bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap break-words max-h-48 overflow-y-auto selection:bg-sky-500/30">
              {order.notes || <span className="italic text-slate-600">No staff notes recorded for this order.</span>}
            </div>
            
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <ShieldAlert className="w-3 h-3 text-emerald-500" />
              <span>Rendered safely as plain text (HTML tags stripped).</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-md transition-colors"
          >
            Close Panel
          </button>
        </div>
      </aside>
    </div>
  );
};
