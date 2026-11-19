export type PageRoute =
  | 'home'
  | 'trainers'
  | 'clothing'
  | 'watches-jewellery'
  | 'belts'
  | 'b2b-watches'
  | 'scratch-cards'
  | 'reviews'
  | 'contact';

export type CategoryId =
  | 'all'
  | 'trainers'
  | 'clothing'
  | 'watches'
  | 'jewellery'
  | 'belts';

export interface ProductVariant {
  name: string;
  hex: string;
  price: number;
}

export interface ProductAngle {
  src: string;
  label: string;
}

export interface ProductItem {
  id: string;
  category: Exclude<CategoryId, 'all'>;
  brand: string;
  name: string;
  price: number;
  metaLine: string;
  detail: string;
  image: string;
  images: ProductAngle[];
  sizes: string[];
  tag?: string;
  variants?: ProductVariant[];
  jewellerySpecs?: {
    widths: string[];
    lengths: string[];
    platings: string[];
  };
}

export interface BagItem {
  key: string;
  productId: string;
  name: string;
  brand: string;
  category: string;
  unitPrice: number;
  quantity: number;
  selectedOption: string;
  image: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  product: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: string;
}

export interface ScratchPanelData {
  id: string;
  prize: string;
  label: string;
}

export interface ScratchCardData {
  cardNumber: number;
  allocationSize: number;
  winningPrize: string;
  prizeLabel: string;
  promoCode: string;
  discountAmount: number;
  panels: ScratchPanelData[];
  paidToken?: string;
  paidBy?: string;
  paymentMethod?: string;
  scratched?: boolean;
}
