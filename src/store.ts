import { create } from 'zustand';
import { PEOPLE, DEMO_PHONE, type ContactKind, type BoatType } from './demoData';
import { MAP, SIM } from './config';
import { clock, spawnExtra, type Boat } from './sim';

export type Screen = 'welcome' | 'signin' | 'phone' | 'code' | 'profile' | 'permissions' | 'app';
export type Tab = 'map' | 'feed' | 'ports' | 'chats' | 'profile';
export type Visibility = 'everyone' | 'friends' | 'invisible';
export type Radius = 1 | 5 | 10 | 25;

export interface Profile {
  avatar: number;
  name: string;
  boat: string;
  model: string;
  type: BoatType;
  mmsi: string;
  contact: ContactKind;
  handle: string;
}

interface Toast { id: number; msg: string; icon?: string }

interface State {
  screen: Screen;
  phone: string;
  countryCode: string;
  profile: Profile;
  editingProfile: boolean;
  tab: Tab;
  radius: Radius;
  layer: 'standard' | 'nautical';
  follow: boolean;
  sheetOpen: boolean;
  listFilter: 'all' | 'friends';
  selectedId: string | null;
  contactOpen: boolean;
  visSheetOpen: boolean;
  friends: Record<string, true>;
  visibility: Visibility;
  sharing: boolean;
  offline: boolean;
  offlineSince: number;
  fast: boolean;
  demoOpen: boolean;
  extras: Boat[];
  subpage: null | 'friends' | 'language' | 'privacy';
  confirm: null | 'signout' | 'delete';
  chatId: string | null;
  toast: Toast | null;
  /** Bumped every UI tick so lists and cards recompute. */
  tick: number;
  realSec: number;
  recenterSeq: number;
  zoomSeq: number;
  focus: { lon: number; lat: number; seq: number } | null;

  set: (p: Partial<State>) => void;
  go: (s: Screen) => void;
  showToast: (msg: string, icon?: string) => void;
  toggleFriend: (id: string) => void;
  setOffline: (v: boolean) => void;
  setFast: (v: boolean) => void;
  addBoat: () => void;
  resetAll: () => void;
  enterApp: () => void;
  setRadius: (r: Radius) => void;
}

const initialProfile: Profile = { avatar: 1, name: 'Jonas', boat: 'Morgenwind', model: 'Bavaria 34', type: 'sail', mmsi: '', contact: 'whatsapp', handle: '' };

const initial = () => ({
  screen: 'welcome' as Screen,
  phone: '',
  countryCode: '+49',
  profile: { ...initialProfile },
  editingProfile: false,
  tab: 'map' as Tab,
  radius: MAP.defaultRadius as Radius,
  layer: 'nautical' as const,
  follow: true,
  sheetOpen: false,
  listFilter: 'all' as const,
  selectedId: null,
  contactOpen: false,
  visSheetOpen: false,
  friends: Object.fromEntries(PEOPLE.filter((p) => p.friend).map((p) => [p.id, true])) as Record<string, true>,
  visibility: 'everyone' as Visibility,
  sharing: true,
  offline: false,
  offlineSince: 0,
  fast: false,
  demoOpen: false,
  extras: [] as Boat[],
  subpage: null,
  confirm: null,
  chatId: null,
  toast: null,
  tick: 0,
  realSec: 0,
  recenterSeq: 0,
  zoomSeq: 0,
  focus: null,
});

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useApp = create<State>((set, get) => ({
  ...initial(),
  set: (p) => set(p),
  go: (screen) => set({ screen }),
  showToast: (msg, icon) => {
    clearTimeout(toastTimer);
    set({ toast: { id: Date.now(), msg, icon } });
    toastTimer = setTimeout(() => set({ toast: null }), 2600);
  },
  toggleFriend: (id) => {
    const f = { ...get().friends };
    const b = [...PEOPLE, ...get().extras].find((x) => x.id === id);
    if (f[id]) { delete f[id]; get().showToast(`${b?.name} removed from friends`, 'user'); }
    else { f[id] = true; get().showToast(`${b?.name} added to friends`, 'user-check'); }
    set({ friends: f });
  },
  setOffline: (v) => { clock.setFrozen(v); set({ offline: v, offlineSince: get().realSec }); },
  setFast: (v) => { clock.setSpeed(v ? SIM.fastMultiplier : 1); set({ fast: v }); },
  addBoat: () => {
    const { extras } = get();
    const b = spawnExtra(extras.length, clock.now());
    if (!b) { get().showToast('All demo boats are already on the map', 'info'); return; }
    set({ extras: [...extras, b], screen: 'app', tab: 'map', demoOpen: false });
    get().showToast(`${b.name} on ${b.boat} is nearby`, 'sailboat');
  },
  resetAll: () => {
    clock.reset(); clock.setFrozen(false); clock.setSpeed(1);
    set({ ...initial() });
  },
  enterApp: () => {
    clock.reset();
    const p = get().profile;
    set({ screen: 'app', tab: 'map', follow: true, sheetOpen: false, profile: { ...p, handle: p.handle || `${get().countryCode} ${get().phone || DEMO_PHONE}` } });
    get().showToast(`Welcome aboard, ${p.name || 'skipper'}`, 'sailboat');
  },
  setRadius: (r) => set({ radius: r, follow: true, zoomSeq: get().zoomSeq + 1 }),
}));

/** Read ?demo / ?screen=map from the URL for live demos. */
export function applyUrlFlags() {
  const q = new URLSearchParams(window.location.search);
  const st = useApp.getState();
  if (q.has('demo')) st.set({ demoOpen: true });
  if (q.get('screen') === 'map') st.enterApp();
}
