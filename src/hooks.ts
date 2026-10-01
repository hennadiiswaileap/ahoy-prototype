import { useEffect, useRef } from 'react';
import { useApp } from './store';
import { SIM } from './config';
import { PEOPLE } from './demoData';
import { clock, posAt, USER_TRACK, boatInfo, type Boat, type BoatInfo } from './sim';

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

export function allBoats(extras: Boat[]): Boat[] {
  return [...PEOPLE, ...extras];
}

/** Snapshot of every boat relative to the user, recomputed on each UI tick. */
export function useBoatInfos(): { boats: Boat[]; infos: Record<string, BoatInfo> } {
  const extras = useApp((s) => s.extras);
  useApp((s) => s.tick);
  const offline = useApp((s) => s.offline);
  const realSec = useApp((s) => Math.floor(s.realSec / 60));
  const offlineSince = useApp((s) => s.offlineSince);
  const t = clock.now();
  const me = posAt(USER_TRACK, t);
  const boats = allBoats(extras);
  const offlineMin = 4 + Math.floor((useApp.getState().realSec - offlineSince) / 60);
  const infos: Record<string, BoatInfo> = {};
  boats.forEach((b, i) => { infos[b.id] = boatInfo(b, i, t, me, { offline, realSec: realSec * 60, offlineMin }); });
  return { boats, infos };
}
