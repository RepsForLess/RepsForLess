import {useCallback, useEffect, useState} from 'react';
import {B2BSection} from './components/B2BSection';
import {BagDrawer} from './components/BagDrawer';
import {BrandRain} from './components/BrandRain';
import {CatalogSection} from './components/CatalogSection';
import {Footer} from './components/Footer';
import {Header} from './components/Header';
import {Hero} from './components/Hero';
import {PageBanner} from './components/PageBanner';
import {ProductModal} from './components/ProductModal';
import {ReviewsAndContactSection} from './components/ReviewsAndContactSection';
import {ScratchCardsSection} from './components/ScratchCardsSection';
import type {BagItem, CategoryId, PageRoute, ProductItem} from './types/store';

const BAG_STORAGE_KEY = 'repsforless_bag_v1';

const VALID_ROUTES = new Set<PageRoute>([
  'home',
  'trainers',
  'clothing',
  'watches-jewellery',
  'belts',
  'b2b-watches',
  'scratch-cards',
  'reviews',
  'contact',
]);

function routeFromPath(pathname: string): PageRoute {
  const clean = pathname.replace(/^\/+|\/+$/g, '') as PageRoute;
  return VALID_ROUTES.has(clean) ? clean : 'home';
}

export default function App() {
  const [route, setRoute] = useState<PageRoute>(() => routeFromPath(window.location.pathname));
  const [homeCategory, setHomeCategory] = useState<CategoryId>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  const [bagItems, setBagItems] = useState<BagItem[]>(() => {
    try {
      const saved = localStorage.getItem(BAG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // Ignore malformed storage
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(bagItems));
    } catch {
      // Ignore storage quota issues
    }
  }, [bagItems]);

  useEffect(() => {
    const onPopState = () => {
      setRoute(routeFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((nextRoute: PageRoute) => {
    const targetPath = nextRoute === 'home' ? '/' : `/${nextRoute}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    setRoute(nextRoute);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

  function handleAddToBag(newItem: BagItem) {
    setBagItems((prev) => {
      const idx = prev.findIndex((item) => item.key === newItem.key);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + newItem.quantity,
        };
        return updated;
      }
      return [...prev, newItem];
    });
    setBagOpen(true);
  }

  function handleUpdateQty(key: string, delta: number) {
    setBagItems((prev) =>
      prev
        .map((item) =>
          item.key === key ? {...item, quantity: item.quantity + delta} : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function handleRemoveItem(key: string) {
    setBagItems((prev) => prev.filter((item) => item.key !== key));
  }

  function handleApplyPromo(code: string, discountAmount: number) {
    setPromoCode(code);
    setPromoDiscount(discountAmount);
    setBagOpen(true);
  }

  const bagCount = bagItems.reduce((sum, item) => sum + item.quantity, 0);
  const bagSubtotal = bagItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const rainTheme: PageRoute =
    route === 'home' && homeCategory !== 'all'
      ? homeCategory === 'watches' || homeCategory === 'jewellery'
        ? 'watches-jewellery'
        : homeCategory
      : route;

  return (
    <div className="relative min-h-screen bg-[#141416] text-zinc-100 flex flex-col">
      <BrandRain theme={rainTheme} />

      <Header
        currentRoute={route}
        bagCount={bagCount}
        bagSubtotal={bagSubtotal}
        onNavigate={navigate}
        onOpenBag={() => setBagOpen(true)}
      />

      <main className="relative z-10 flex-1">
        {route === 'home' && (
          <>
            <Hero onNavigate={navigate} />
            <CatalogSection
              activeCategory={homeCategory}
              onSelectCategory={setHomeCategory}
              onNavigate={navigate}
              onOpenProduct={(product) => setSelectedProduct(product)}
              onQuickAdd={handleAddToBag}
            />
            <B2BSection />
            <ScratchCardsSection onApplyPromo={handleApplyPromo} />
            <ReviewsAndContactSection />
          </>
        )}

        {route === 'trainers' && (
          <>
            <PageBanner route="trainers" onNavigate={navigate} />
            <CatalogSection
              activeCategory="trainers"
              showCategoryTabs={false}
              heading="All Trainers · £65"
              onOpenProduct={(product) => setSelectedProduct(product)}
              onQuickAdd={handleAddToBag}
            />
          </>
        )}

        {route === 'clothing' && (
          <>
            <PageBanner route="clothing" onNavigate={navigate} />
            <CatalogSection
              activeCategory="clothing"
              showCategoryTabs={false}
              heading="Streetwear & Outerwear"
              onOpenProduct={(product) => setSelectedProduct(product)}
              onQuickAdd={handleAddToBag}
            />
          </>
        )}

        {route === 'watches-jewellery' && (
          <>
            <PageBanner route="watches-jewellery" onNavigate={navigate} />
            <CatalogSection
              activeCategory="watches-jewellery"
              showCategoryTabs={false}
              heading="Timepieces & 925 Chains"
              onOpenProduct={(product) => setSelectedProduct(product)}
              onQuickAdd={handleAddToBag}
            />
          </>
        )}

        {route === 'belts' && (
          <>
            <PageBanner route="belts" onNavigate={navigate} />
            <CatalogSection
              activeCategory="belts"
              showCategoryTabs={false}
              heading="Designer Belts · 85–110cm"
              onOpenProduct={(product) => setSelectedProduct(product)}
              onQuickAdd={handleAddToBag}
            />
          </>
        )}

        {route === 'b2b-watches' && (
          <>
            <PageBanner route="b2b-watches" onNavigate={navigate} />
            <B2BSection />
          </>
        )}

        {route === 'scratch-cards' && (
          <>
            <PageBanner route="scratch-cards" onNavigate={navigate} />
            <ScratchCardsSection onApplyPromo={handleApplyPromo} />
          </>
        )}

        {(route === 'reviews' || route === 'contact') && (
          <>
            <PageBanner route={route} onNavigate={navigate} />
            <ReviewsAndContactSection />
          </>
        )}
      </main>

      <Footer onNavigate={navigate} />

      <ProductModal
        key={selectedProduct?.id || 'closed'}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToBag={handleAddToBag}
      />

      <BagDrawer
        open={bagOpen}
        items={bagItems}
        promoCode={promoCode}
        promoDiscount={promoDiscount}
        onClose={() => setBagOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearBag={() => {
          setBagItems([]);
          setPromoCode('');
          setPromoDiscount(0);
        }}
      />
    </div>
  );
}
