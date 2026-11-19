import {ArrowRight, MessageSquare} from 'lucide-react';
import {BRAND_LOGO, CONTACT_PHONE, HERO_IMAGE} from '../data/catalog';
import type {PageRoute} from '../types/store';
import {ProductImage} from './ProductImage';

interface HeroProps {
  onNavigate: (route: PageRoute) => void;
}

const SUMMARY_STRIP: Array<{
  label: string;
  price: string;
  detail: string;
  route: PageRoute;
}> = [
  {label: 'Trainers', price: '£65', detail: 'Air Max 95, TN, Jordan 4 & Dunks · UK 5–11', route: 'trainers'},
  {label: 'Clothing', price: 'From £18', detail: 'Tracksuits, Puffers, Tees & Windbreakers', route: 'clothing'},
  {label: 'Watches & 925', price: '£15–£145', detail: 'Automatic Timepieces & Silver-Plated Chains', route: 'watches-jewellery'},
  {label: 'B2B Bulk Watches', price: 'From £3', detail: 'Wholesale reseller parcels · £15–£50 resale', route: 'b2b-watches'},
];

export function Hero({onNavigate}: HeroProps) {
  return (
    <section id="top" className="relative overflow-hidden border-b border-zinc-800/80 bg-[#141416]/40">
      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Copy Column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-medium tracking-wider uppercase text-zinc-400 mb-3">
              UK Direct Storefront · repsforless.co.uk &amp; repforless.com
            </p>
            <div className="flex items-center gap-3.5 sm:gap-4 mb-5">
              <img
                src={BRAND_LOGO}
                alt="RepsForLess Logo"
                className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.65)]"
              />
              <h1
                className="font-display font-black tracking-tight text-white leading-[0.95]"
                style={{fontSize: 'clamp(2.5rem, 5vw, 4.4rem)', textWrap: 'balance'}}
              >
                Best Prices. <span className="text-[#CCFF00]">No Cap.</span>
              </h1>
            </div>
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl mb-8">
              UK trainers, heavyweight streetwear, sweeping automatic watches, 925 silver-plated chains, and designer belts—priced honestly with direct UK dispatch in 5–10 working days.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 bg-[#CCFF00] px-6 py-3.5 text-sm font-bold text-[#141416] hover:bg-[#d8ff33] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>

              <a
                href={`sms:${CONTACT_PHONE}`}
                className="inline-flex items-center gap-2 border border-zinc-700 bg-[#1b1b1f]/90 px-5 py-3.5 text-sm font-semibold text-zinc-100 hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors whitespace-nowrap shrink-0 tabular-nums"
              >
                <MessageSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Text {CONTACT_PHONE}</span>
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400">
              <span>5–10 Working Day UK Delivery</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onNavigate('b2b-watches')}
                className="hover:text-[#CCFF00] transition-colors cursor-pointer"
              >
                B2B Bulk Watches
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onNavigate('reviews')}
                className="hover:text-[#CCFF00] transition-colors cursor-pointer"
              >
                Verified Reviews
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="hover:text-[#CCFF00] transition-colors cursor-pointer"
              >
                Contact &amp; FAQ
              </button>
            </div>
          </div>

          {/* Right Media Column */}
          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[280px] sm:min-h-[360px] lg:min-h-[440px] overflow-hidden border border-zinc-800 bg-[#1b1b1f]">
              <ProductImage
                src={HERO_IMAGE}
                alt="Stainless steel automatic wristwatch, volt-lime running trainers, and 925 silver Cuban chain on dark slate"
                title="RepsForLess Showcase"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141416]/85 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-zinc-300">Featured Drop</p>
                  <p className="font-display text-xl font-bold text-white">
                    Air Max 95 · Submariner · 925 Cuban
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-[#CCFF00] tabular-nums whitespace-nowrap">
                  From £15
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Summary Strip Below Hero Split */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUMMARY_STRIP.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.route)}
              className="group text-left border border-zinc-800 bg-[#1a1a1e]/95 p-5 hover:border-[#CCFF00]/70 transition-colors cursor-pointer"
            >
              <div className="flex items-baseline justify-between gap-2 mb-1.5">
                <span className="font-display text-xl font-bold text-white group-hover:text-[#CCFF00] transition-colors">
                  {item.label}
                </span>
                <span className="font-mono text-sm font-bold text-[#CCFF00] tabular-nums">
                  {item.price}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.detail}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
