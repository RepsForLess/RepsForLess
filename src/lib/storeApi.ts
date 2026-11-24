import {ORIGINAL_SITE_REVIEWS} from '../data/reviews';
import type {ReviewItem, ScratchCardData} from '../types/store';

const LOCAL_STORE_KEY = 'repsforless_static_store_v1';

interface PaidScratchRecord {
  token: string;
  cardNumber: number;
  customerName: string;
  phone: string;
  paymentMethod: string;
  paymentReference: string;
  amountPaid: number;
  paid: boolean;
  scratched: boolean;
  createdAt: string;
}

interface LocalStoreState {
  reviews: ReviewItem[];
  subscribers: string[];
  ordersCount: number;
  b2bCount: number;
  paidScratchOrders: PaidScratchRecord[];
  issuedScratchCards: number;
}

function readLocalStore(): LocalStoreState {
  try {
    const raw = localStorage.getItem(LOCAL_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalStoreState>;
      const reviews = Array.isArray(parsed.reviews) && parsed.reviews.length > 0
        ? parsed.reviews
        : [...ORIGINAL_SITE_REVIEWS];
      return {
        reviews,
        subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
        ordersCount: typeof parsed.ordersCount === 'number' ? parsed.ordersCount : 0,
        b2bCount: typeof parsed.b2bCount === 'number' ? parsed.b2bCount : 0,
        paidScratchOrders: Array.isArray(parsed.paidScratchOrders) ? parsed.paidScratchOrders : [],
        issuedScratchCards: typeof parsed.issuedScratchCards === 'number' ? parsed.issuedScratchCards : 0,
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return {
    reviews: [...ORIGINAL_SITE_REVIEWS],
    subscribers: [],
    ordersCount: 0,
    b2bCount: 0,
    paidScratchOrders: [],
    issuedScratchCards: 0,
  };
}

function writeLocalStore(state: LocalStoreState): void {
  try {
    localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota issues
  }
}

function seededValue(seed: number): number {
  let value = seed >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 2146121005);
  value ^= value >>> 15;
  value = Math.imul(value, 2221713035);
  value ^= value >>> 16;
  return value >>> 0;
}

function buildClientScratchCard(cardNumber: number): ScratchCardData {
  const roll = seededValue(1501050 + cardNumber) % 500;
  let winningPrize = 'try_again';
  let prizeLabel = 'Try Again';
  let promoCode = '';
  let discountAmount = 0;

  if (roll < 15) {
    winningPrize = 'jackpot';
    prizeLabel = '£50 Order Credit';
    promoCode = `RFL50-${String(cardNumber).padStart(3, '0')}`;
    discountAmount = 50;
  } else if (roll < 25) {
    winningPrize = 'mega_win';
    prizeLabel = 'Free Belt or Chain';
    promoCode = `RFL25-${String(cardNumber).padStart(3, '0')}`;
    discountAmount = 25;
  } else if (roll < 75) {
    winningPrize = 'big_win';
    prizeLabel = '£15 Off Next Order';
    promoCode = `RFL15-${String(cardNumber).padStart(3, '0')}`;
    discountAmount = 15;
  }

  const winningIdx = seededValue(cardNumber * 7919) % 3;
  const panels = [0, 1, 2].map((idx) => {
    const isWinner = idx === winningIdx && winningPrize !== 'try_again';
    return {
      id: `panel-${idx + 1}`,
      prize: isWinner ? winningPrize : 'try_again',
      label: isWinner ? prizeLabel : 'Try Again',
    };
  });

  return {
    cardNumber,
    allocationSize: 500,
    winningPrize,
    prizeLabel,
    promoCode,
    discountAmount,
    panels,
  };
}

async function tryServerApi<T>(url: string, init?: RequestInit): Promise<{ok: true; status: number; data: T} | {ok: false; status: number; data: Record<string, unknown>} | null> {
  try {
    const res = await fetch(url, init);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    const data = (await res.json()) as T & Record<string, unknown>;
    if (res.ok) {
      return {ok: true, status: res.status, data};
    }
    return {ok: false, status: res.status, data};
  } catch {
    return null;
  }
}

export async function fetchReviewsApi(): Promise<{reviews: ReviewItem[]; averageRating: number}> {
  const remote = await tryServerApi<{reviews?: ReviewItem[]; averageRating?: number}>('/api/reviews');
  if (remote?.ok && Array.isArray(remote.data.reviews)) {
    return {
      reviews: remote.data.reviews,
      averageRating: Number(remote.data.averageRating || 5.0),
    };
  }
  const local = readLocalStore();
  const total = local.reviews.length;
  const avg = total > 0
    ? Number((local.reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
    : 5.0;
  return {reviews: local.reviews, averageRating: avg};
}

export async function postReviewApi(payload: {
  name: string;
  createdAt: string;
  product: string;
  rating: number;
  title: string;
  body: string;
}): Promise<{ok: true; reviews: ReviewItem[]; averageRating: number} | {ok: false; error: string}> {
  const remote = await tryServerApi<{reviews?: ReviewItem[]; averageRating?: number}>('/api/reviews', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
  if (remote) {
    if (remote.ok) {
      return {
        ok: true,
        reviews: remote.data.reviews || [],
        averageRating: Number(remote.data.averageRating || 5.0),
      };
    }
    return {ok: false, error: String(remote.data.error || 'Could not post review.')};
  }

  const name = payload.name.trim();
  if (!name) return {ok: false, error: 'Please enter your name to leave a review.'};
  const rating = Math.min(5, Math.max(1, Math.round(Number(payload.rating || 5))));
  const parsedDate = payload.createdAt && !Number.isNaN(Date.parse(payload.createdAt))
    ? new Date(payload.createdAt).toISOString()
    : new Date().toISOString();

  const store = readLocalStore();
  const entry: ReviewItem = {
    id: `rev-${Date.now()}`,
    name,
    product: payload.product.trim(),
    rating,
    title: payload.title.trim(),
    body: payload.body.trim(),
    verified: false,
    createdAt: parsedDate,
  };
  store.reviews.unshift(entry);
  writeLocalStore(store);

  const total = store.reviews.length;
  const avg = Number((store.reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1));
  return {ok: true, reviews: store.reviews, averageRating: avg};
}

export async function subscribeAlertsApi(email: string): Promise<{ok: true} | {ok: false; error: string}> {
  const remote = await tryServerApi('/api/subscribers', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, stockUpdates: true, reminders: true}),
  });
  if (remote) {
    if (remote.ok) return {ok: true};
    return {ok: false, error: String(remote.data.error || 'Enter a valid email address.')};
  }

  const clean = email.trim().toLowerCase();
  if (!clean || !clean.includes('@')) {
    return {ok: false, error: 'Please enter a valid email address.'};
  }
  const store = readLocalStore();
  if (!store.subscribers.includes(clean)) {
    store.subscribers.push(clean);
    writeLocalStore(store);
  }
  return {ok: true};
}

export async function submitOrderInquiryApi(payload: {
  customerName: string;
  phone: string;
  postcode: string;
  paymentMethod: string;
  itemsSummary: string;
  subtotal: number;
  discountApplied: number;
  promoCode?: string;
}): Promise<{ok: true; reference: string} | {ok: false; error: string}> {
  const remote = await tryServerApi<{order?: {reference?: string}}>('/api/orders/inquiry', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
  if (remote) {
    if (remote.ok) {
      return {ok: true, reference: remote.data.order?.reference || 'RFL-1041'};
    }
    return {ok: false, error: String(remote.data.error || 'Could not confirm order request.')};
  }

  if (!payload.customerName.trim() || !payload.phone.trim() || !payload.itemsSummary.trim()) {
    return {ok: false, error: 'Name, UK mobile number, and at least one item are required.'};
  }
  const store = readLocalStore();
  store.ordersCount += 1;
  const reference = `RFL-${String(1040 + store.ordersCount)}`;
  writeLocalStore(store);
  return {ok: true, reference};
}

export async function submitB2BQuoteApi(payload: {
  businessName: string;
  contactName: string;
  phone: string;
  quantity: number;
  notes: string;
}): Promise<{ok: true; reference: string} | {ok: false; error: string}> {
  const remote = await tryServerApi<{quote?: {reference?: string}}>('/api/b2b/quote', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
  if (remote) {
    if (remote.ok) {
      return {ok: true, reference: remote.data.quote?.reference || 'B2B-CONFIRMED'};
    }
    return {ok: false, error: String(remote.data.error || 'Unable to submit wholesale inquiry.')};
  }

  if (!payload.contactName.trim() || !payload.phone.trim()) {
    return {ok: false, error: 'Contact name and UK mobile number are required.'};
  }
  const store = readLocalStore();
  store.b2bCount += 1;
  const reference = `B2B-${String(200 + store.b2bCount)}`;
  writeLocalStore(store);
  return {ok: true, reference};
}

export async function fetchScratchStatsApi(): Promise<{issuedCount: number}> {
  const remote = await tryServerApi<{issuedCount?: number}>('/api/scratch/stats');
  if (remote?.ok && typeof remote.data.issuedCount === 'number') {
    return {issuedCount: remote.data.issuedCount};
  }
  const store = readLocalStore();
  return {issuedCount: store.issuedScratchCards};
}

export async function payScratchCardApi(payload: {
  customerName: string;
  phone: string;
  paymentMethod: string;
  paymentReference: string;
  confirmedSent: boolean;
}): Promise<{ok: true; token: string; card: ScratchCardData; issuedCount?: number} | {ok: false; error: string}> {
  const remote = await tryServerApi<{token?: string; card?: ScratchCardData; issuedCount?: number}>('/api/scratch/pay', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
  if (remote) {
    if (remote.ok && remote.data.card) {
      return {
        ok: true,
        token: remote.data.token || remote.data.card.paidToken || '',
        card: remote.data.card,
        issuedCount: remote.data.issuedCount,
      };
    }
    const errMsg = !remote.ok ? remote.data.error : undefined;
    return {ok: false, error: String(errMsg || 'Payment verification required before scratching.')};
  }

  const customerName = payload.customerName.trim();
  const phone = payload.phone.trim();
  const paymentReference = payload.paymentReference.trim();
  if (!customerName || !phone || !paymentReference) {
    return {ok: false, error: 'Full name, UK mobile number, and payment reference are required before unlocking a scratch card.'};
  }
  if (!payload.confirmedSent) {
    return {ok: false, error: 'Please send £5.00 via Bank Transfer to 07376123341 and tick the payment confirmation box first.'};
  }

  const store = readLocalStore();
  const nextNumber = (store.issuedScratchCards % 500) + 1;
  const token = `RFL-PAY-${String(1001 + store.paidScratchOrders.length)}`;
  store.paidScratchOrders.unshift({
    token,
    cardNumber: nextNumber,
    customerName,
    phone,
    paymentMethod: payload.paymentMethod || 'Bank Transfer',
    paymentReference,
    amountPaid: 5,
    paid: true,
    scratched: false,
    createdAt: new Date().toISOString(),
  });
  store.issuedScratchCards += 1;
  writeLocalStore(store);

  const card: ScratchCardData = {
    ...buildClientScratchCard(nextNumber),
    paidToken: token,
    paidBy: customerName,
    paymentMethod: payload.paymentMethod || 'Bank Transfer',
    scratched: false,
  };
  return {ok: true, token, card, issuedCount: store.issuedScratchCards};
}

export async function issueScratchCardApi(tokenInput: string): Promise<{ok: true; card: ScratchCardData} | {ok: false; error: string}> {
  const remote = await tryServerApi<{card?: ScratchCardData}>('/api/scratch/issue', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({token: tokenInput}),
  });
  if (remote) {
    if (remote.ok && remote.data.card) {
      return {ok: true, card: remote.data.card};
    }
    const errMsg = !remote.ok ? remote.data.error : undefined;
    return {ok: false, error: String(errMsg || 'Payment of £5 required before unlocking a scratch card.')};
  }

  const clean = tokenInput.trim().toUpperCase();
  if (!clean) {
    return {ok: false, error: 'Payment of £5.00 is required before scratching. Complete payment or enter your verified paid token.'};
  }
  const store = readLocalStore();
  const paidRecord = store.paidScratchOrders.find((entry) => entry.token.toUpperCase() === clean && entry.paid);
  if (!paidRecord) {
    return {ok: false, error: `Token "${clean}" has no verified £5 payment yet. Complete payment first to unlock your scratch card.`};
  }
  return {
    ok: true,
    card: {
      ...buildClientScratchCard(paidRecord.cardNumber),
      paidToken: paidRecord.token,
      paidBy: paidRecord.customerName,
      paymentMethod: paidRecord.paymentMethod,
      scratched: paidRecord.scratched,
    },
  };
}

export async function completeScratchCardApi(token: string): Promise<void> {
  const remote = await tryServerApi('/api/scratch/complete', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({token}),
  });
  if (remote) return;

  const store = readLocalStore();
  const idx = store.paidScratchOrders.findIndex((entry) => entry.token.toUpperCase() === token.toUpperCase());
  if (idx >= 0) {
    store.paidScratchOrders[idx].scratched = true;
    writeLocalStore(store);
  }
}
