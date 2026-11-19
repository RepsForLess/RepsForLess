import {ShoppingBag} from 'lucide-react';
import {BRAND_LOGO} from '../data/catalog';
import type {PageRoute} from '../types/store';

interface HeaderProps {
  currentRoute: PageRoute;
  bagCount: number;
  bagSubtotal: number;
  onNavigate: (route: PageRoute) => void;
  onOpenBag: () => void;
}

const TOP_MENU_PAGES: Array<{label: string; route: PageRoute}> = [
  {label: 'Home', route: 'home'},
  {label: 'Trainers', route: 'trainers'},
  {label: 'Clothing', route: 'clothing'},
  {label: 'Watches & 925', route: 'watches-jewellery'},
  {label: 'Belts', route: 'belts'},
  {label: 'B2B Watches', route: 'b2b-watches'},
  {label: 'Scratch Cards', route: 'scratch-cards'},
  {label: 'Reviews', route: 'reviews'},
  {label: 'Contact', route: 'contact'},
];

export function Header({
  currentRoute,
  bagCount,
  bagSubtotal,
  onNavigate,
  onOpenBag,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-[#141416]/95 backdrop-blur-md">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Zone 1 (Left): Logo to the left of REPSFORLESS title */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="inline-flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
          >
            <img
              src={BRAND_LOGO}
              alt="RepsForLess Logo"
              className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]"
            />
            <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-zinc-100 whitespace-nowrap">
              <span className="text-[#CCFF00]">REPS</span>FORLESS
            </span>
          </a>

          {/* Zone 2 (Center/Top): Page menu visible in the very top bar on tablet/desktop */}
          <nav
            className="hidden md:flex items-center gap-2.5 lg:gap-4 xl:gap-5 overflow-x-auto py-1"
            aria-label="Main navigation"
          >
            {TOP_MENU_PAGES.map((link) => {
              const active = currentRoute === link.route;
              return (
                <a
                  key={link.route}
                  href={link.route === 'home' ? '/' : `/${link.route}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(link.route);
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={`text-xs lg:text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 underline-offset-4 decoration-[#CCFF00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] ${
                    active ? 'text-[#CCFF00] underline' : 'text-zinc-300 hover:text-white hover:underline'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3 (Right): Cart button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenBag}
              className="inline-flex items-center gap-2 bg-[#CCFF00] px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#141416] hover:bg-[#d8ff33] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="tabular-nums">
                {bagCount > 0 ? `Cart (${bagCount}) · £${bagSubtotal}` : 'Cart (0)'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Top Menu Row (at the very top right below title & cart on <md screens) */}
        <nav
          aria-label="Mobile top navigation"
          className="flex md:hidden items-center gap-3 overflow-x-auto border-t border-zinc-800/80 py-2"
        >
          {TOP_MENU_PAGES.map((link) => {
            const active = currentRoute === link.route;
            return (
              <a
                key={link.route}
                href={link.route === 'home' ? '/' : `/${link.route}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(link.route);
                }}
                aria-current={active ? 'page' : undefined}
                className={`text-xs font-medium whitespace-nowrap shrink-0 underline-offset-4 decoration-[#CCFF00] ${
                  active ? 'text-[#CCFF00] underline' : 'text-zinc-300 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
