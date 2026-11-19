import {useState, type FormEvent} from 'react';
import {CheckCircle2, Copy, MessageSquare, Minus, Plus, ShoppingBag, Trash2, X} from 'lucide-react';
import {CONTACT_PHONE} from '../data/catalog';
import type {BagItem} from '../types/store';
import {ProductImage} from './ProductImage';

interface BagDrawerProps {
  open: boolean;
  items: BagItem[];
  promoCode: string;
  promoDiscount: number;
  onClose: () => void;
  onUpdateQty: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearBag: () => void;
}

export function BagDrawer({
  open,
  items,
  promoCode,
  promoDiscount,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearBag,
}: BagDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [postcode, setPostcode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const appliedDiscount = items.length > 0 ? Math.min(subtotal, promoDiscount) : 0;
  const total = Math.max(0, subtotal - appliedDiscount);

  const itemsSummary = items
    .map((item) => `${item.quantity}x ${item.brand} ${item.name} (${item.selectedOption}) @ £${item.unitPrice}`)
    .join('; ');

  const smsOrderText = `Hi RepsForLess! Order ${confirmedRef || 'Request'}: ${itemsSummary}. Total: £${total}${
    promoCode ? ` (Code: ${promoCode})` : ''
  }. Name: ${customerName || 'Customer'}, Postcode: ${postcode || 'UK'}, Payment: ${paymentMethod}.`;

  async function handleCheckout(e: FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/orders/inquiry', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          customerName,
          phone,
          postcode,
          paymentMethod,
          itemsSummary,
          subtotal,
          discountApplied: appliedDiscount,
          promoCode: promoCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not confirm order request.');
      } else {
        setConfirmedRef(data.order?.reference || 'RFL-1041');
      }
    } catch {
      setError('Network error while submitting order.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-[#18181b]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[#CCFF00]" aria-hidden="true" />
            <h2 className="font-display text-2xl font-black text-white">Your Bag</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="p-2 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {confirmedRef ? (
            <div className="border border-[#CCFF00]/40 bg-[#141416] p-5 space-y-4">
              <div className="flex items-center gap-2 text-[#CCFF00] font-semibold">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>Order Logged · #{confirmedRef}</span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Your order summary for <span className="font-mono font-bold text-white">£{total}</span> is saved. Tap below to send this directly via SMS to {CONTACT_PHONE} for instant stock confirmation and UK Bank Transfer details.
              </p>
              <div className="border border-zinc-800 bg-[#1a1a1e] p-3 font-mono text-xs text-zinc-300 break-words">
                {smsOrderText}
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={`sms:${CONTACT_PHONE}?body=${encodeURIComponent(smsOrderText)}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#CCFF00] px-4 py-3 text-xs font-bold text-[#141416]"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Send Order to {CONTACT_PHONE}</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(smsOrderText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  }}
                  className="inline-flex items-center justify-center gap-2 border border-zinc-700 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:border-zinc-500 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copied ? 'Copied Summary' : 'Copy Order Text'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedRef(null);
                    onClearBag();
                    onClose();
                  }}
                  className="text-xs text-zinc-400 hover:text-white pt-1 cursor-pointer"
                >
                  Clear Bag &amp; Continue Shopping
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl font-bold text-white mb-2">Your bag is empty</p>
              <p className="text-sm text-zinc-400 mb-6">
                Add trainers, watches, 925 jewellery, or belts to build an instant text-to-order summary.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="bg-[#CCFF00] px-5 py-2.5 text-xs font-bold text-[#141416] cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-zinc-800 border-y border-zinc-800">
                {items.map((item) => (
                  <div key={item.key} className="py-4 flex gap-3.5">
                    <div className="h-16 w-20 shrink-0 overflow-hidden border border-zinc-800 bg-[#141416]">
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.key)}
                          aria-label={`Remove ${item.name}`}
                          className="text-zinc-500 hover:text-red-400 cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-400 truncate mb-2">{item.selectedOption}</p>
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center border border-zinc-700 bg-[#141416]">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.key, -1)}
                            aria-label="Decrease item quantity"
                            className="h-7 w-7 inline-flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center font-mono text-xs text-white tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.key, 1)}
                            aria-label="Increase item quantity"
                            className="h-7 w-7 inline-flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-mono text-sm font-bold text-[#CCFF00] tabular-nums">
                          £{item.unitPrice * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">£{subtotal}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-[#CCFF00]">
                    <span>Scratch Card ({promoCode})</span>
                    <span className="font-mono tabular-nums">-£{appliedDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>UK Delivery (5–10 working days)</span>
                  <span className="font-mono">Included</span>
                </div>
                <div className="flex justify-between border-t border-zinc-800 pt-2 text-base font-bold text-white">
                  <span>Total</span>
                  <span className="font-mono text-[#CCFF00] tabular-nums">£{total}</span>
                </div>
              </div>

              {/* Reservation / Order Verification Form */}
              <form onSubmit={handleCheckout} className="space-y-3 border-t border-zinc-800 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Confirm UK Order Details
                </p>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  aria-label="Full Name"
                  className="w-full border border-zinc-700 bg-[#141416] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="UK Mobile (07...)"
                    aria-label="UK Mobile"
                    className="w-full border border-zinc-700 bg-[#141416] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="Postcode"
                    aria-label="UK Postcode"
                    className="w-full border border-zinc-700 bg-[#141416] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none uppercase"
                  />
                </div>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  aria-label="Preferred payment method"
                  className="w-full border border-zinc-700 bg-[#141416] px-3 py-2 text-sm text-white focus:border-[#CCFF00] focus:outline-none"
                >
                  <option value="Bank Transfer">Payment: UK Bank Transfer</option>
                </select>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#CCFF00] px-5 py-3 text-sm font-bold text-[#141416] hover:bg-[#d8ff33] transition-colors cursor-pointer"
                >
                  {submitting ? 'Generating Order Reference...' : `Confirm Order · £${total}`}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
