import {useMemo} from 'react';
import {BRAND_LOGO, PAGE_RAIN_THEMES} from '../data/catalog';
import type {PageRoute} from '../types/store';

interface BrandRainProps {
  theme: PageRoute;
}

const ACCENT_COLORS = [
  '#CCFF00', // acid lime
  '#00F0FF', // holo cyan
  '#FFE600', // volt yellow
  '#60A5FA', // ice blue
  '#C084FC', // violet
  '#FFFFFF', // crisp white snow
];

type GlyphKind = 'logo' | 'crown' | 'omega' | 'shoe' | 'clothing' | 'belt' | 'watch' | 'diamond' | 'ticket';

function inferGlyphKind(text: string, fallback: string): GlyphKind {
  const upper = text.toUpperCase();
  if (upper.includes('REPSFORLESS')) return 'logo';
  if (upper.includes('ROLEX') || upper.includes('TUDOR') || upper.includes('PATEK') || upper.includes('AP ')) return 'crown';
  if (upper.includes('OMEGA') || upper.includes('MOONSWATCH') || upper.includes('SWATCH')) return 'omega';
  if (upper.includes('AIR MAX') || upper.includes('JORDAN') || upper.includes('DUNK') || upper.includes('AIR FORCE') || upper.includes('BALANCE') || upper.includes('TUNED')) return 'shoe';
  if (upper.includes('PUFFER') || upper.includes('TRACKSUIT') || upper.includes('FLEECE') || upper.includes('WINDBREAKER') || upper.includes('GILET') || upper.includes('TEES') || upper.includes('POLO')) return 'clothing';
  if (upper.includes('BELT') || upper.includes('VUITTON') || upper.includes('GUCCI') || upper.includes('HERM') || upper.includes('DIOR') || upper.includes('CALF') || upper.includes('DAMIER')) return 'belt';
  if (upper.includes('CARTIER') || upper.includes('TAG') || upper.includes('HUBLOT') || upper.includes('BREITLING') || upper.includes('RICHARD') || upper.includes('WATCH') || upper.includes('DAY-') || upper.includes('GMT') || upper.includes('SUBMARINER') || upper.includes('DAYTONA')) return 'watch';
  if (upper.includes('JACKPOT') || upper.includes('WIN') || upper.includes('CARDS') || upper.includes('TRY AGAIN') || upper.includes('UNLOCK')) return 'ticket';
  if (upper.includes('CUBAN') || upper.includes('925') || upper.includes('STAR')) return 'diamond';

  switch (fallback) {
    case 'shoe':
      return 'shoe';
    case 'clothing':
      return 'clothing';
    case 'belt':
      return 'belt';
    case 'watch':
    case 'b2b':
      return 'watch';
    case 'ticket':
      return 'ticket';
    default:
      return 'diamond';
  }
}

function BrandGlyph({kind}: {kind: GlyphKind}) {
  switch (kind) {
    case 'logo':
      return (
        <img
          src={BRAND_LOGO}
          alt=""
          className="h-[1.85em] w-[1.85em] shrink-0 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]"
        />
      );
    case 'crown':
      return (
        <svg viewBox="0 0 24 24" className="h-[1em] w-[1em] shrink-0" aria-hidden="true">
          <path
            d="M3 18h18l-1.5-9-4.2 4-3.3-7-3.3 7-4.2-4L3 18Z"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <circle cx="4.5" cy="7.5" r="1.2" fill="currentColor" />
          <circle cx="12" cy="4.5" r="1.2" fill="currentColor" />
          <circle cx="19.5" cy="7.5" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'omega':
      return (
        <svg viewBox="0 0 24 24" className="h-[1em] w-[1em] shrink-0" aria-hidden="true">
          <path
            d="M4 19h5.2v-2.2a6.5 6.5 0 1 1 5.6 0V19H20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'shoe':
      return (
        <svg viewBox="0 0 24 24" className="h-[1em] w-[1em] shrink-0" aria-hidden="true">
          <path
            d="M2.5 16.8c0-1.2.8-2 2.1-2.3l4.2-4.2c.9-1 2.4-.9 3.1.2l1 1.5 6.7 2.2c1.7.6 2.4 1.4 2.4 2.7v.7H2.5v-.8Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <rect
            x="2.5"
            y="19"
            width="19"
            height="2.4"
            rx="1.2"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
    case 'watch':
      return (
        <svg viewBox="0 0 24 24" className="h-[1em] w-[1em] shrink-0" aria-hidden="true">
          <rect x="8.5" y="1.5" width="7" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="6" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 9v3.2l2.2 1.3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <rect x="8.5" y="18.5" width="7" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    case 'clothing':
      return (
        <svg viewBox="0 0 24 24" className="h-[1em] w-[1em] shrink-0" aria-hidden="true">
          <path
            d="M8.5 4 5 6.5 2.5 11l3 1.5L7 9.5V20h10V9.5l1.5 3L21.5 11 19 6.5 15.5 4a3.5 3.5 0 0 1-7 0Z"
            fill="currentColor"
            fillOpacity="0.18"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'belt':
      return (
        <svg viewBox="0 0 24 24" className="h-[1em] w-[1em] shrink-0" aria-hidden="true">
          <rect x="2" y="8" width="20" height="8" rx="1.5" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.6" />
          <rect x="8.5" y="6.5" width="7" height="11" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 12h3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'ticket':
      return (
        <svg viewBox="0 0 24 24" className="h-[1em] w-[1em] shrink-0" aria-hidden="true">
          <path
            d="M4 6a2 2 0 0 0-2 2v2a2 2 0 0 1 0 4v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a2 2 0 0 1 0-4V8a2 2 0 0 0-2-2H4Z"
            fill="currentColor"
            fillOpacity="0.18"
            stroke="currentColor"
            strokeWidth="1.7"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-[0.95em] w-[0.95em] shrink-0" aria-hidden="true">
          <path
            d="M7 3h10l4 5-9 13L3 8l4-5Z"
            fill="currentColor"
            fillOpacity="0.18"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

interface DropSpec {
  id: string;
  text: string;
  color: string;
  left: number;
  fontSize: number;
  duration: number;
  delay: number;
  sway: number;
  opacity: number;
  glyph: GlyphKind;
  logoOnly: boolean;
}

export function BrandRain({theme}: BrandRainProps) {
  const config = PAGE_RAIN_THEMES[theme] || PAGE_RAIN_THEMES.home;

  const {bgDrops, fgDrops} = useMemo(() => {
    const {words, iconType} = config;

    // Layer 1: Larger brand & model drops drifting slowly behind semi-translucent sections
    const bg: DropSpec[] = Array.from({length: 20}, (_, i) => {
      const text = words[i % words.length];
      const color = ACCENT_COLORS[i % ACCENT_COLORS.length];
      const left = ((i * 17 + (i % 4) * 6) % 90) + 3;
      const logoOnly = i % 5 === 0;
      const glyph = logoOnly ? 'logo' : inferGlyphKind(text, iconType);
      const baseSize = 17 + (i % 4) * 3;
      const fontSize = glyph === 'logo' ? Math.round(baseSize * 1.5) : baseSize;
      const duration = 22 + (i % 5) * 3.5;
      const delay = -((i * 2.75) % duration);
      const sway = (i % 2 === 0 ? 1 : -1) * (0.6 + (i % 3) * 0.35);
      const opacity = logoOnly ? 0.68 : 0.42 + (i % 3) * 0.12;

      return {
        id: `bg-${theme}-${i}`,
        text,
        color,
        left,
        fontSize,
        duration,
        delay,
        sway,
        opacity,
        glyph,
        logoOnly,
      };
    });

    // Layer 2: Gentle readable snow-drift overlay (smaller logos, brands & models slowly floating down)
    const fg: DropSpec[] = Array.from({length: 12}, (_, i) => {
      const text = words[(i * 3 + 1) % words.length];
      const color = ACCENT_COLORS[(i + 2) % ACCENT_COLORS.length];
      const left = ((i * 23 + (i % 3) * 8) % 90) + 4;
      const logoOnly = i % 4 === 0;
      const glyph = logoOnly ? 'logo' : inferGlyphKind(text, iconType);
      const baseSize = 13 + (i % 3) * 2;
      const fontSize = glyph === 'logo' ? Math.round(baseSize * 1.5) : baseSize;
      const duration = 20 + (i % 4) * 3.2;
      const delay = -((i * 3.1) % duration);
      const sway = (i % 2 === 0 ? -1 : 1) * (0.7 + (i % 3) * 0.35);
      const opacity = logoOnly ? 0.28 : 0.16 + (i % 3) * 0.04;

      return {
        id: `fg-${theme}-${i}`,
        text,
        color,
        left,
        fontSize,
        duration,
        delay,
        sway,
        opacity,
        glyph,
        logoOnly,
      };
    });

    return {bgDrops: bg, fgDrops: fg};
  }, [config, theme]);

  return (
    <>
      <div className="rfl-rain" aria-hidden="true">
        {bgDrops.map((drop) => (
          <span
            key={drop.id}
            className="rfl-drop-item"
            style={{
              left: `${drop.left}%`,
              fontSize: `${drop.fontSize}px`,
              color: drop.color,
              opacity: drop.opacity,
              animationDuration: `${drop.duration}s`,
              animationDelay: `${drop.delay}s`,
              ['--sway' as string]: `${drop.sway}vw`,
            }}
          >
            {drop.logoOnly ? (
              <img
                src={BRAND_LOGO}
                alt=""
                className="h-16 w-16 object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.75)]"
              />
            ) : (
              <>
                <BrandGlyph kind={drop.glyph} />
                <span>{drop.text}</span>
              </>
            )}
          </span>
        ))}
      </div>

      <div className="rfl-rain-foreground" aria-hidden="true">
        {fgDrops.map((drop) => (
          <span
            key={drop.id}
            className="rfl-drop-item"
            style={{
              left: `${drop.left}%`,
              fontSize: `${drop.fontSize}px`,
              color: drop.color,
              opacity: drop.opacity,
              animationDuration: `${drop.duration}s`,
              animationDelay: `${drop.delay}s`,
              ['--sway' as string]: `${drop.sway}vw`,
            }}
          >
            {drop.logoOnly ? (
              <img
                src={BRAND_LOGO}
                alt=""
                className="h-11 w-11 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]"
              />
            ) : (
              <>
                <BrandGlyph kind={drop.glyph} />
                <span>{drop.text}</span>
              </>
            )}
          </span>
        ))}
      </div>
    </>
  );
}
