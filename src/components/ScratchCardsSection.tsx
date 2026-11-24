import {useCallback, useEffect, useRef, useState, type FormEvent, type PointerEvent} from 'react';
import {Check, CheckCircle2, Lock, MessageSquare, RotateCcw, ShieldCheck, Ticket} from 'lucide-react';
import {CONTACT_PHONE, PRIZE_TIERS, SCRATCH_ALLOCATION, SCRATCH_CARD_PRICE} from '../data/catalog';
import {
  completeScratchCardApi,
  fetchScratchStatsApi,
  issueScratchCardApi,
  payScratchCardApi,
} from '../lib/storeApi';
import type {ScratchCardData, ScratchPanelData} from '../types/store';

interface ScratchCardsSectionProps {
  onApplyPromo: (code: string, discountAmount: number) => void;
}

const REVEAL_THRESHOLD = 0.56;
const PANEL_SIZE = 136;

interface FoilCircleProps {
  panel: ScratchPanelData;
  resetSeed: number;
  revealed: boolean;
  locked: boolean;
  onReveal: (panelId: string) => void;
}

function FoilCircle({panel, resetSeed, revealed, locked, onReveal}: FoilCircleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    canvas.width = PANEL_SIZE;
    canvas.height = PANEL_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, PANEL_SIZE, PANEL_SIZE);
    grad.addColorStop(0, locked ? '#52525b' : '#a68934');
    grad.addColorStop(0.5, locked ? '#71717a' : '#e5cc78');
    grad.addColorStop(1, locked ? '#3f3f46' : '#8c6f22');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);

    ctx.strokeStyle = 'rgba(20, 20, 22, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(PANEL_SIZE / 2, PANEL_SIZE / 2, PANEL_SIZE * 0.34, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(20, 20, 22, 0.78)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(locked ? 'PAY £5' : 'SCRATCH', PANEL_SIZE / 2, PANEL_SIZE / 2 + 4);
  }, [revealed, locked, resetSeed]);

  const scratchAt = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      if (locked) return;
      const canvas = canvasRef.current;
      if (!canvas || revealed) return;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, PANEL_SIZE * 0.17, 0, Math.PI * 2);
      ctx.fill();

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] === 0) cleared += 1;
      }
      if (cleared / (canvas.width * canvas.height) >= REVEAL_THRESHOLD) {
        onReveal(panel.id);
      }
    },
    [locked, onReveal, panel.id, revealed]
  );

  const isWin = panel.prize !== 'try_again';

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-full border-2 bg-[#141416] select-none ${
        locked ? 'border-zinc-700 opacity-75' : 'border-[#CCFF00]/80'
      }`}
      style={{width: PANEL_SIZE}}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
        <span
          className={`font-display text-lg font-black leading-tight ${
            isWin ? 'text-[#CCFF00]' : 'text-zinc-400'
          }`}
        >
          {panel.label}
        </span>
        <span className="mt-1 text-[11px] text-zinc-500">
          {isWin ? 'Verified Win' : 'Next Time'}
        </span>
      </div>

      {!revealed && (
        <canvas
          ref={canvasRef}
          aria-label={`Scratch panel ${panel.id}`}
          onPointerDown={(e) => {
            if (locked) return;
            drawingRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            scratchAt(e);
          }}
          onPointerMove={(e) => {
            if (!locked && drawingRef.current) scratchAt(e);
          }}
          onPointerUp={() => {
            drawingRef.current = false;
          }}
          onPointerCancel={() => {
            drawingRef.current = false;
          }}
          className={`absolute inset-0 h-full w-full touch-none ${
            locked ? 'cursor-not-allowed' : 'cursor-crosshair'
          }`}
        />
      )}
    </div>
  );
}

const LOCKED_PREVIEW_PANELS: ScratchPanelData[] = [
  {id: 'preview-1', prize: 'locked', label: 'Locked'},
  {id: 'preview-2', prize: 'locked', label: 'Locked'},
  {id: 'preview-3', prize: 'locked', label: 'Locked'},
];

export function ScratchCardsSection({onApplyPromo}: ScratchCardsSectionProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [card, setCard] = useState<ScratchCardData | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [resetSeed, setResetSeed] = useState(0);
  const [applied, setApplied] = useState(false);

  // Payment-before-scratch form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [confirmedSent, setConfirmedSent] = useState(false);
  const [payError, setPayError] = useState('');
  const [issuedCount, setIssuedCount] = useState(0);

  const loadStats = useCallback(async () => {
    const data = await fetchScratchStatsApi();
    setIssuedCount(data.issuedCount);
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  async function handlePayAndUnlock(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPayError('');
    setTokenError('');
    setApplied(false);
    try {
      const result = await payScratchCardApi({
        customerName,
        phone,
        paymentMethod,
        paymentReference,
        confirmedSent,
      });
      if (!result.ok) {
        setPayError(result.error);
      } else {
        setCard(result.card);
        setRevealedIds(new Set());
        setResetSeed((s) => s + 1);
        if (typeof result.issuedCount === 'number') {
          setIssuedCount(result.issuedCount);
        }
      }
    } catch {
      setPayError('Network error while verifying £5 payment.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlockExistingToken() {
    setLoading(true);
    setTokenError('');
    setPayError('');
    setApplied(false);
    try {
      const result = await issueScratchCardApi(tokenInput);
      if (!result.ok) {
        setTokenError(result.error);
      } else {
        setCard(result.card);
        setRevealedIds(new Set());
        setResetSeed((s) => s + 1);
      }
    } catch {
      setTokenError('Unable to verify paid scratch token.');
    } finally {
      setLoading(false);
    }
  }

  const handlePanelReveal = useCallback(
    (panelId: string) => {
      setRevealedIds((prev) => {
        const next = new Set(prev);
        next.add(panelId);
        if (card?.paidToken && next.size >= card.panels.length) {
          void completeScratchCardApi(card.paidToken);
        }
        return next;
      });
    },
    [card]
  );

  const allRevealed = card ? revealedIds.size >= card.panels.length : false;
  const hasWinner = Boolean(card && card.discountAmount > 0 && allRevealed);

  return (
    <section id="scratch" className="relative overflow-hidden border-b border-zinc-800/80 bg-[#141416]/42 py-16">
      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: 500-Card Odds & Paid Token Gate */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#CCFF00] mb-2">
                {SCRATCH_ALLOCATION.totalCards}-Card Allocation · £{SCRATCH_CARD_PRICE} Per Card
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white mb-3">
                RepsForLess Scratch Cards
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                500 cards total — 75 winning cards plus 425 Try Again cards (including 250 additional Try Again cards). Customers must complete their £{SCRATCH_CARD_PRICE}.00 payment before scratching.
              </p>
            </div>

            {/* Redeem Paid Token Form */}
            <div className="border border-zinc-800 bg-[#1a1a1e]/95 p-5 space-y-3">
              <label htmlFor="scratch-token" className="block text-xs font-semibold text-zinc-200">
                Already Paid? Enter Your Paid Card Token
              </label>
              <div className="flex gap-2">
                <input
                  id="scratch-token"
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="RFL-PAY-1001"
                  className="flex-1 border border-zinc-700 bg-[#141416] px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none uppercase"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleUnlockExistingToken}
                  className="bg-[#CCFF00] px-4 py-2 text-xs font-bold text-[#141416] hover:bg-[#d8ff33] cursor-pointer whitespace-nowrap"
                >
                  Unlock
                </button>
              </div>
              {tokenError && <p className="text-xs text-red-400">{tokenError}</p>}
            </div>

            {/* 500-Card Prize Allocation Table */}
            <div className="border border-zinc-800 bg-[#1a1a1e]/95 p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  500-Card Allocation Breakdown
                </p>
                <span className="font-mono text-xs text-[#CCFF00] tabular-nums">
                  {issuedCount} / {SCRATCH_ALLOCATION.totalCards} issued
                </span>
              </div>
              <div className="divide-y divide-zinc-800">
                {PRIZE_TIERS.map((tier) => (
                  <div key={tier.id} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-200">{tier.title}</span>
                    <span className="font-mono text-zinc-400 tabular-nums">{tier.odds}</span>
                  </div>
                ))}
                <div className="pt-2.5 flex items-center justify-between text-xs font-bold text-white">
                  <span>Total Allocation (75 Wins + 425 Try Again)</span>
                  <span className="font-mono text-[#CCFF00] tabular-nums">500 cards</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pay-Before-Scratch Gate + Interactive Foil Card */}
          <div className="lg:col-span-7 border border-zinc-800 bg-[#1a1a1e]/95 p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                {card ? (
                  <Ticket className="h-5 w-5 text-[#CCFF00]" aria-hidden="true" />
                ) : (
                  <Lock className="h-5 w-5 text-[#CCFF00]" aria-hidden="true" />
                )}
                <div>
                  <p className="font-display text-xl font-bold text-white leading-none">
                    {card
                      ? `Paid Card #${String(card.cardNumber).padStart(3, '0')} / ${SCRATCH_ALLOCATION.totalCards}`
                      : `Scratch Card Locked · £${SCRATCH_CARD_PRICE}.00 Payment Required`}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {card
                      ? `Verified token ${card.paidToken} · Scratch all 3 gold circles below`
                      : `Complete your £${SCRATCH_CARD_PRICE}.00 payment to unlock your 3 gold-foil scratch panels`}
                  </p>
                </div>
              </div>

              {card && (
                <button
                  type="button"
                  onClick={() => {
                    setCard(null);
                    setRevealedIds(new Set());
                    setApplied(false);
                    setConfirmedSent(false);
                    setPaymentReference('');
                  }}
                  className="inline-flex items-center gap-1.5 border border-zinc-700 bg-[#141416] px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-[#CCFF00] hover:text-[#CCFF00] cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Buy Next Card (£{SCRATCH_CARD_PRICE})</span>
                </button>
              )}
            </div>

            {/* Interactive 3-Circle Foil Card */}
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 py-2">
              {(card ? card.panels : LOCKED_PREVIEW_PANELS).map((panel) => (
                <FoilCircle
                  key={`${card?.paidToken || 'locked'}-${panel.id}-${resetSeed}`}
                  panel={panel}
                  resetSeed={resetSeed}
                  locked={!card}
                  revealed={Boolean(card && revealedIds.has(panel.id))}
                  onReveal={handlePanelReveal}
                />
              ))}
            </div>

            {/* Either Payment Form (when locked) OR Scratch Progress / Win Action (when paid & unlocked) */}
            {!card ? (
              <form
                onSubmit={handlePayAndUnlock}
                className="border border-zinc-800 bg-[#141416] p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#CCFF00]">
                    <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Step 1: Send £{SCRATCH_CARD_PRICE}.00 via UK Bank Transfer</span>
                  </div>
                  <a
                    href={`sms:${CONTACT_PHONE}?body=${encodeURIComponent(
                      `Hi RepsForLess! Sending £${SCRATCH_CARD_PRICE}.00 for a paid Scratch Card. Please confirm payment details.`
                    )}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-200 hover:text-[#CCFF00]"
                  >
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Text {CONTACT_PHONE} for Pay Details</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pay-name" className="block text-xs font-medium text-zinc-300 mb-1">
                      Full Name
                    </label>
                    <input
                      id="pay-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Callum H."
                      className="w-full border border-zinc-800 bg-[#1a1a1e] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="pay-phone" className="block text-xs font-medium text-zinc-300 mb-1">
                      UK Mobile
                    </label>
                    <input
                      id="pay-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07..."
                      className="w-full border border-zinc-800 bg-[#1a1a1e] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pay-method" className="block text-xs font-medium text-zinc-300 mb-1">
                      Payment Method (£{SCRATCH_CARD_PRICE}.00 Paid)
                    </label>
                    <select
                      id="pay-method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full border border-zinc-800 bg-[#1a1a1e] px-3 py-2 text-sm text-white focus:border-[#CCFF00] focus:outline-none"
                    >
                      <option value="Bank Transfer">UK Bank Transfer (£5.00)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pay-ref" className="block text-xs font-medium text-zinc-300 mb-1">
                      Payment / Transfer Reference
                    </label>
                    <input
                      id="pay-ref"
                      type="text"
                      required
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="e.g. TXN-88412 or Bank Transfer Ref"
                      className="w-full border border-zinc-800 bg-[#1a1a1e] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedSent}
                    onChange={(e) => setConfirmedSent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#CCFF00] cursor-pointer"
                  />
                  <span>
                    I confirm I have paid <strong className="text-white">£{SCRATCH_CARD_PRICE}.00</strong> to RepsForLess (<span className="font-mono text-[#CCFF00]">{CONTACT_PHONE}</span>) before unlocking my card.
                  </span>
                </label>

                {payError && <p className="text-xs text-red-400">{payError}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#CCFF00] px-5 py-3 text-sm font-bold text-[#141416] hover:bg-[#d8ff33] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {loading
                    ? 'Verifying £5.00 Payment...'
                    : `Confirm £${SCRATCH_CARD_PRICE}.00 Payment & Unlock Scratch Card`}
                </button>
              </form>
            ) : (
              <div className="border-t border-zinc-800 pt-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300 border border-[#CCFF00]/30 bg-[#1b1f14] px-3.5 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[#CCFF00] font-semibold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Payment Verified ({card.paymentMethod}) · Card #{String(card.cardNumber).padStart(3, '0')} / 500</span>
                  </span>
                  <span className="font-mono text-white">Token: {card.paidToken}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {!allRevealed ? (
                    <>
                      <p className="text-xs text-zinc-400">
                        Progress: <span className="font-mono text-white tabular-nums">{revealedIds.size} / 3</span> circles scratched
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setRevealedIds(new Set(card.panels.map((p) => p.id)));
                          if (card.paidToken) {
                            void completeScratchCardApi(card.paidToken);
                          }
                        }}
                        className="text-xs font-semibold text-zinc-300 underline underline-offset-4 hover:text-[#CCFF00] cursor-pointer self-start sm:self-auto"
                      >
                        Reveal All Panels
                      </button>
                    </>
                  ) : hasWinner ? (
                    <>
                      <div>
                        <p className="text-sm font-bold text-[#CCFF00]">
                          Winner: {card.prizeLabel}
                        </p>
                        <p className="text-xs text-zinc-300">
                          Code <span className="font-mono font-bold text-white">{card.promoCode}</span> deducts £{card.discountAmount} from your bag subtotal.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onApplyPromo(card.promoCode, card.discountAmount);
                          setApplied(true);
                        }}
                        className="inline-flex items-center gap-2 bg-[#CCFF00] px-4 py-2.5 text-xs font-bold text-[#141416] hover:bg-[#d8ff33] cursor-pointer shrink-0"
                      >
                        {applied ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Applied to Bag</span>
                          </>
                        ) : (
                          <span>Apply £{card.discountAmount} to Bag</span>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-300">
                        Try Again — no prize on Card #{String(card.cardNumber).padStart(3, '0')}. Complete another £{SCRATCH_CARD_PRICE}.00 payment to draw a new card.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCard(null);
                          setRevealedIds(new Set());
                          setConfirmedSent(false);
                          setPaymentReference('');
                        }}
                        className="bg-[#CCFF00] px-4 py-2 text-xs font-bold text-[#141416] hover:bg-[#d8ff33] cursor-pointer shrink-0"
                      >
                        Pay £{SCRATCH_CARD_PRICE} for New Card
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
