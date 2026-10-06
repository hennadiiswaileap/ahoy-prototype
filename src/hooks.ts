import { useEffect, useRef } from 'react';
import { useApp } from './store';
import { SIM } from './config';
import { PEOPLE, SKI_PEOPLE } from './demoData';
import { ME, type Group } from './demoGroups';
import { clock, posAt, userTrack, boatInfo, unitFor, memberId, type Boat, type BoatInfo, type Scenario, type Unit } from './sim';
import { applyResolvedTheme, onSystemThemeChange, resolveTheme } from './theme';

/** Long press (650 ms) handler props, used on the app logo to open the demo panel. */
export function useLongPress(fn: () => void, ms = 650) {
  const t = useRef<ReturnType<typeof setTimeout>>();
  const clear = () => clearTimeout(t.current);
  return {
    onPointerDown: () => { clear(); t.current = setTimeout(fn, ms); },
    onPointerUp: clear,
    onPointerLeave: clear,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };
}

/** Drives the UI refresh tick (distances, last seen) and a real-time seconds counter. */
export function useUiClock() {
  useEffect(() => {
    let n = 0;
    const iv = setInterval(() => {
      n++;
      const s = useApp.getState();
      s.set({ realSec: s.realSec + 1, ...(n % Math.round(SIM.uiTickMs / 1000) === 0 ? { tick: s.tick + 1 } : {}) });
    }, 1000);
    return () => clearInterval(iv);
  }, []);
}

/** Applies the theme setting (System / Light / Dark) and follows the device when it's System. */
export function useThemeSync() {
  const mode = useApp((s) => s.theme);
  useEffect(() => {
    const apply = () => {
      const r = resolveTheme(mode);
      applyResolvedTheme(r);
      useApp.getState().set({ dark: r === 'dark' });
    };
    apply();
    return mode === 'system' ? onSystemThemeChange(apply) : undefined;
  }, [mode]);
}

/** Everyone shown on the map: boats on Kiel Fjord, or Family Crew on the ski trip. */
export function mapPeople(scenario: Scenario, extras: Boat[]): Boat[] {
  return scenario === 'ski' ? SKI_PEOPLE : [...PEOPLE, ...extras];
}

/** IDs of people who share a private group with the user (Scope B teak ring). */
export function privateGroupMates(groups: Group[]): Set<string> {
  const out = new Set<string>();
  groups.forEach((g) => g.type === 'private' && g.members.forEach((m) => m !== ME && out.add(m)));
  return out;
}

/** The user's private groups that include this person. */
export function sharedPrivateGroups(groups: Group[], personId: string) {
  const id = memberId(personId);
  return groups.filter((g) => g.type === 'private' && g.members.includes(id));
}

/** Snapshot of everyone relative to the user, recomputed on each UI tick. */
export function useBoatInfos(): { boats: Boat[]; infos: Record<string, BoatInfo>; unit: Unit } {
  const extras = useApp((s) => s.extras);
  const scenario = useApp((s) => s.scenario);
  useApp((s) => s.tick);
  const offline = useApp((s) => s.offline);
  const realSec = useApp((s) => Math.floor(s.realSec / 60));
  const offlineSince = useApp((s) => s.offlineSince);
  const t = clock.now();
  const me = posAt(userTrack(scenario), t);
  const boats = mapPeople(scenario, extras);
  const unit = unitFor(scenario);
  const offlineMin = 4 + Math.floor((useApp.getState().realSec - offlineSince) / 60);
  const infos: Record<string, BoatInfo> = {};
  boats.forEach((b, i) => { infos[b.id] = boatInfo(b, i, t, me, { offline, realSec: realSec * 60, offlineMin, unit }); });
  return { boats, infos, unit };
}

/** "Just now", "12 min", "3 h", "Yesterday", "Mon". */
export function timeAgo(at: number) {
  const min = Math.floor((Date.now() - at) / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min`;
  if (min < 24 * 60) return `${Math.floor(min / 60)} h`;
  if (min < 48 * 60) return 'Yesterday';
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(at);
}
export const clockTime = (at: number) => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(at);
