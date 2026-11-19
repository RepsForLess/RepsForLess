import {MessageSquare} from 'lucide-react';
import {BRAND_DOMAINS, CONTACT_PHONE} from '../data/catalog';
import type {PageRoute} from '../types/store';

interface FooterProps {
  onNavigate: (route: PageRoute) => void;
}

const FOOTER_CATEGORIES: Array<{label: string; route: PageRoute}> = [
  {label: 'Trainers', route: 'trainers'},
  {label: 'Clothing', route: 'clothing'},
  {label: 'Watches & 925 Jewellery', route: 'watches-jewellery'},
  {label: 'Belts', route: 'belts'},
];

export function Footer({onNavigate}: FooterProps) {
  return (
    <footer className="relative z-10 bg-[#111113]/55 py-12 text-zinc-400">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-zinc-800/80">
          <div className="md:col-span-5">
            <p className="font-display text-2xl font-black text-white mb-2">
              <span className="text-[#CCFF00]">REPS</span>FORLESS
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mb-3">
              UK trainers, streetwear clothing, automatic watches, 925 silver-plated jewellery, designer belts, and B2B wholesale watch stock.
            </p>
            <p className="text-xs text-zinc-500">
              Official domains: {BRAND_DOMAINS.join(' · ')}
            </p>
          </div>

          <div className="md:col-span-3 space-y-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">
              Categories
            </p>
            {FOOTER_CATEGORIES.map((cat) => (
              <div key={cat.route}>
                <a
                  href={`/${cat.route}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(cat.route);
                  }}
                  className="hover:text-[#CCFF00] transition-colors"
                >
                  {cat.label}
                </a>
              </div>
            ))}
          </div>

          <div className="md:col-span-4 space-y-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Text to Order (No Calls)
            </p>
            <a
              href={`sms:${CONTACT_PHONE}`}
              className="inline-flex items-center gap-2 font-mono text-lg font-bold text-[#CCFF00] hover:underline tabular-nums"
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              <span>{CONTACT_PHONE}</span>
            </a>
            <p className="text-xs text-zinc-400 leading-relaxed">
              5–10 working day UK dispatch · Bank Transfer accepted · 48-hour exchange support.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} RepsForLess. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {(
              [
                {label: 'B2B Watches', route: 'b2b-watches'},
                {label: 'Scratch Cards', route: 'scratch-cards'},
                {label: 'Reviews', route: 'reviews'},
                {label: 'Contact & FAQ', route: 'contact'},
              ] as const
            ).map((link) => (
              <a
                key={link.route}
                href={`/${link.route}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(link.route);
                }}
                className="hover:text-zinc-300"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
