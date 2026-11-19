import {ArrowLeft} from 'lucide-react';
import {BRAND_LOGO, PAGE_HEADERS} from '../data/catalog';
import type {PageRoute} from '../types/store';

interface PageBannerProps {
  route: Exclude<PageRoute, 'home'>;
  onNavigate: (route: PageRoute) => void;
}

export function PageBanner({route, onNavigate}: PageBannerProps) {
  const header = PAGE_HEADERS[route];

  return (
    <section className="relative overflow-hidden border-b border-zinc-800/80 bg-[#141416]/40">
      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-[#CCFF00] transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Home</span>
        </button>

        <p className="text-xs font-medium uppercase tracking-wider text-[#CCFF00] mb-2">
          {header.eyebrow}
        </p>
        <div className="flex items-center gap-3.5 sm:gap-4 mb-3">
          <img
            src={BRAND_LOGO}
            alt="RepsForLess Logo"
            className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.65)]"
          />
          <h1
            className="font-display font-black tracking-tight text-white leading-[0.96]"
            style={{fontSize: 'clamp(2.25rem, 4.3vw, 3.85rem)', textWrap: 'balance'}}
          >
            {header.title}
            <span className="text-[#CCFF00]">{header.accent}</span>
          </h1>
        </div>
        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
          {header.subtitle}
        </p>
      </div>
    </section>
  );
}
