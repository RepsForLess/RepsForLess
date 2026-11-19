import express from 'express';
import type {Request, Response} from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

interface ReviewRecord {
  id: string;
  name: string;
  product: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: string;
}

interface SubscriberRecord {
  email: string;
  stockUpdates: boolean;
  reminders: boolean;
  createdAt: string;
}

interface OrderInquiryRecord {
  reference: string;
  customerName: string;
  phone: string;
  postcode: string;
  paymentMethod: string;
  itemsSummary: string;
  subtotal: number;
  discountApplied: number;
  total: number;
  promoCode?: string;
  createdAt: string;
}

interface B2BQuoteRecord {
  reference: string;
  businessName: string;
  contactName: string;
  phone: string;
  quantity: number;
  unitPrice: number;
  estimatedTotal: number;
  notes: string;
  createdAt: string;
}

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

interface StoreData {
  reviews: ReviewRecord[];
  subscribers: SubscriberRecord[];
  orders: OrderInquiryRecord[];
  b2bQuotes: B2BQuoteRecord[];
  paidScratchOrders: PaidScratchRecord[];
  issuedScratchCards: number;
}

const PLACEHOLDER_IDS = new Set(['rev-1', 'rev-2', 'rev-3', 'rev-4']);

const ORIGINAL_SITE_REVIEWS: ReviewRecord[] = [
  {
    id: 'rfl-20',
    name: 'Markus',
    product: 'Watches',
    rating: 5,
    title: 'Very good quality!',
    body: 'These are identical to the originals, even the fine detail, Clasps, mechanism.',
    verified: true,
    createdAt: '2026-09-21T20:35:40.000Z',
  },
  {
    id: 'rfl-19',
    name: 'Warren',
    product: '',
    rating: 5,
    title: 'Repeat order',
    body: 'As always great communication and fast delivery \nGreat prices',
    verified: true,
    createdAt: '2026-08-30T16:47:30.000Z',
  },
  {
    id: 'rfl-18',
    name: 'Simon',
    product: 'Watches',
    rating: 5,
    title: 'Top product top price',
    body: 'Have been buying from here for years. Great service and great products. Always happy to help and can get even more products than listed. Honest and trustworthy.',
    verified: true,
    createdAt: '2026-08-25T07:47:27.000Z',
  },
  {
    id: 'rfl-17',
    name: 'Raja Nazam',
    product: 'Watches',
    rating: 5,
    title: 'Best in the game',
    body: 'Very good prices especially for children',
    verified: true,
    createdAt: '2026-08-24T12:57:18.000Z',
  },
  {
    id: 'rfl-16',
    name: 'george',
    product: 'Watches',
    rating: 5,
    title: 'such a nice lad',
    body: 'I would reccomend this to all my friends best prices quick replies great guy',
    verified: true,
    createdAt: '2026-08-24T07:04:34.000Z',
  },
  {
    id: 'rfl-15',
    name: 'Carl',
    product: 'Watches',
    rating: 5,
    title: 'Amazing quality',
    body: 'Amazing quality and a top lad to deal with 100% would recommend',
    verified: true,
    createdAt: '2026-08-24T04:41:58.000Z',
  },
  {
    id: 'rfl-14',
    name: 'Harvey burgess',
    product: '',
    rating: 5,
    title: 'Fantastic',
    body: 'Kirk',
    verified: true,
    createdAt: '2026-08-24T04:34:49.000Z',
  },
  {
    id: 'rfl-13',
    name: 'Mike griffiths',
    product: 'Watches',
    rating: 5,
    title: 'Great guy to deal with',
    body: 'I’ve had tobacco,watches off Matt,no problem with any returns , the cheapest you will find. Thanks matt',
    verified: true,
    createdAt: '2026-08-23T22:11:55.000Z',
  },
  {
    id: 'rfl-12',
    name: 'Kieran',
    product: 'Trainers',
    rating: 5,
    title: '2 pair of trainers',
    body: 'I brought Some shoes off him and they are amazing quality 10/10 🔥🔥',
    verified: true,
    createdAt: '2026-05-07T23:35:33.000Z',
  },
  {
    id: 'rfl-11',
    name: 'Courtney',
    product: '',
    rating: 5,
    title: 'Really good',
    body: "Tobacco is really nice and smokes really well better than the cheep Tobacco shops in Cov and cheaper too and thank you for the trainers they're brilliant",
    verified: true,
    createdAt: '2026-05-07T13:21:41.000Z',
  },
  {
    id: 'rfl-10',
    name: 'Mike',
    product: 'Trainers',
    rating: 5,
    title: 'Brilliant ☺️',
    body: 'Thank youuuuuu for my trainers love them they got nice bright colours on them',
    verified: true,
    createdAt: '2026-05-07T13:15:21.000Z',
  },
  {
    id: 'rfl-9',
    name: 'Warren',
    product: '',
    rating: 5,
    title: 'Brilliant service',
    body: 'Great service 👍🏼\nI’ve have had plenty of dealings,bought many different things great interaction & communication \nWould highly recommend I personally use very regularly & will continue to do so',
    verified: true,
    createdAt: '2026-05-07T12:56:21.000Z',
  },
  {
    id: 'rfl-8',
    name: 'Dane',
    product: '',
    rating: 5,
    title: 'Very good supplier',
    body: 'The baccys 10/10 the watches and belts are good quality will be buying again',
    verified: true,
    createdAt: '2026-05-07T00:56:23.000Z',
  },
  {
    id: 'rfl-7',
    name: 'Drew',
    product: '',
    rating: 5,
    title: 'Fast brilliant service',
    body: 'Excellent quality products, ive had no issues. Really recommend all products and very impressed with their professionalism and quick service.',
    verified: true,
    createdAt: '2026-05-06T13:27:46.000Z',
  },
  {
    id: 'rfl-6',
    name: 'Rhys',
    product: '',
    rating: 5,
    title: 'Top stuff',
    body: 'Great stuff and sound guy',
    verified: true,
    createdAt: '2026-05-06T12:28:44.000Z',
  },
  {
    id: 'rfl-5',
    name: 'James',
    product: '',
    rating: 5,
    title: 'Quality Baccy! Quality price',
    body: 'Top quality tobacco for decent prices! The deals on here are spot on, such vast variety!',
    verified: true,
    createdAt: '2026-05-06T12:17:20.000Z',
  },
  {
    id: 'rfl-4',
    name: 'Jamal',
    product: 'Trainers',
    rating: 5,
    title: 'Top quality 👌',
    body: 'Brought  some trainers of Pinocchio top Quality loved them 👌 thanks Pinocchio 👍 😊',
    verified: true,
    createdAt: '2026-05-06T11:50:52.000Z',
  },
  {
    id: 'rfl-3',
    name: 'Charlie rio',
    product: 'Watches',
    rating: 5,
    title: 'S watch',
    body: 'Really good quality and affordable price, my partner loved his, matty is really easy to communicate with',
    verified: true,
    createdAt: '2026-05-06T08:09:43.000Z',
  },
  {
    id: 'rfl-2',
    name: 'Rick',
    product: 'Watches',
    rating: 5,
    title: 'Great quality at a great price',
    body: 'I’ve had a few and they are all fantastic quality at a great price',
    verified: true,
    createdAt: '2026-05-06T05:52:01.000Z',
  },
  {
    id: 'rfl-1',
    name: 'Aaron',
    product: 'Watches',
    rating: 5,
    title: 'Top quality great value',
    body: 'Ordered a watch and a bulk order from Matt fantastic bloke very helpful patient and trusting. Over the moon with my order will be a return customer very very soon. Cheers mate',
    verified: true,
    createdAt: '2026-05-01T22:11:00.000Z',
  },
];

const DEFAULT_STORE: StoreData = {
  reviews: ORIGINAL_SITE_REVIEWS,
  subscribers: [],
  orders: [],
  b2bQuotes: [],
  paidScratchOrders: [],
  issuedScratchCards: 0,
};

function readStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, {recursive: true});
    }
    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
      return structuredClone(DEFAULT_STORE);
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    let reviews = Array.isArray(parsed.reviews) ? parsed.reviews : structuredClone(ORIGINAL_SITE_REVIEWS);

    // Replace old placeholder reviews with exact imported repsforless.co.uk reviews while keeping user-submitted reviews
    const hasOriginalReviews = reviews.some((r) => r.id === 'rfl-20');
    if (!hasOriginalReviews) {
      const customReviews = reviews.filter((r) => !PLACEHOLDER_IDS.has(r.id));
      reviews = [...customReviews, ...structuredClone(ORIGINAL_SITE_REVIEWS)];
    }

    const result: StoreData = {
      reviews,
      subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      b2bQuotes: Array.isArray(parsed.b2bQuotes) ? parsed.b2bQuotes : [],
      paidScratchOrders: Array.isArray(parsed.paidScratchOrders) ? parsed.paidScratchOrders : [],
      issuedScratchCards: typeof parsed.issuedScratchCards === 'number' ? parsed.issuedScratchCards : 0,
    };

    if (!hasOriginalReviews) {
      writeStore(result);
    }
    return result;
  } catch {
    return structuredClone(DEFAULT_STORE);
  }
}

function writeStore(data: StoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, {recursive: true});
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist store:', err);
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

function buildScratchCard(cardNumber: number) {
  // 500 cards total:
  // 0..14 (15 cards): Jackpot (£50 Credit)
  // 15..24 (10 cards): Mega Win (Free Belt or Chain)
  // 25..74 (50 cards): Big Win (£15 Off Next Order)
  // 75..249 (175 cards): Standard Try Again
  // 250..499 (250 additional cards): Additional Try Again Batch -> 425 Try Again out of 500 total
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

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ok: true, service: 'repsforless'});
  });

  app.get('/api/reviews', (_req: Request, res: Response) => {
    const store = readStore();
    const total = store.reviews.length;
    const avg = total > 0
      ? Number((store.reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
      : 5.0;
    res.json({reviews: store.reviews, averageRating: avg, totalCount: total});
  });

  app.post('/api/reviews', (req: Request, res: Response) => {
    const body = req.body as Partial<ReviewRecord>;
    const name = String(body.name || '').trim();
    const title = String(body.title || '').trim();
    const reviewBody = String(body.body || '').trim();
    const product = String(body.product || '').trim();
    const rating = Math.min(5, Math.max(1, Math.round(Number(body.rating || 5))));
    const rawDate = String(body.createdAt || '').trim();
    const parsedDate = rawDate && !Number.isNaN(Date.parse(rawDate))
      ? new Date(rawDate).toISOString()
      : new Date().toISOString();

    if (!name) {
      res.status(400).json({error: 'Please enter your name to leave a review.'});
      return;
    }

    const store = readStore();
    const entry: ReviewRecord = {
      id: `rev-${Date.now()}`,
      name,
      product,
      rating,
      title,
      body: reviewBody,
      verified: false,
      createdAt: parsedDate,
    };
    store.reviews.unshift(entry);
    writeStore(store);

    const total = store.reviews.length;
    const avg = total > 0
      ? Number((store.reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
      : 5.0;
    res.status(201).json({review: entry, reviews: store.reviews, averageRating: avg, totalCount: total});
  });

  app.post('/api/subscribers', (req: Request, res: Response) => {
    const body = req.body as Partial<SubscriberRecord>;
    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      res.status(400).json({error: 'Please enter a valid email address.'});
      return;
    }

    const store = readStore();
    const exists = store.subscribers.some((s) => s.email === email);
    if (!exists) {
      store.subscribers.push({
        email,
        stockUpdates: body.stockUpdates !== false,
        reminders: body.reminders !== false,
        createdAt: new Date().toISOString(),
      });
      writeStore(store);
    }
    res.status(201).json({ok: true, email});
  });

  app.post('/api/orders/inquiry', (req: Request, res: Response) => {
    const body = req.body as Partial<OrderInquiryRecord>;
    const customerName = String(body.customerName || '').trim();
    const phone = String(body.phone || '').trim();
    const postcode = String(body.postcode || '').trim();
    const paymentMethod = String(body.paymentMethod || 'Bank Transfer').trim();
    const itemsSummary = String(body.itemsSummary || '').trim();
    const subtotal = Math.max(0, Number(body.subtotal || 0));
    const discountApplied = Math.max(0, Number(body.discountApplied || 0));
    const total = Math.max(0, subtotal - discountApplied);

    if (!customerName || !phone || !itemsSummary) {
      res.status(400).json({error: 'Name, UK mobile number, and at least one item are required.'});
      return;
    }

    const store = readStore();
    const reference = `RFL-${String(1040 + store.orders.length + 1)}`;
    const record: OrderInquiryRecord = {
      reference,
      customerName,
      phone,
      postcode,
      paymentMethod,
      itemsSummary,
      subtotal,
      discountApplied,
      total,
      promoCode: body.promoCode ? String(body.promoCode) : undefined,
      createdAt: new Date().toISOString(),
    };
    store.orders.unshift(record);
    writeStore(store);
    res.status(201).json({order: record});
  });

  app.post('/api/b2b/quote', (req: Request, res: Response) => {
    const body = req.body as Partial<B2BQuoteRecord>;
    const businessName = String(body.businessName || '').trim();
    const contactName = String(body.contactName || '').trim();
    const phone = String(body.phone || '').trim();
    const quantity = Math.max(25, Number(body.quantity || 50));
    const unitPrice = quantity >= 250 ? 3.0 : quantity >= 100 ? 3.5 : quantity >= 50 ? 4.25 : 5.0;
    const estimatedTotal = Number((quantity * unitPrice).toFixed(2));

    if (!contactName || !phone) {
      res.status(400).json({error: 'Contact name and UK mobile number are required.'});
      return;
    }

    const store = readStore();
    const reference = `B2B-${String(200 + store.b2bQuotes.length + 1)}`;
    const quote: B2BQuoteRecord = {
      reference,
      businessName: businessName || 'Independent Reseller',
      contactName,
      phone,
      quantity,
      unitPrice,
      estimatedTotal,
      notes: String(body.notes || '').trim(),
      createdAt: new Date().toISOString(),
    };
    store.b2bQuotes.unshift(quote);
    writeStore(store);
    res.status(201).json({quote});
  });

  app.get('/api/scratch/stats', (_req: Request, res: Response) => {
    const store = readStore();
    res.json({
      totalAllocation: 500,
      winningCards: 75,
      standardTryAgain: 175,
      additionalTryAgain: 250,
      totalTryAgain: 425,
      cardPrice: 5,
      issuedCount: store.issuedScratchCards,
      remainingCards: Math.max(0, 500 - store.issuedScratchCards),
    });
  });

  app.post('/api/scratch/pay', (req: Request, res: Response) => {
    const body = req.body as {
      customerName?: string;
      phone?: string;
      paymentMethod?: string;
      paymentReference?: string;
      confirmedSent?: boolean;
    };
    const customerName = String(body.customerName || '').trim();
    const phone = String(body.phone || '').trim();
    const paymentMethod = String(body.paymentMethod || 'Bank Transfer').trim();
    const paymentReference = String(body.paymentReference || '').trim();
    const confirmedSent = body.confirmedSent === true;

    if (!customerName || !phone || !paymentReference) {
      res.status(400).json({error: 'Full name, UK mobile number, and payment reference are required before unlocking a scratch card.'});
      return;
    }
    if (!confirmedSent) {
      res.status(402).json({error: 'Please send £5.00 via Bank Transfer to 07376123341 and tick the payment confirmation box first.'});
      return;
    }

    const store = readStore();
    const nextNumber = (store.issuedScratchCards % 500) + 1;
    const token = `RFL-PAY-${String(1001 + store.paidScratchOrders.length)}`;
    const record: PaidScratchRecord = {
      token,
      cardNumber: nextNumber,
      customerName,
      phone,
      paymentMethod,
      paymentReference,
      amountPaid: 5,
      paid: true,
      scratched: false,
      createdAt: new Date().toISOString(),
    };

    store.paidScratchOrders.unshift(record);
    store.issuedScratchCards += 1;
    writeStore(store);

    const card = {
      ...buildScratchCard(nextNumber),
      paidToken: token,
      paidBy: customerName,
      paymentMethod,
      scratched: false,
    };

    res.status(201).json({
      token,
      payment: record,
      card,
      issuedCount: store.issuedScratchCards,
      remainingCards: Math.max(0, 500 - store.issuedScratchCards),
    });
  });

  app.post('/api/scratch/issue', (req: Request, res: Response) => {
    const body = req.body as {token?: string};
    const token = String(body.token || '').trim().toUpperCase();
    if (!token) {
      res.status(402).json({
        error: 'Payment of £5.00 is required before scratching. Complete payment or enter your verified paid token.',
      });
      return;
    }

    const store = readStore();
    const paidRecord = store.paidScratchOrders.find(
      (entry) => entry.token.toUpperCase() === token && entry.paid
    );

    if (!paidRecord) {
      res.status(402).json({
        error: `Token "${token}" has no verified £5 payment yet. Complete payment first to unlock your scratch card.`,
      });
      return;
    }

    const card = {
      ...buildScratchCard(paidRecord.cardNumber),
      paidToken: paidRecord.token,
      paidBy: paidRecord.customerName,
      paymentMethod: paidRecord.paymentMethod,
      scratched: paidRecord.scratched,
    };
    res.json({card, tokenIssued: paidRecord.token});
  });

  app.post('/api/scratch/complete', (req: Request, res: Response) => {
    const body = req.body as {token?: string};
    const token = String(body.token || '').trim().toUpperCase();
    const store = readStore();
    const idx = store.paidScratchOrders.findIndex((entry) => entry.token.toUpperCase() === token);
    if (idx >= 0) {
      store.paidScratchOrders[idx].scratched = true;
      writeStore(store);
    }
    res.json({ok: true});
  });

  if (process.env.NODE_ENV !== 'production') {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RepsForLess server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
