import type { SceneKind } from '../demoData';
import { Anchor, Sailboat, Compass, LifeBuoy } from 'lucide-react';

/** Theme-aware colours for inline SVG (CSS variables written by src/theme.ts). */
const C = {
  ink: 'var(--ink)', surface: 'var(--surface)', teak: 'var(--teak)', ocean: 'var(--ocean)', accent: 'var(--accent)',
  sky: 'var(--sky)', muted: 'var(--muted)', select: 'var(--select)', onSelect: 'var(--on-select)',
};

/**
 * The client's line-art logo, for brand moments only (welcome, splash, desktop panel, app icon).
 * Never a map marker. The artwork is light blue, so on light surfaces it is recoloured to Ocean
 * through a CSS mask; `original` keeps the artwork as drawn and belongs on near-black.
 */
export function BrandArt({ tone = 'ocean', className }: { tone?: 'ocean' | 'sky' | 'original'; className?: string }) {
  if (tone === 'original') return <img src="/waymate-logo.png" alt="WayMate" className={className} />;
  return <span role="img" aria-label="WayMate" className={`brand-mask aspect-[768/530] ${className ?? ''}`} style={{ backgroundColor: tone === 'sky' ? 'var(--sky)' : 'var(--ocean)' }} />;
}

/** Small round logo (the app icon artwork with thicker lines, so it reads at button size). */
export function LogoMark({ size = 34 }: { size?: number }) {
  return <img src="/waymate-mark.png" alt="" width={size} height={size} className="block rounded-full" style={{ width: size, height: size }} />;
}

export const AVATARS = [
  { label: 'Anchor', Icon: Anchor, bg: 'var(--avatar-1)' },
  { label: 'Sailboat', Icon: Sailboat, bg: 'var(--avatar-0)' },
  { label: 'Compass', Icon: Compass, bg: 'var(--avatar-2)' },
  { label: 'Life buoy', Icon: LifeBuoy, bg: 'var(--avatar-4)' },
];

export function PresetAvatar({ index, size = 58 }: { index: number; size?: number }) {
  const a = AVATARS[index] ?? AVATARS[0];
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full text-ink" style={{ width: size, height: size, background: a.bg }}>
      <a.Icon size={size * 0.5} strokeWidth={1.6} />
    </span>
  );
}

const SCENES: Partial<Record<SceneKind, Partial<Record<string, string | number>>>> = {
  day: {},
  sunset: { sky1: '#F3C7A6', sky2: '#F9E1C8', sun: '#FF8C5A', sunX: 110, sunY: 112, hills: '#8A7E8E', sea: '#34557F', line: '#F3C7A6', bx: 236, wx: 60 },
  dawn: { sky1: '#DDE4EF', sky2: '#EEE9EC', sun: '#FFE7D1', sunX: 84, sunY: 118, hills: '#A3AFC2', sea: '#5B7FA6', line: '#DDE4EF', birds: 0, bx: 250, wx: 70 },
  harbour: { hb: 1, bx: 262, birds: 0, wx: 160 },
  lighthouse: { lh: 1, bx: 170, wx: 230, sunX: 60, sunY: 40 },
  race: { spin: 1, b2: 1, bx: 160, wx: 250, birds: 0 },
};

/** Flat illustration used where a photo would go (no stock photos in the prototype). */
export function Scene({ kind = 'day', hull = '#F4F1EA', className }: { kind?: SceneKind; hull?: string; className?: string }) {
  if (kind === 'ski' || kind === 'lift') return <SnowScene lift={kind === 'lift'} className={className} />;
  const s = { sky1: '#CFE2F2', sky2: '#E4EFF8', sun: '#FFF6DC', sunX: 300, sunY: 46, hills: '#A9BFB5', sea: '#1D5C96', line: '#8DB3D6', lh: 0, hb: 0, b2: 0, spin: 0, birds: 1, bx: 200, wx: 150, ...SCENES[kind] } as Record<string, any>;
  return (
    <svg viewBox="0 0 390 220" preserveAspectRatio="xMidYMid slice" className={`photo ${className ?? 'block h-full w-full'}`} role="img" aria-label={`Illustration: sailboat, ${kind}`}>
      <rect width="390" height="140" fill={s.sky1} />
      <rect y="84" width="390" height="56" fill={s.sky2} />
      <circle cx={s.sunX} cy={s.sunY} r="22" fill={s.sun} />
      <path d="M60 50 q6 -6 12 0 q6 -6 12 0 M96 38 q4 -4 8 0 q4 -4 8 0" fill="none" stroke="#5B6470" strokeWidth="1.4" strokeLinecap="round" opacity={s.birds} />
      <path d="M0 132 C60 116 110 122 160 127 C220 133 280 112 390 124 L390 141 L0 141 Z" fill={s.hills} />
      <g opacity={s.lh}>
        <path d="M321 124 L325 88 L333 88 L337 124 Z" fill="#fff" />
        <path d="M322.6 110 L335.4 110 L336 116 L322 116 Z M324.3 96 L333.7 96 L334.3 102 L323.7 102 Z" fill="#B5352E" />
        <path d="M323 88 h12 v-3 h-12 z M325 85 v-6 h8 v6" fill="#111418" />
        <path d="M333 80 L372 70 L372 90 Z" fill="#FFF6DC" opacity="0.7" />
      </g>
      <rect y="138" width="390" height="82" fill={s.sea} />
      <path d="M20 160 h40 M120 172 h60 M250 158 h50 M300 192 h70 M40 198 h50 M180 206 h44" stroke={s.line} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <g opacity={s.hb}>
        <path d="M0 146 h130 v14 h-130 z" fill="#8B7B6B" />
        <path d="M18 146 V92 M44 146 V84 M74 146 V98 M102 146 V88" stroke="#EDE8E0" strokeWidth="2" />
        <path d="M8 146 h22 l-3 6 h-16 z M34 146 h22 l-3 6 h-16 z M64 146 h22 l-3 6 h-16 z M92 146 h22 l-3 6 h-16 z" fill="#fff" />
      </g>
      <g opacity={s.b2} transform="translate(300 140) scale(0.32)">
        <path d="M-60 0 L60 0 L45 14 L-48 14 Z" fill="#111418" />
        <path d="M3 -104 L3 -6 L52 -6 Z M-3 -98 L-3 -6 L-52 -6 Z" fill="#fff" />
      </g>
      <g transform={`translate(${s.bx} 166) rotate(-5)`}>
        <path d="M3 -100 C44 -88 66 -48 58 -8 L3 -8 Z" fill="#E6B07C" opacity={s.spin} />
        <path d="M0 -112 V0" stroke="#111418" strokeWidth="2.4" />
        <path d="M3 -106 L3 -8 L54 -8 Z" fill="#fff" />
        <path d="M-3 -100 L-3 -8 L-50 -8 Z" fill="#fff" opacity="0.92" />
        <path d="M-66 0 L66 0 L50 16 L-54 16 Z" fill={hull} />
        <path d="M-60 6 L60 6" stroke="#A8693B" strokeWidth="2" opacity="0.8" />
      </g>
      <path d={`M${s.wx} 186 q14 -6 28 0 q14 6 28 0`} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/** Ski trip "photos": a slope with a skier, or a chairlift. */
function SnowScene({ lift, className }: { lift: boolean; className?: string }) {
  const tree = (x: number, y: number, s = 1) => <path key={`${x}-${y}`} d={`M${x} ${y - 26 * s} L${x + 11 * s} ${y} H${x - 11 * s} Z`} fill="#2F4A3D" />;
  return (
    <svg viewBox="0 0 390 220" preserveAspectRatio="xMidYMid slice" className={`photo ${className ?? 'block h-full w-full'}`} role="img" aria-label={lift ? 'Illustration: chairlift above a ski slope' : 'Illustration: skier on a slope'}>
      <rect width="390" height="220" fill="#CBDDEE" />
      <circle cx={lift ? 70 : 318} cy="42" r="20" fill="#FFF6DC" />
      <path d="M0 140 L62 76 L104 112 L176 34 L246 104 L292 70 L390 136 V220 H0 Z" fill="#9DB0C4" />
      <path d="M176 34 L158 54 L170 51 L178 60 L188 50 L199 57 Z M62 76 L50 89 L60 87 L66 93 L76 88 Z M292 70 L280 82 L290 80 L297 86 L306 80 Z" fill="#fff" />
      <path d="M0 168 C70 140 150 150 220 128 C290 106 340 116 390 108 V220 H0 Z" fill="#F4F7FA" />
      <path d="M0 196 C90 176 200 184 390 160 V220 H0 Z" fill="#E6EDF4" />
      {[tree(28, 170, 0.9), tree(52, 176, 1.1), tree(342, 124, 0.9), tree(366, 120, 1.15), tree(318, 132, 0.8)]}
      {lift ? (
        <g>
          <path d="M-10 150 L400 40" stroke="#3A3F46" strokeWidth="1.6" />
          <path d="M60 110 V196 M300 46 V120" stroke="#5B6470" strokeWidth="4" />
          {[110, 190, 270].map((x) => {
            const y = 150 - ((x + 10) / 410) * 110;
            return (
              <g key={x} transform={`translate(${x} ${y})`}>
                <path d="M0 0 V18" stroke="#3A3F46" strokeWidth="1.5" />
                <path d="M-12 18 h24 v6 h-24 z M-12 24 v8 M12 24 v8" stroke="#3A3F46" strokeWidth="1.5" fill="#41769F" />
                <circle cx="-5" cy="13" r="3.5" fill="#1D5C96" />
                <circle cx="5" cy="13" r="3.5" fill="#A8693B" />
              </g>
            );
          })}
        </g>
      ) : (
        <g>
          <path d="M120 200 C170 182 200 170 236 150" stroke="#C9D6E2" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M128 204 C178 186 208 174 244 154" stroke="#C9D6E2" strokeWidth="3" fill="none" strokeLinecap="round" />
          <g transform="translate(246 138) rotate(-18)">
            <path d="M-20 14 H22" stroke="#111418" strokeWidth="3" strokeLinecap="round" />
            <path d="M-4 12 L0 -2 L6 12" stroke="#1D5C96" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M-4 -2 L6 -2 L4 -18 L-3 -18 Z" fill="#E6B07C" />
            <circle cx="0" cy="-23" r="5" fill="#E8C9A8" />
            <path d="M-5 -26 a5 5 0 0 1 10 0 z" fill="#A8693B" />
            <path d="M-3 -12 L-16 4 M4 -12 L16 2" stroke="#3A3F46" strokeWidth="1.6" />
          </g>
        </g>
      )}
    </svg>
  );
}

const glyph = 'M0 -13 C5 -8 6 0 5.5 11 H-5.5 C-6 0 -5 -8 0 -13 Z';
export function WelcomeArt({ n, groups }: { n: number; groups?: boolean }) {
  if (n === 0)
    return (
      <svg viewBox="0 0 300 250" className="h-[250px] w-[300px]" aria-hidden="true">
        <circle cx="150" cy="125" r="112" fill={C.sky} opacity="0.35" />
        <path d="M44 82 C70 70 92 92 104 120 C112 140 98 168 112 196 C120 212 104 226 82 222 C56 200 40 168 38 132 C37 110 38 94 44 82 Z" fill={C.teak} opacity="0.22" />
        <path d="M214 40 C236 56 252 82 260 110 C248 116 230 112 214 120 C200 128 196 108 202 90 C206 70 206 52 214 40 Z" fill={C.teak} opacity="0.22" />
        <circle cx="150" cy="125" r="44" fill="none" stroke={C.sky} strokeWidth="1.5" strokeDasharray="4 5" />
        <circle cx="150" cy="125" r="84" fill="none" stroke={C.sky} strokeWidth="1.5" strokeDasharray="4 5" />
        <g transform="translate(196 80) rotate(35)"><path d={glyph} fill={C.ocean} /></g>
        <g transform="translate(118 64) rotate(-40)"><path d={glyph} fill={C.ocean} /></g>
        <g transform="translate(206 168) rotate(120)"><circle r="17" fill={C.surface} stroke={C.teak} strokeWidth="2.5" /><path d={glyph} fill={C.ocean} /></g>
        <g transform="translate(140 196) rotate(200)"><path d={glyph} fill={C.ocean} /></g>
        <circle className="ill-pulse" cx="150" cy="125" r="22" fill={C.sky} opacity="0.6" />
        <circle cx="150" cy="125" r="11" fill={C.ink} stroke={C.surface} strokeWidth="4" />
      </svg>
    );
  if (n === 1)
    return (
      <svg viewBox="0 0 300 250" className="h-[250px] w-[300px]" aria-hidden="true">
        <circle cx="150" cy="125" r="112" fill={C.sky} opacity="0.35" />
        <path d="M38 172 H262 V196 C220 220 80 220 38 196 Z" fill={C.ocean} opacity="0.9" />
        <g transform="translate(140 176)">
          <path d="M0 -104 V0" stroke={C.ink} strokeWidth="3" />
          <path d="M4 -98 L4 -8 L52 -8 Z" fill="#fff" />
          <path d="M-4 -92 L-4 -8 L-46 -8 Z" fill="#fff" opacity="0.92" />
          <path d="M-62 0 L62 0 L48 16 L-50 16 Z" fill={C.ink} />
          <path d="M-56 5 L56 5" stroke={C.teak} strokeWidth="2.5" />
        </g>
        <g className="ill-float">
          <rect x="176" y="40" width="96" height="58" rx="18" fill={C.surface} />
          <path d="M190 98 L186 112 L204 98 Z" fill={C.surface} />
          <circle cx="204" cy="69" r="13" fill={C.accent} />
          <path d="M197 75 l1.5 -4.5 a7.5 7.5 0 1 1 3 3 z" fill="#fff" />
          <circle cx="240" cy="69" r="13" fill={C.ink} />
          <path d="M235 63 c0 6 4 10 10 10 l2 -3 l-3 -2 l-2 1 c-2 -1 -3 -2 -4 -4 l1 -2 l-2 -3 z" fill="#fff" />
        </g>
        <circle className="ill-pulse" cx="222" cy="128" r="18" fill={C.sky} opacity="0.6" />
        <circle cx="222" cy="128" r="9" fill={C.ink} stroke={C.surface} strokeWidth="3" />
      </svg>
    );
  return (
    <svg viewBox="0 0 300 250" className="h-[250px] w-[300px]" aria-hidden="true">
      <circle cx="150" cy="125" r="112" fill={C.sky} opacity="0.35" />
      <path d="M150 44 C176 62 198 66 216 66 V122 C216 166 186 192 150 206 C114 192 84 166 84 122 V66 C102 66 124 62 150 44 Z" fill={C.surface} stroke={C.ink} strokeWidth="3" />
      <path d="M126 128 l16 16 l34 -36" fill="none" stroke={C.accent} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="44" y="196" width="212" height="34" rx="17" fill={C.surface} />
      <rect x="48" y="200" width="68" height="26" rx="13" fill={C.select} />
      <text x="82" y="217" fontSize="11" fontWeight="600" fill={C.onSelect} textAnchor="middle" fontFamily="Inter, sans-serif">Everyone</text>
      <text x="150" y="217" fontSize="11" fontWeight="600" fill={C.muted} textAnchor="middle" fontFamily="Inter, sans-serif">{groups ? 'Groups' : 'Friends'}</text>
      <text x="218" y="217" fontSize="11" fontWeight="600" fill={C.muted} textAnchor="middle" fontFamily="Inter, sans-serif">Invisible</text>
    </svg>
  );
}

export function LocationArt() {
  return (
    <svg viewBox="0 0 220 180" className="h-[180px] w-[220px]" aria-hidden="true">
      <circle cx="110" cy="92" r="84" fill={C.sky} opacity="0.35" />
      <circle className="ill-pulse" cx="110" cy="112" r="30" fill={C.sky} opacity="0.55" />
      <path d="M110 30 C134 30 150 48 150 70 C150 96 120 120 110 130 C100 120 70 96 70 70 C70 48 86 30 110 30 Z" fill={C.ink} />
      <circle cx="110" cy="70" r="15" fill={C.surface} />
      <path d="M110 61 V78 M110 62 L118 76 H110" stroke={C.ink} strokeWidth="2" fill="none" strokeLinejoin="round" />
      <path d="M44 150 q16 -8 32 0 t32 0 t32 0 t32 0" fill="none" stroke={C.ocean} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function NotifArt() {
  return (
    <svg viewBox="0 0 220 180" className="h-[180px] w-[220px]" aria-hidden="true">
      <circle cx="110" cy="92" r="84" fill={C.sky} opacity="0.35" />
      <rect x="50" y="56" width="120" height="68" rx="16" fill={C.surface} />
      <circle cx="78" cy="90" r="14" fill="var(--avatar-0)" />
      <text x="78" y="95" fontSize="13" fontWeight="600" fill={C.ink} textAnchor="middle" fontFamily="Inter, sans-serif">F</text>
      <rect x="100" y="80" width="54" height="8" rx="4" fill={C.ink} />
      <rect x="100" y="94" width="40" height="7" rx="3.5" fill={C.sky} />
      <circle cx="166" cy="58" r="12" fill={C.sky} />
      <text x="166" y="63" fontSize="13" fontWeight="600" fill="#262626" textAnchor="middle" fontFamily="Inter, sans-serif">1</text>
    </svg>
  );
}

export const HULL = {
  sail: 'M12 2.5C14.6 5.5 15.6 9.5 15.4 14.5L14.8 21.5H9.2L8.6 14.5C8.4 9.5 9.4 5.5 12 2.5Z',
  motor: 'M12 3C14.8 5 15.8 8 15.8 12V21.5H8.2V12C8.2 8 9.2 5 12 3Z',
};
export const DECK = { sail: 'M12 7V18M12 16.5L9.8 12', motor: 'M10.2 11.5h3.6v5h-3.6z' };
/** Person marker for the ski trip (head and shoulders). */
export const PERSON = '<circle cx="12" cy="7.5" r="4"/><path d="M4.5 21c0-4.2 3.4-7.5 7.5-7.5s7.5 3.3 7.5 7.5z"/>';
/** Check mark for the small badge on friends' and private-group members' markers. */
export const BADGE_CHECK = '<path d="M5 12.5l4.2 4.2L19 7"/>';
/** Anchor icon for marina markers (same shape as lucide's Anchor). */
export const ANCHOR = '<path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/>';
