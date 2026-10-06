import { PEOPLE, USER_ROUTE, USER_START_DEG, USER_KNOTS, EXTRA_BOATS, SKI_PEOPLE, SKI_USER_ROUTE, SKI_USER_KNOTS, type Person, type Route } from './demoData';
import { SIM } from './config';

/** Metres per degree of longitude at a latitude, and per degree of latitude. */
const kx = (lat: number) => 111320 * Math.cos((lat * Math.PI) / 180);
const KY = 111250;
export const NM = 1852;

export type Scenario = 'sail' | 'ski';
export type Unit = 'nm' | 'km';
export const unitFor = (sc: Scenario): Unit => (sc === 'ski' ? 'km' : 'nm');
export const unitMetres = (u: Unit) => (u === 'km' ? 1000 : NM);

export interface Track {
  route: Route;
  dir: 1 | -1;
  omega: number; // rad per sim-second
  th0: number;
  fixedHeading?: number;
}
export interface Pos { lon: number; lat: number; heading: number; theta: number }

export function makeTrack(route: Route, knots: number, dir: 1 | -1, th0: number, fixedHeading?: number): Track {
  const a = route.rx, b = route.ry;
  const per = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
  const omega = per > 0 ? (knots * 0.5144) / (per / (2 * Math.PI)) : 0;
  return { route, dir, omega, th0, fixedHeading };
}

export function posAt(tr: Track, t: number): Pos {
  const r = tr.route;
  if (!r.rx) return { lon: r.center[0], lat: r.center[1], heading: tr.fixedHeading ?? 0, theta: 0 };
  const th = tr.th0 + tr.dir * tr.omega * t;
  const c = Math.cos(r.rot), s = Math.sin(r.rot), ct = Math.cos(th), st = Math.sin(th);
  const x = r.rx * ct * c - r.ry * st * s; // east
  const y = r.rx * ct * s + r.ry * st * c; // south
  const dx = (-r.rx * st * c - r.ry * ct * s) * tr.dir;
  const dy = (-r.rx * st * s + r.ry * ct * c) * tr.dir;
  return { lon: r.center[0] + x / kx(r.center[1]), lat: r.center[1] - y / KY, heading: ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360, theta: th };
}

type LL = { lon: number; lat: number };
export function distanceM(a: LL, b: LL) {
  const dx = (b.lon - a.lon) * kx((a.lat + b.lat) / 2), dy = (b.lat - a.lat) * KY;
  return Math.hypot(dx, dy);
}
export function bearingDeg(a: LL, b: LL) {
  const dx = (b.lon - a.lon) * kx((a.lat + b.lat) / 2), dy = (b.lat - a.lat) * KY;
  return ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;
}
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
export const compass = (deg: number) => COMPASS[Math.round(deg / 45) % 8];
export function distLabel(m: number, unit: Unit) {
  const n = m / unitMetres(unit);
  return n < 0.1 ? `< 0.1 ${unit}` : `${n < 10 ? n.toFixed(1) : Math.round(n)} ${unit}`;
}

/** Circle polygon (GeoJSON ring) around a point. */
export function circleRing(center: LL, radiusM: number, steps = 96): [number, number][] {
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    ring.push([center.lon + (Math.cos(a) * radiusM) / kx(center.lat), center.lat + (Math.sin(a) * radiusM) / KY]);
  }
  return ring;
}

// ---------- tracks ----------
export const USER_TRACK = makeTrack(USER_ROUTE, USER_KNOTS, 1, (USER_START_DEG * Math.PI) / 180);
const SKI_USER_TRACK = makeTrack(SKI_USER_ROUTE, SKI_USER_KNOTS, 1, 0);
export const userTrack = (sc: Scenario) => (sc === 'ski' ? SKI_USER_TRACK : USER_TRACK);

export const TRACKS: Record<string, Track> = {};
PEOPLE.forEach((p, i) => {
  TRACKS[p.id] = makeTrack(p.route, p.knots, p.dir, (i * 2.39996 + (p.phase ?? 0)) % (Math.PI * 2), p.heading);
});
SKI_PEOPLE.forEach((p, i) => {
  TRACKS[p.id] = makeTrack(p.route, p.knots, p.dir, (i * 1.7) % (Math.PI * 2), p.heading);
});

export type Boat = Person;

/** The group-member ID behind a map person. Ski trip people use an `s-` prefix. */
export const memberId = (id: string) => id.replace(/^s-/, '');

/** Creates an extra boat that starts right next to the user (same angle on a smaller copy of the user's loop). */
export function spawnExtra(index: number, simT: number): Boat | null {
  const X = EXTRA_BOATS[index];
  if (!X) return null;
  const route: Route = { ...USER_ROUTE, rx: USER_ROUTE.rx * X.scale, ry: USER_ROUTE.ry * X.scale };
  const tr = makeTrack(route, X.knots, X.dir, 0);
  const userTheta = posAt(USER_TRACK, simT).theta;
  tr.th0 = userTheta - X.dir * tr.omega * simT;
  TRACKS[X.id] = tr;
  const { scale: _s, ...rest } = X;
  return { ...rest, route };
}

// ---------- clock ----------
/** Continuous simulation clock so markers can be animated at 60 fps. */
export class SimClock {
  private base = 0;
  private realStart = performance.now();
  private speed = 1;
  private frozen = false;
  now() {
    if (this.frozen) return this.base;
    return this.base + ((performance.now() - this.realStart) / 1000) * SIM.factor * this.speed;
  }
  private rebase() { this.base = this.now(); this.realStart = performance.now(); }
  setSpeed(mult: number) { this.rebase(); this.speed = mult; }
  setFrozen(f: boolean) { if (f === this.frozen) return; this.rebase(); this.frozen = f; this.realStart = performance.now(); }
  reset() { this.base = 0; this.realStart = performance.now(); }
}
export const clock = new SimClock();

export interface BoatInfo {
  pos: Pos;
  dist: number;
  distLabel: string;
  bearing: number;
  bearingLabel: string;
  knots: number;
  seenMin: number;
  seenLabel: string;
  live: boolean;
}

export function boatInfo(b: Boat, idx: number, t: number, me: Pos, opts: { offline: boolean; realSec: number; offlineMin: number; unit: Unit }): BoatInfo {
  const pos = posAt(TRACKS[b.id], t);
  const dist = distanceM(me, pos);
  const bearing = bearingDeg(me, pos);
  let seenMin: number;
  if (b.staleMinutes != null) seenMin = b.staleMinutes + Math.floor(opts.realSec / 60);
  else seenMin = Math.floor(((t + (idx + 3) * 37) % (b.reportEvery || 120)) / 60);
  if (opts.offline) seenMin += opts.offlineMin;
  const knots = b.staleMinutes != null ? 0 : Math.max(0.5, b.knots + Math.sin(t / 97 + idx) * 0.35);
  return {
    pos, dist, distLabel: distLabel(dist, opts.unit), bearing, bearingLabel: compass(bearing), knots, seenMin,
    seenLabel: seenMin < 1 ? 'Just now' : `${seenMin} min ago`, live: b.staleMinutes == null && !opts.offline,
  };
}
