/**
 * Every colour in the app lives in this file.
 *
 * PALETTE is the client's boat palette, in a light and a dark version.
 * SUPPORT and EXTRAS are a few extra values derived from it (borders, fills,
 * status colours, shadows, the map). At startup the values are written into
 * CSS variables (see installTheme), and the Tailwind colour names in
 * src/index.css (bg-ink, text-ocean, ...) point at those variables.
 */

export type ThemeMode = 'system' | 'light' | 'dark';
export type Resolved = 'light' | 'dark';

export const PALETTE = {
  light: {
    ink: '#111418', // primary text, icons
    surface: '#FFFFFF', // cards, sheets
    background: '#F4F1EC', // app background (warm off-white, like canvas)
    teak: '#A8693B', // warm accents, chips, illustrations, highlights
    'dehler-red': '#C8102E', // primary CTA, "you" marker, live badges. Placeholder for the exact Dehler red.
    ocean: '#1D5C96', // other boats, links, secondary actions
    sky: '#8DB3D6', // map accents, borders, inactive states
    muted: '#5B6470', // secondary text, timestamps
  },
  dark: {
    ink: '#F4F1EC',
    surface: '#15191E',
    background: '#0B0E12',
    teak: '#C8875A',
    // The brief says #E0344C. White button text on it is 4.4:1, just under WCAG AA,
    // so it is nudged to #DD2F48 (4.6:1). Same hue, barely visible difference.
    'dehler-red': '#DD2F48',
    ocean: '#4C8CC9',
    sky: '#3A5F80',
    muted: '#9AA3AD',
  },
} as const;

/** Supporting colours. Not in the client's table, derived from it. */
export const SUPPORT = {
  light: {
    line: '#E2DCD2', // borders, dividers
    fill: '#F4F1EC', // subtle fill inside cards: chips, rows, info boxes
    'on-ink': '#FFFFFF', // text on ink-coloured buttons and bubbles
    'on-accent': '#FFFFFF', // text on dehler-red
    success: '#2E7D5B', // sharing location, online
    danger: '#C8102E', // destructive text (Delete account)
  },
  dark: {
    line: '#2A3038',
    fill: '#1F252C',
    'on-ink': '#0B0E12',
    'on-accent': '#FFFFFF',
    success: '#4CC38A',
    // Red text on a dark card needs a lighter red than the button fill to stay readable.
    danger: '#FF7A8A',
  },
} as const;

/** Backgrounds behind people's initials. Initials are drawn in ink on top. */
export const AVATAR_COLOURS = {
  light: ['#EAD9C6', '#D6E3EF', '#DFE6D8', '#F2D9DC', '#E3DFEC', '#E8E1D6'],
  dark: ['#4B3A2B', '#22384C', '#2E3A2B', '#4A2830', '#352F48', '#3B352C'],
} as const;

/** Values that are not Tailwind colours: shadows, the dimmed backdrop, the page behind the phone frame. */
export const EXTRAS = {
  light: { scrim: 'rgba(17,20,24,.42)', 'shadow-sm': 'rgba(17,20,24,.14)', 'shadow-lg': 'rgba(17,20,24,.22)', page: '#E4DED4', 'theme-color': '#F4F1EC' },
  dark: { scrim: 'rgba(0,0,0,.62)', 'shadow-sm': 'rgba(0,0,0,.5)', 'shadow-lg': 'rgba(0,0,0,.66)', page: '#050608', 'theme-color': '#0B0E12' },
} as const;

/**
 * Map colours. Both themes use the same OpenStreetMap tiles. In dark mode the
 * tiles are inverted and hue-rotated by MapLibre's raster paint properties,
 * which gives a dark basemap without another tile provider or API key.
 */
export const MAP_THEME = {
  light: {
    background: '#C9DDEE',
    radiusFill: '#8DB3D6',
    radiusLine: '#1D5C96',
    raster: { 'raster-brightness-min': 0.08, 'raster-brightness-max': 1, 'raster-saturation': -0.45, 'raster-contrast': -0.08, 'raster-hue-rotate': 0 },
  },
  dark: {
    background: '#0D1823',
    radiusFill: '#4C8CC9',
    radiusLine: '#4C8CC9',
    raster: { 'raster-brightness-min': 0.92, 'raster-brightness-max': 0.06, 'raster-saturation': -0.55, 'raster-contrast': 0.05, 'raster-hue-rotate': 180 },
  },
} as const;

function cssVars(mode: Resolved) {
  const out: string[] = [];
  for (const [k, v] of Object.entries({ ...PALETTE[mode], ...SUPPORT[mode] })) out.push(`--${k}: ${v};`);
  AVATAR_COLOURS[mode].forEach((c, i) => out.push(`--avatar-${i}: ${c};`));
  for (const [k, v] of Object.entries(EXTRAS[mode])) if (k !== 'theme-color') out.push(`--${k}: ${v};`);
  return out.join(' ');
}

/** Writes both themes into a <style> tag. The `dark` class on <html> switches between them. */
export function installTheme() {
  const el = document.createElement('style');
  el.id = 'ahoy-theme';
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
const KEY = 'ahoy-theme';
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
