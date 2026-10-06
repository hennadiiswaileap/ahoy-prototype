/**
 * App-wide configuration. Change the app name, tagline, simulation speed and
 * map settings here. Colours live in src/theme.ts.
 */
export const APP = {
  name: 'WayMate',
  tagline: 'See who’s sailing near you. Reach any boat in one tap.',
  version: '0.3 prototype',
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
  /** Free tiles, no API key. Swap for a commercial tile provider before production traffic. */
  osmTiles: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  seamarkTiles: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
  radii: [1, 5, 10, 25] as const,
  defaultRadius: 5 as 1 | 5 | 10 | 25,
  clusterBelowZoom: 10.3,
  /** Boat names show from this zoom, marina names from marinaNamesZoom. */
  namesZoom: 13,
  marinaNamesZoom: 12,
};
