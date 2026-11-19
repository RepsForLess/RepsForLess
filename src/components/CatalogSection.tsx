import {useMemo, useState} from 'react';
import {ChevronLeft, ChevronRight, MessageSquare, Plus, Search} from 'lucide-react';
import {CATALOG_PRODUCTS, CONTACT_PHONE} from '../data/catalog';
import type {BagItem, CategoryId, PageRoute, ProductItem} from '../types/store';
import {ProductImage} from './ProductImage';

interface CatalogSectionProps {
  activeCategory: CategoryId | 'watches-jewellery';
  onSelectCategory?: (category: CategoryId) => void;
  onNavigate?: (route: PageRoute) => void;
  onOpenProduct: (product: ProductItem) => void;
  onQuickAdd: (item: BagItem) => void;
  showCategoryTabs?: boolean;
  heading?: string;
}

const CATEGORY_TABS: Array<{id: CategoryId; label: string}> = [
  {id: 'all', label: 'All Stock'},
  {id: 'trainers', label: 'Trainers'},
  {id: 'clothing', label: 'Clothing'},
  {id: 'watches', label: 'Watches'},
  {id: 'jewellery', label: 'Jewellery'},
  {id: 'belts', label: 'Belts'},
];

interface ProductCardProps {
  product: ProductItem;
  onOpenProduct: (product: ProductItem) => void;
  onQuickAdd: (item: BagItem) => void;
}

function ProductCard({product, onOpenProduct, onQuickAdd}: ProductCardProps) {
  const [angleIdx, setAngleIdx] = useState(0);
  const angles = product.images.length > 0 ? product.images : [{src: product.image, label: 'Front'}];
  const currentAngle = angles[angleIdx % angles.length];

  const defaultVariant = product.variants?.[0]?.name;
  const defaultSize = product.sizes[0] || 'Standard';
  const defaultOpt = [defaultVariant, defaultSize].filter(Boolean).join(' · ');
  const smsBody = encodeURIComponent(
    `Hi RepsForLess! I want to order ${product.brand} ${product.name} (${defaultOpt}) at £${product.price}.`
  );

  return (
    <article className="group border border-zinc-800 bg-[#1a1a1e]/92 backdrop-blur-[2px] flex flex-col transition-transform duration-150 hover:-translate-y-0.5 hover:border-zinc-600">
      {/* 4:3 Multi-Angle Image Frame */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#141416]">
        <button
          type="button"
          onClick={() => onOpenProduct(product)}
          className="block h-full w-full text-left cursor-pointer"
          aria-label={`View ${product.name} options`}
        >
          <ProductImage
            src={currentAngle.src}
            alt={`${product.brand} ${product.name} — ${currentAngle.label}`}
            title={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </button>

        {/* Angle Label + Switcher Controls */}
        {angles.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setAngleIdx((i) => (i - 1 + angles.length) % angles.length)}
              aria-label={`Previous angle of ${product.name}`}
              className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center border border-zinc-700/80 bg-[#141416]/85 text-zinc-200 hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setAngleIdx((i) => (i + 1) % angles.length)}
              aria-label={`Next angle of ${product.name}`}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center border border-zinc-700/80 bg-[#141416]/85 text-zinc-200 hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 pointer-events-none">
              <span className="bg-[#141416]/85 px-2 py-0.5 text-[11px] font-medium text-zinc-200 border border-zinc-800">
                {currentAngle.label}
              </span>
              <div className="pointer-events-auto flex items-center gap-1 bg-[#141416]/85 px-2 py-1 border border-zinc-800">
                {angles.map((angle, idx) => (
                  <button
                    key={`${product.id}-angle-${idx}`}
                    type="button"
                    onClick={() => setAngleIdx(idx)}
                    aria-label={`Show ${angle.label}`}
                    className={`h-1.5 w-3 transition-colors cursor-pointer ${
                      idx === angleIdx ? 'bg-[#CCFF00]' : 'bg-zinc-600 hover:bg-zinc-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-zinc-400">{product.brand}</span>
            {product.tag && (
              <span className="text-xs font-medium text-[#CCFF00]">{product.tag}</span>
            )}
          </div>

          <div className="flex items-baseline justify-between gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white leading-snug">
              <button
                type="button"
                onClick={() => onOpenProduct(product)}
                className="text-left hover:text-[#CCFF00] transition-colors cursor-pointer"
              >
                {product.name}
              </button>
            </h3>
            <span className="font-mono text-base font-bold text-[#CCFF00] tabular-nums shrink-0">
              £{product.price}
            </span>
          </div>

          <p className="text-xs text-zinc-400 mb-2">{product.metaLine}</p>
          <p className="text-sm text-zinc-300 leading-relaxed line-clamp-2">{product.detail}</p>
        </div>

        {/* Actions + Direct Text-to-Order under every item */}
        <div className="pt-3 border-t border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenProduct(product)}
              className="flex-1 border border-zinc-700 bg-[#141416] px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              Select Options
            </button>
            <button
              type="button"
              onClick={() =>
                onQuickAdd({
                  key: `${product.id}__${defaultOpt}`,
                  productId: product.id,
                  name: product.name,
                  brand: product.brand,
                  category: product.category,
                  unitPrice: product.price,
                  quantity: 1,
                  selectedOption: defaultOpt,
                  image: product.image,
                })
              }
              className="inline-flex items-center gap-1.5 bg-[#CCFF00] px-3.5 py-2 text-xs font-bold text-[#141416] hover:bg-[#d8ff33] transition-colors cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Quick Add</span>
            </button>
          </div>

          <a
            href={`sms:${CONTACT_PHONE}?body=${smsBody}`}
            className="w-full inline-flex items-center justify-center gap-2 border border-[#CCFF00]/40 bg-[#141416] px-3 py-2 text-xs font-semibold text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#141416] transition-colors tabular-nums"
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Text {CONTACT_PHONE} to order</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export function CatalogSection({
  activeCategory,
  onSelectCategory,
  onOpenProduct,
  onQuickAdd,
  showCategoryTabs = true,
  heading = 'Shop the Collection',
}: CatalogSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [localSubTab, setLocalSubTab] = useState<'all' | 'watches' | 'jewellery'>('all');

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = CATALOG_PRODUCTS.filter((item) => {
      let matchesCat = true;
      if (activeCategory === 'watches-jewellery') {
        if (localSubTab === 'all') {
          matchesCat = item.category === 'watches' || item.category === 'jewellery';
        } else {
          matchesCat = item.category === localSubTab;
        }
      } else if (activeCategory !== 'all') {
        matchesCat = item.category === activeCategory;
      }
      if (!matchesCat) return false;
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.detail.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    });

    if (sortOrder === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortOrder === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [activeCategory, localSubTab, searchQuery, sortOrder]);

  return (
    <section id="catalog" className="relative z-10 border-b border-zinc-800/80 bg-[#141416]/42 py-14">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">
              Direct UK Stock · Text {CONTACT_PHONE}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white">
              {heading}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Rolex, MoonSwatch, Swatch, Nike..."
                aria-label="Search products"
                className="w-full sm:w-72 border border-zinc-800 bg-[#1a1a1e]/95 pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#CCFF00] focus:outline-none"
              />
            </div>

            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as 'featured' | 'price-asc' | 'price-desc')
              }
              aria-label="Sort products"
              className="border border-zinc-800 bg-[#1a1a1e]/95 px-3 py-2 text-sm text-zinc-200 focus:border-[#CCFF00] focus:outline-none"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        {showCategoryTabs && onSelectCategory && (
          <div
            className="flex flex-wrap items-center gap-1.5 border border-zinc-800 bg-[#1a1a1e]/95 p-1.5 mb-8"
            role="tablist"
            aria-label="Product categories"
          >
            {CATEGORY_TABS.map((tab) => {
              const active = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectCategory(tab.id)}
                  className={`px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#CCFF00] text-[#141416]'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
            <span className="ml-auto hidden sm:inline-block pr-2 font-mono text-xs text-zinc-400 tabular-nums">
              {filteredProducts.length} items
            </span>
          </div>
        )}

        {/* Sub-filter on Watches & Jewellery page */}
        {activeCategory === 'watches-jewellery' && (
          <div className="flex flex-wrap items-center gap-1.5 border border-zinc-800 bg-[#1a1a1e]/95 p-1.5 mb-8">
            {(
              [
                {id: 'all', label: 'All Watches & Jewellery'},
                {id: 'watches', label: 'Watches (£95–£150)'},
                {id: 'jewellery', label: '925 Jewellery (From £15)'},
              ] as const
            ).map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setLocalSubTab(sub.id)}
                className={`px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  localSubTab === sub.id
                    ? 'bg-[#CCFF00] text-[#141416]'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {sub.label}
              </button>
            ))}
            <span className="ml-auto hidden sm:inline-block pr-2 font-mono text-xs text-zinc-400 tabular-nums">
              {filteredProducts.length} items
            </span>
          </div>
        )}

        {/* 3-Column Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="border border-zinc-800 bg-[#1a1a1e]/95 p-12 text-center">
            <p className="font-display text-2xl font-bold text-white mb-2">No matching items</p>
            <p className="text-sm text-zinc-400 mb-5">
              Try clearing your search filter to view all available pieces.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                if (onSelectCategory) onSelectCategory('all');
              }}
              className="bg-[#CCFF00] px-5 py-2.5 text-xs font-bold text-[#141416] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenProduct={onOpenProduct}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
