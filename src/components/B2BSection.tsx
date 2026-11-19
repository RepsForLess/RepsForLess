import {useState, type FormEvent} from 'react';
import {CheckCircle2, MessageSquare, Package, ShieldCheck, TrendingUp, Zap} from 'lucide-react';
import {CATEGORY_IMAGES, CONTACT_PHONE} from '../data/catalog';
import {ProductImage} from './ProductImage';

const SELLING_POINTS = [
  {
    icon: Package,
    title: 'Flexible Parcel Sizes',
    text: 'Start from 25 watches for weekend market stalls or scale to 250+ mixed trays.',
  },
  {
    icon: TrendingUp,
    title: 'Strong Resale Margin',
    text: 'Unit costs from £3.00–£5.00 against typical UK street resale of £15–£50 per watch.',
  },
  {
    icon: Zap,
    title: 'Fast UK Stock Dispatch',
    text: 'Packed in protective multi-watch trays and dispatched across the UK within 5–10 working days.',
  },
  {
    icon: ShieldCheck,
    title: 'Tested Movements',
    text: 'Every quartz and automatic piece is battery-checked and inspected before dispatch.',
  },
];

export function B2BSection() {
  const [quantity, setQuantity] = useState(100);
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [quoteRef, setQuoteRef] = useState<string | null>(null);
  const [error, setError] = useState('');

  const unitPrice = quantity >= 250 ? 3.0 : quantity >= 100 ? 3.5 : quantity >= 50 ? 4.25 : 5.0;
  const totalCost = Number((quantity * unitPrice).toFixed(2));
  const estResaleLow = quantity * 15;
  const estResaleHigh = quantity * 40;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/b2b/quote', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({businessName, contactName, phone, quantity, notes}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to submit wholesale inquiry.');
      } else {
        setQuoteRef(data.quote?.reference || 'B2B-CONFIRMED');
      }
    } catch {
      setError('Network error while submitting quote request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="b2b" className="relative overflow-hidden border-b border-zinc-800/80 bg-[#18181b]/42 py-16">
      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Wholesale Pitch & Interactive Margin Calculator */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#CCFF00] mb-2">
                Business to Business Wholesale
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
                B2B Wholesale Watch Stock
              </h2>
              <p className="text-base text-zinc-300 leading-relaxed max-w-2xl">
                Built for UK retailers, market stall traders, car boot sellers, and independent resellers. Source mixed watch trays from <span className="font-mono font-bold text-[#CCFF00]">£3.00</span> per unit with typical resale values of £15–£50 each.
              </p>
            </div>

            {/* Interactive Volume Pricing Calculator */}
            <div className="border border-zinc-800 bg-[#141416]/95 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <label htmlFor="b2b-qty-slider" className="text-sm font-semibold text-white">
                  Parcel Quantity: <span className="font-mono text-[#CCFF00] tabular-nums">{quantity} watches</span>
                </label>
                <div className="flex gap-1.5">
                  {[25, 50, 100, 250].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuantity(preset)}
                      className={`px-2.5 py-1 font-mono text-xs font-bold border cursor-pointer tabular-nums ${
                        quantity === preset
                          ? 'border-[#CCFF00] bg-[#CCFF00] text-[#141416]'
                          : 'border-zinc-700 bg-[#1a1a1e] text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <input
                id="b2b-qty-slider"
                type="range"
                min={25}
                max={500}
                step={25}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full accent-[#CCFF00] cursor-pointer mb-6"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-800 pt-5">
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Unit Wholesale Rate</p>
                  <p className="font-mono text-2xl font-bold text-[#CCFF00] tabular-nums">
                    £{unitPrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Parcel Total</p>
                  <p className="font-mono text-2xl font-bold text-white tabular-nums">
                    £{totalCost.toLocaleString('en-GB', {minimumFractionDigits: 2})}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Est. UK Resale Gross</p>
                  <p className="font-mono text-xl font-bold text-zinc-200 tabular-nums">
                    £{estResaleLow.toLocaleString('en-GB')}–£{estResaleHigh.toLocaleString('en-GB')}
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Trade Selling Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SELLING_POINTS.map((point) => {
                const Icon = point.icon;
                return (
                  <div key={point.title} className="border border-zinc-800 bg-[#141416]/95 p-4 flex gap-3.5">
                    <Icon className="h-5 w-5 text-[#CCFF00] shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">{point.title}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">{point.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Wholesale Quote Form + Visual */}
          <div className="lg:col-span-5 border border-zinc-800 bg-[#141416]/95 overflow-hidden">
            <div className="aspect-[16/9] w-full overflow-hidden border-b border-zinc-800">
              <ProductImage
                src={CATEGORY_IMAGES.watches}
                alt="Bulk stainless steel automatic watches ready for UK wholesale"
                title="B2B Wholesale Watches"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-6">
              <h3 className="font-display text-2xl font-bold text-white mb-1">
                Request Wholesale Parcel
              </h3>
              <p className="text-xs text-zinc-400 mb-5">
                Lock in your tier rate and receive stock photos via text on {CONTACT_PHONE}.
              </p>

              {quoteRef ? (
                <div className="border border-[#CCFF00]/40 bg-[#1b1f14] p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[#CCFF00] font-semibold text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Wholesale Quote Logged · {quoteRef}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {quantity} watches @ £{unitPrice.toFixed(2)}/unit (£{totalCost.toFixed(2)} total). Text your reference {quoteRef} to {CONTACT_PHONE} for instant tray photos.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <a
                      href={`sms:${CONTACT_PHONE}?body=${encodeURIComponent(`Hi RepsForLess! B2B Quote ${quoteRef} for ${quantity} watches (£${totalCost.toFixed(2)}).`)}`}
                      className="inline-flex items-center gap-2 bg-[#CCFF00] px-4 py-2 text-xs font-bold text-[#141416]"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Text {CONTACT_PHONE}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setQuoteRef(null)}
                      className="border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:text-white cursor-pointer"
                    >
                      New Quote
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label htmlFor="b2b-name" className="block text-xs font-medium text-zinc-300 mb-1">
                      Contact Name
                    </label>
                    <input
                      id="b2b-name"
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Jordan Patel"
                      className="w-full border border-zinc-800 bg-[#1a1a1e] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="b2b-biz" className="block text-xs font-medium text-zinc-300 mb-1">
                        Stall / Business Name
                      </label>
                      <input
                        id="b2b-biz"
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Optional"
                        className="w-full border border-zinc-800 bg-[#1a1a1e] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="b2b-phone" className="block text-xs font-medium text-zinc-300 mb-1">
                        UK Mobile
                      </label>
                      <input
                        id="b2b-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07..."
                        className="w-full border border-zinc-800 bg-[#1a1a1e] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="b2b-notes" className="block text-xs font-medium text-zinc-300 mb-1">
                      Preferred Styles (Optional)
                    </label>
                    <textarea
                      id="b2b-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Mixed diver & dress watches, stainless bracelets..."
                      className="w-full border border-zinc-800 bg-[#1a1a1e] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none"
                    />
                  </div>
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#CCFF00] px-5 py-3 text-sm font-bold text-[#141416] hover:bg-[#d8ff33] transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {submitting
                      ? 'Submitting Quote...'
                      : `Request ${quantity}-Unit Quote (£${totalCost.toFixed(2)})`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
