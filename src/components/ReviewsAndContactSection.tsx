import {useEffect, useState, type FormEvent} from 'react';
import {Bell, ChevronDown, MessageSquare, Star} from 'lucide-react';
import {CONTACT_PHONE, EDITORIAL_GUIDES, FAQ_ITEMS} from '../data/catalog';
import type {ReviewItem} from '../types/store';

export function ReviewsAndContactSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [avgRating, setAvgRating] = useState(5.0);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [revName, setRevName] = useState('');
  const [revDate, setRevDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [revProduct, setRevProduct] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revHover, setRevHover] = useState(0);
  const [revTitle, setRevTitle] = useState('');
  const [revBody, setRevBody] = useState('');
  const [revSubmitting, setRevSubmitting] = useState(false);
  const [revSubmittedMsg, setRevSubmittedMsg] = useState('');
  const [revError, setRevError] = useState('');

  const [subEmail, setSubEmail] = useState('');
  const [subSuccess, setSubSuccess] = useState(false);
  const [subError, setSubError] = useState('');

  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [msgName, setMsgName] = useState('');
  const [msgText, setMsgText] = useState('');

  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.reviews)) {
          setReviews(data.reviews);
          setAvgRating(Number(data.averageRating || 5.0));
        }
      })
      .finally(() => setLoadingReviews(false));
  }, []);

  async function handleReviewSubmit(e: FormEvent) {
    e.preventDefault();
    setRevSubmitting(true);
    setRevError('');
    setRevSubmittedMsg('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: revName,
          createdAt: revDate,
          product: revProduct,
          rating: revRating,
          title: revTitle,
          body: revBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRevError(data.error || 'Could not post review.');
      } else {
        setReviews(data.reviews || []);
        if (typeof data.averageRating === 'number') {
          setAvgRating(data.averageRating);
        }
        setRevName('');
        setRevDate(new Date().toISOString().slice(0, 10));
        setRevProduct('');
        setRevRating(5);
        setRevTitle('');
        setRevBody('');
        setShowReviewForm(false);
        setRevSubmittedMsg('Thank you! Your review has been added.');
      }
    } catch {
      setRevError('Network error while saving review.');
    } finally {
      setRevSubmitting(false);
    }
  }

  async function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    setSubError('');
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: subEmail, stockUpdates: true, reminders: true}),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubError(data.error || 'Enter a valid email address.');
      } else {
        setSubSuccess(true);
        setSubEmail('');
      }
    } catch {
      setSubError('Unable to subscribe right now.');
    }
  }

  function formatReviewDate(dateStr: string): string {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <>
      {/* Reviews & Restock Alerts */}
      <section id="reviews" className="relative z-10 border-b border-zinc-800/80 bg-[#18181b]/42 py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">
                {reviews.length} Genuine Customer Reviews · <span className="font-mono text-[#CCFF00] tabular-nums">{avgRating.toFixed(1)} / 5.0</span> · No Sign-Up Needed
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white">
                Customer Reviews
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowReviewForm((prev) => !prev);
                setRevSubmittedMsg('');
              }}
              className="border border-[#CCFF00] bg-[#141416] px-5 py-2.5 text-xs font-bold text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#141416] transition-colors cursor-pointer self-start sm:self-auto"
            >
              {showReviewForm ? 'Close Review Form' : 'Leave a Review (No Sign-Up)'}
            </button>
          </div>

          {revSubmittedMsg && (
            <div className="mb-6 border border-[#CCFF00]/50 bg-[#1b1f14] px-4 py-3 text-sm font-semibold text-[#CCFF00]">
              {revSubmittedMsg}
            </div>
          )}

          {showReviewForm && (
            <form
              onSubmit={handleReviewSubmit}
              className="mb-10 border border-zinc-800 bg-[#141416]/95 p-6 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label htmlFor="rev-name" className="block text-xs font-medium text-zinc-300 mb-1">
                  Your Name
                </label>
                <input
                  id="rev-name"
                  type="text"
                  required
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  placeholder="e.g. Jordan"
                  className="w-full border border-zinc-800 bg-[#1a1a1e] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="rev-date" className="block text-xs font-medium text-zinc-300 mb-1">
                  Date of Review
                </label>
                <input
                  id="rev-date"
                  type="date"
                  required
                  value={revDate}
                  onChange={(e) => setRevDate(e.target.value)}
                  className="w-full border border-zinc-800 bg-[#1a1a1e] px-3 py-2 text-sm text-white focus:border-[#CCFF00] focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Star Rating ({revRating} / 5)
                </span>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (revHover || revRating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRevRating(star)}
                        onMouseEnter={() => setRevHover(star)}
                        onMouseLeave={() => setRevHover(0)}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        className="cursor-pointer p-0.5"
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            active ? 'fill-[#CCFF00] text-[#CCFF00]' : 'text-zinc-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="rev-cat" className="block text-xs font-medium text-zinc-400 mb-1">
                  Product / Category (Optional)
                </label>
                <select
                  id="rev-cat"
                  value={revProduct}
                  onChange={(e) => setRevProduct(e.target.value)}
                  className="w-full border border-zinc-800 bg-[#1a1a1e] px-3 py-2 text-sm text-white focus:border-[#CCFF00] focus:outline-none"
                >
                  <option value="">General / No specific product</option>
                  <option value="Trainers">Trainers</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Watches">Watches</option>
                  <option value="Jewellery">Jewellery</option>
                  <option value="Belts">Belts</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="rev-title" className="block text-xs font-medium text-zinc-400 mb-1">
                  Review Title (Optional)
                </label>
                <input
                  id="rev-title"
                  type="text"
                  value={revTitle}
                  onChange={(e) => setRevTitle(e.target.value)}
                  placeholder="Optional headline"
                  className="w-full border border-zinc-800 bg-[#1a1a1e] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label htmlFor="rev-body" className="block text-xs font-medium text-zinc-400 mb-1">
                  Written Comment (Optional)
                </label>
                <textarea
                  id="rev-body"
                  rows={2}
                  value={revBody}
                  onChange={(e) => setRevBody(e.target.value)}
                  placeholder="Optional comment — or simply leave your name, date, and star rating..."
                  className="w-full border border-zinc-800 bg-[#1a1a1e] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none"
                />
              </div>

              {revError && <p className="md:col-span-3 text-xs text-red-400">{revError}</p>}

              <div className="md:col-span-3 flex items-center justify-between gap-4">
                <span className="text-xs text-zinc-400">
                  No sign-up or email required.
                </span>
                <button
                  type="submit"
                  disabled={revSubmitting}
                  className="bg-[#CCFF00] px-5 py-2.5 text-xs font-bold text-[#141416] hover:bg-[#d8ff33] cursor-pointer"
                >
                  {revSubmitting ? 'Posting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {/* Genuine Reviews Grid (All reviews displayed word-for-word) */}
          {loadingReviews ? (
            <p className="text-sm text-zinc-400">Loading customer reviews...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
              {reviews.map((rev) => (
                <article key={rev.id} className="border border-zinc-800 bg-[#141416]/95 p-5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-1 mb-1.5" aria-label={`${rev.rating} out of 5 stars`}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= rev.rating
                                  ? 'fill-[#CCFF00] text-[#CCFF00]'
                                  : 'text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                        {rev.title && (
                          <h3 className="text-base font-bold text-white leading-snug">{rev.title}</h3>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-white">{rev.name}</p>
                        <p className="text-xs text-zinc-400 mt-0.5 tabular-nums">
                          {formatReviewDate(rev.createdAt)}
                        </p>
                      </div>
                    </div>

                    {rev.product && (
                      <span className="inline-block border border-[#CCFF00]/30 bg-[#CCFF00]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#CCFF00] mb-2">
                        {rev.product}
                      </span>
                    )}

                    {rev.body && (
                      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                        {rev.body}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Guides + Restock Alerts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-8 border-t border-zinc-800">
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {EDITORIAL_GUIDES.map((guide) => (
                <article key={guide.id} className="border border-zinc-800 bg-[#141416]/95 p-4">
                  <p className="text-xs text-zinc-400 mb-1.5">
                    {guide.category} · {guide.readTime}
                  </p>
                  <h3 className="text-sm font-semibold text-white mb-2">{guide.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{guide.summary}</p>
                </article>
              ))}
            </div>

            <div className="lg:col-span-4 border border-zinc-800 bg-[#141416]/95 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#CCFF00] text-xs font-semibold uppercase tracking-wider mb-2">
                  <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Restock Alerts</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                  Get notified when sold-out trainer colourways and automatic watch shipments land.
                </p>
              </div>

              {subSuccess ? (
                <p className="text-xs font-semibold text-[#CCFF00]">
                  Subscribed. You will receive restock alerts directly.
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      placeholder="you@example.co.uk"
                      aria-label="Email for restock alerts"
                      className="flex-1 border border-zinc-700 bg-[#1a1a1e] px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-[#CCFF00] px-4 py-2 text-xs font-bold text-[#141416] cursor-pointer"
                    >
                      Join
                    </button>
                  </div>
                  {subError && <p className="text-xs text-red-400">{subError}</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact & FAQ */}
      <section id="contact" className="relative z-10 border-b border-zinc-800/80 bg-[#141416]/42 py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* FAQ Accordion */}
          <div className="lg:col-span-7">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">
              Ordering &amp; Delivery
            </p>
            <h2 className="font-display text-4xl font-black tracking-tight text-white mb-6">
              Frequently Asked Questions
            </h2>

            <div className="divide-y divide-zinc-800 border-y border-zinc-800">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={item.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full py-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-white">{item.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-[#CCFF00]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="pb-4 text-sm text-zinc-300 leading-relaxed">{item.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Text-to-Order Card */}
          <div className="lg:col-span-5 border border-zinc-800 bg-[#1a1a1e]/95 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[#CCFF00] mb-1">
              Text Only · No Calls
            </p>
            <h3 className="font-display text-3xl font-black text-white mb-2">
              Text {CONTACT_PHONE}
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed mb-5">
              Send us the product name, colourway, and UK size to confirm live stock and arrange UK Bank Transfer payment.
            </p>

            <div className="space-y-3">
              <div>
                <label htmlFor="sms-name" className="block text-xs font-medium text-zinc-300 mb-1">
                  Your Name
                </label>
                <input
                  id="sms-name"
                  type="text"
                  value={msgName}
                  onChange={(e) => setMsgName(e.target.value)}
                  placeholder="First name"
                  className="w-full border border-zinc-700 bg-[#141416] px-3 py-2 text-sm text-white focus:border-[#CCFF00] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="sms-body" className="block text-xs font-medium text-zinc-300 mb-1">
                  Item &amp; Size Enquiry
                </label>
                <textarea
                  id="sms-body"
                  rows={3}
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="Air Max 95 Neon Yellow UK 9..."
                  className="w-full border border-zinc-700 bg-[#141416] px-3 py-2 text-sm text-white focus:border-[#CCFF00] focus:outline-none"
                />
              </div>

              <a
                href={`sms:${CONTACT_PHONE}?body=${encodeURIComponent(
                  `Hi RepsForLess! ${msgName ? `Name: ${msgName}. ` : ''}${msgText || 'Checking UK stock availability.'}`
                )}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#CCFF00] px-5 py-3 text-sm font-bold text-[#141416] hover:bg-[#d8ff33] transition-colors"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                <span>Open SMS to {CONTACT_PHONE}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
