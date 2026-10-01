/**
 * App-wide configuration. Change the app name, tagline and palette here.
 * The palette is pushed into CSS variables at startup (see main.tsx), so every
 * Tailwind colour class (bg-navy, text-sea, ...) follows these values.
 */
export const APP = {
  name: 'Ahoy',
  tagline: 'See who’s sailing near you. Reach any boat in one tap.',
  version: '0.1 prototype',
};

export const PALETTE = {
  navy: '#0B2545', // headers, primary text, active tab
  sea: '#1D5C96', // secondary actions, links, friend rings
  seaLight: '#8DB3D6', // map accents, borders, inactive states
  mist: '#EEF3F7', // app background
  white: '#FFFFFF', // cards, sheets, inputs
  signal: '#FF6B35', // primary CTA, "you" marker, live badges
  success: '#2E9E6A', // online / sharing location
  muted: '#5B6B7F', // secondary text, timestamps
};

export const SIM = {
  /** Simulation runs this many times faster than real time so movement is visible. */
  factor: 40,
  /** Demo panel "speed up" multiplier. */
  fastMultiplier: 4,
  /** How often numbers (distance, last seen) refresh in the UI. */
  uiTickMs: 2000,
};

export const MAP = {
  initialCenter: [10.205, 54.43] as [number, number],
  initialZoom: 10.9,
  /** Free tiles, no API key. Swap for a commercial tile provider before production traffic. */
  osmTiles: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  seamarkTiles: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
  radii: [1, 5, 10, 25] as const,
  defaultRadius: 5 as 1 | 5 | 10 | 25,
  clusterBelowZoom: 10.3,
};
