/**
 * Every colour in the app lives in this file.
 *
 * BRAND holds the six colours from the WayMate specification (section 8.2).
 * LIGHT and DARK map them to roles (text, surfaces, buttons, navigation…) and
 * add the few tints and shades that dark mode or contrast needs. At startup the
 * values are written into CSS variables (see installTheme), and the Tailwind
 * colour names in src/index.css (bg-accent, text-ocean, …) point at them.
 *
 * Usage rules from the specification:
 * - Red is not a CTA colour: warnings, destructive actions, critical privacy and safety states only.
 * - Sky and Ocean carry navigation and selection states. Primary buttons are Ocean with white text.
 * - Teak marks services, partner content and private groups, always with a label or icon.
 * - Light mode: near-black chrome (header, tab bar) with light content. Dark mode: near-black throughout.
 */

export type ThemeMode = 'system' | 'light' | 'dark';
export type Resolved = 'light' | 'dark';

/** The six brand colours. The spec lists RGB 171,20,32 for red; the hex below is the one used. */
export const BRAND = {
  red: '#A81420', // Mexican Red, "Dehler Red"
  sky: '#7FCAFF', // Malibu, "The Sky"
  ocean: '#41769F', // Kashmir Blue, "The Ocean"
  teak: '#E6B07C', // Tacao, "Teak Deck"
  sail: '#262626', // Near Black, "The Sail"
  boat: '#FFFFFF', // White, "The Boat"
} as const;

/** Colours that are the same in both themes. */
const SHARED = {
  red: BRAND.red, // fills only (banners, destructive buttons), always with white text
  sky: BRAND.sky,
  teak: BRAND.teak,
  sail: BRAND.sail,
  boat: BRAND.boat,
  accent: BRAND.ocean, // primary buttons, my chat bubbles, boat markers
  'on-accent': BRAND.boat,
  'on-chrome': BRAND.boat,
};

export const LIGHT = {
  ...SHARED,
  background: '#F5F7F9', // app background, a whisper of Ocean
  surface: BRAND.boat, // cards, sheets
  fill: '#EEF2F5', // subtle fill inside cards
  line: '#E0E6EB', // dividers
  outline: '#A9B8C6', // outlined buttons and chips, switch off
  ink: BRAND.sail, // text
  muted: '#5A6570', // secondary text
  'on-ink': BRAND.boat, // text on ink-filled elements (toasts)
  ocean: BRAND.ocean, // icons, headings, links
  chrome: BRAND.sail, // header and tab bar
  'on-chrome-muted': '#B5BCC3', // inactive tab labels
  select: BRAND.ocean, // selected chips, segments, radios
  'on-select': BRAND.boat,
  danger: BRAND.red, // destructive and error text
  'teak-strong': '#9A6430', // teak shade for icons on light surfaces
} as const;

export const DARK = {
  ...SHARED,
  background: BRAND.sail,
  surface: '#303234',
  fill: '#3A3D40',
  line: '#45494D',
  outline: '#5F656B',
  ink: '#F4F4F4',
  muted: '#AAB2BA',
  'on-ink': BRAND.sail,
  ocean: '#7DADD4', // Ocean tint: base Ocean is too dark for icons and text on near-black
  chrome: '#1E1E1E',
  'on-chrome-muted': '#9EA5AC',
  select: BRAND.sky,
  'on-select': '#1C1C1C',
  danger: '#FF8A93', // Red tint: base Red on near-black is only 2:1
  'teak-strong': BRAND.teak,
} as const;

/** Backgrounds behind people's initials. Initials are drawn in ink on top. */
export const AVATAR_COLOURS = {
  light: ['#DCEEFC', '#F7E6D4', '#DCE6EF', '#E8E8E8', '#D2E9FA', '#F2DFCB'],
  dark: ['#284A63', '#5A4329', '#2E445A', '#45484B', '#21445E', '#4E3B26'],
} as const;

/** Values that are not Tailwind colours: shadows, the dimmed backdrop, the page behind the phone frame. */
export const EXTRAS = {
  light: { scrim: 'rgba(38,38,38,.45)', 'shadow-sm': 'rgba(38,38,38,.14)', 'shadow-lg': 'rgba(38,38,38,.22)', page: '#E4E9EE', 'theme-color': BRAND.sail },
  dark: { scrim: 'rgba(0,0,0,.6)', 'shadow-sm': 'rgba(0,0,0,.45)', 'shadow-lg': 'rgba(0,0,0,.6)', page: '#141414', 'theme-color': BRAND.sail },
} as const;

/**
 * Map colours. Both themes use the same OpenStreetMap tiles. In dark mode the
 * tiles are inverted and hue-rotated by MapLibre's raster paint properties,
 * which gives a dark basemap without another tile provider or API key.
 */
export const MAP_THEME = {
  light: {
    background: '#C9DDEE',
    radiusFill: BRAND.ocean,
    radiusLine: BRAND.ocean,
    raster: { 'raster-brightness-min': 0.08, 'raster-brightness-max': 1, 'raster-saturation': -0.45, 'raster-contrast': -0.08, 'raster-hue-rotate': 0 },
  },
  dark: {
    background: '#1E2327',
    radiusFill: BRAND.sky,
    radiusLine: BRAND.sky,
    raster: { 'raster-brightness-min': 0.9, 'raster-brightness-max': 0.08, 'raster-saturation': -0.7, 'raster-contrast': 0.05, 'raster-hue-rotate': 180 },
  },
} as const;

function cssVars(mode: Resolved) {
  const out: string[] = [];
  for (const [k, v] of Object.entries(mode === 'dark' ? DARK : LIGHT)) out.push(`--${k}: ${v};`);
  AVATAR_COLOURS[mode].forEach((c, i) => out.push(`--avatar-${i}: ${c};`));
  for (const [k, v] of Object.entries(EXTRAS[mode])) if (k !== 'theme-color') out.push(`--${k}: ${v};`);
  return out.join(' ');
}

/** Writes both themes into a <style> tag. The `dark` class on <html> switches between them. */
export function installTheme() {
  const el = document.createElement('style');
  el.id = 'waymate-theme';
  el.textContent = `:root { ${cssVars('light')} color-scheme: light; } :root.dark { ${cssVars('dark')} color-scheme: dark; }`;
  document.head.appendChild(el);
}

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');
export const resolveTheme = (mode: ThemeMode): Resolved => (mode === 'system' ? (darkQuery().matches ? 'dark' : 'light') : mode);

export function applyResolvedTheme(r: Resolved) {
  document.documentElement.classList.toggle('dark', r === 'dark');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', EXTRAS[r]['theme-color']);
}

/** Calls back when the device switches between light and dark. */
export function onSystemThemeChange(fn: () => void) {
  const q = darkQuery();
  q.addEventListener('change', fn);
  return () => q.removeEventListener('change', fn);
}

// The theme choice is the one setting kept across reloads, so an override doesn't flip back.
const KEY = 'waymate-theme';
export function loadThemeMode(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  } catch {
    return 'system';
  }
}
export function saveThemeMode(m: ThemeMode) {
  try { localStorage.setItem(KEY, m); } catch { /* private mode: keep it in memory only */ }
}
