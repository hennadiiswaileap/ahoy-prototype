import { create } from 'zustand';
import { PEOPLE, EXTRA_BOATS, DEMO_PHONE, MARINAS, type ContactKind, type BoatType, type SceneKind } from './demoData';
import { GROUPS, INITIAL_UNREAD, CANNED, SKI_CANNED, ASHORE, CODE_GROUPS, ME, initialPosts, initialMessages, skiPosts, skiMessages, type Group, type GroupPost, type ChatMsg, type GroupIcon, type GroupTone, type PostAudience, type LocationAudience } from './demoGroups';
import { MAP, SIM } from './config';
import { clock, spawnExtra, posAt, userTrack, distanceM, type Boat, type Scenario } from './sim';
import { applyResolvedTheme, loadThemeMode, resolveTheme, saveThemeMode, type ThemeMode } from './theme';

export type Screen = 'welcome' | 'signin' | 'phone' | 'code' | 'community' | 'profile' | 'permissions' | 'app';
export type Tab = 'map' | 'feed' | 'chats' | 'groups' | 'profile';
/** Scope A is the agreed MVP. Scope B (MVP+) adds groups, group feed and group chat. */
export type Scope = 'a' | 'b';
/** `friends` exists in Scope A, `groups` (selected groups) in Scope B. */
export type Visibility = 'everyone' | 'friends' | 'groups' | 'invisible';
export type Radius = 1 | 5 | 10 | 25;
export type Vertical = 'sailing' | 'other';
export type GroupSheet = null | 'create' | 'join' | 'invite' | 'members' | 'compose';

export const TABS_BY_SCOPE: Record<Scope, Tab[]> = {
  a: ['map', 'feed', 'chats', 'profile'],
  b: ['map', 'groups', 'feed', 'profile'],
};

export interface Profile {
  avatar: number;
  name: string;
  boat: string;
  model: string;
  type: BoatType;
  mmsi: string;
  contact: ContactKind;
  handle: string;
  /** Community chosen at sign-up. */
  vertical: Vertical;
  /** What the user typed when they chose Other. */
  otherActivity: string;
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
  showMarinas: boolean;
  follow: boolean;
  sheetOpen: boolean;
  /** Scope A list filter. */
  listFilter: 'all' | 'friends';
  /** Scope B map filter: 'all' or a group ID. */
  mapGroup: string;
  selectedId: string | null;
  contactOpen: boolean;
  marinaId: string | null;
  visSheetOpen: boolean;
  friends: Record<string, true>;
  visibility: Visibility;
  /** Visibility to restore when stealth mode is switched off. */
  prevVisibility: Visibility;
  visibleGroups: string[];
  sharing: boolean;
  offline: boolean;
  offlineSince: number;
  fast: boolean;
  demoOpen: boolean;
  extras: Boat[];
  subpage: null | 'friends' | 'language' | 'privacy' | 'appearance';
  confirm: null | 'signout' | 'delete';
  chatId: string | null;
  toast: Toast | null;
  /** Bumped every UI tick so lists and cards recompute. */
  tick: number;
  realSec: number;
  recenterSeq: number;
  zoomSeq: number;
  fitSeq: number;
  focus: { lon: number; lat: number; seq: number } | null;

  scope: Scope;
  /** Scope badges and demo hints. Off for focus groups (?badges=off). */
  badges: boolean;
  theme: ThemeMode;
  /** The theme actually showing (system setting resolved). */
  dark: boolean;
  scenario: Scenario;

  groups: Group[];
  posts: GroupPost[];
  messages: ChatMsg[];
  unread: Record<string, number>;
  typing: { groupId: string; name: string } | null;
  groupId: string | null;
  groupTab: 'feed' | 'chat';
  /** Feed tab filter: 'all', 'nearby' or a group ID. */
  feedFilter: string;
  groupSheet: GroupSheet;
  /** Group the invite sheet is for. */
  inviteFor: string | null;
  /** Group preselected in the new-post sheet. */
  composeGroup: string | null;
  /** Person the "Add to group" sheet is for. */
  addToGroupFor: string | null;

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
  setScope: (s: Scope) => void;
  setTheme: (m: ThemeMode) => void;
  setScenario: (s: Scenario) => void;
  openGroup: (id: string) => void;
  setGroupTab: (t: 'feed' | 'chat') => void;
  sendMessage: (groupId: string, text: string, photo?: SceneKind) => void;
  addPost: (audience: PostAudience, loc: LocationAudience, scene: SceneKind, caption: string) => void;
  likePost: (id: string) => void;
  createGroup: (name: string, icon: GroupIcon, tone: GroupTone) => string;
  joinGroup: (g: Group) => void;
  joinByCode: (code: string) => boolean;
  toggleMember: (groupId: string, personId: string) => void;
  toggleVisibleGroup: (groupId: string) => void;
  showGroupOnMap: (groupId: string) => void;
  toggleStealth: () => void;
  setBadges: (on: boolean) => void;
}

const initialProfile: Profile = { avatar: 1, name: 'Jonas', boat: 'Morgenwind', model: 'Bavaria 34', type: 'sail', mmsi: '', contact: 'whatsapp', handle: '', vertical: 'sailing', otherActivity: '' };

const cloneGroups = () => GROUPS.map((g) => ({ ...g, members: [...g.members] }));

const initial = () => ({
  screen: 'welcome' as Screen,
  phone: '',
  countryCode: '+49',
  profile: { ...initialProfile },
  editingProfile: false,
  tab: 'map' as Tab,
  radius: MAP.defaultRadius as Radius,
  layer: 'nautical' as const,
  showMarinas: true,
  follow: true,
  sheetOpen: false,
  listFilter: 'all' as const,
  mapGroup: 'all',
  selectedId: null,
  contactOpen: false,
  marinaId: null,
  visSheetOpen: false,
  friends: Object.fromEntries(PEOPLE.filter((p) => p.friend).map((p) => [p.id, true])) as Record<string, true>,
  visibility: 'everyone' as Visibility,
  prevVisibility: 'everyone' as Visibility,
  visibleGroups: ['family', 'pier7'],
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
  fitSeq: 0,
  focus: null,
  scenario: 'sail' as Scenario,
  groups: cloneGroups(),
  posts: initialPosts(),
  messages: initialMessages(),
  unread: { ...INITIAL_UNREAD },
  typing: null,
  groupId: null,
  groupTab: 'feed' as const,
  feedFilter: 'all',
  groupSheet: null as GroupSheet,
  inviteFor: null,
  composeGroup: null,
  addToGroupFor: null,
});

let toastTimer: ReturnType<typeof setTimeout> | undefined;
let replyTimers: ReturnType<typeof setTimeout>[] = [];
const replyCursor: Record<string, number> = {};
const clearReplies = () => { replyTimers.forEach(clearTimeout); replyTimers = []; };

const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => 'AHOY-' + Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

export function personName(id: string): string {
  if (id === ME) return useApp.getState().profile.name || 'You';
  return PEOPLE.find((p) => p.id === id)?.name ?? EXTRA_BOATS.find((x) => x.id === id)?.name ?? ASHORE[id] ?? 'Sailor';
}

/** Where a new post is tagged: the nearest marina, or the slopes on the ski trip. */
export function placeTag(sc: Scenario) {
  if (sc === 'ski') return 'On the slopes';
  const me = posAt(userTrack('sail'), clock.now());
  const near = [...MARINAS].sort((a, b) => distanceM(me, a) - distanceM(me, b))[0];
  return `Near ${near.name}`;
}

export const useApp = create<State>((set, get) => {
  /** Two or three group members "reply" a few seconds after the user writes. */
  const scheduleReplies = (gid: string) => {
    clearReplies();
    const s = get();
    const g = s.groups.find((x) => x.id === gid);
    if (!g) return;
    const ski = s.scenario === 'ski' && gid === 'family';
    const pool = (ski ? SKI_CANNED : CANNED[gid] ?? []).filter((l) => g.members.includes(l.authorId));
    if (!pool.length) return;
    const count = Math.min(pool.length, Math.random() < 0.5 ? 2 : 3);
    let t = 1400;
    for (let i = 0; i < count; i++) {
      const c = replyCursor[gid] ?? 0;
      replyCursor[gid] = c + 1;
      const line = pool[c % pool.length];
      const name = personName(line.authorId);
      replyTimers.push(setTimeout(() => set({ typing: { groupId: gid, name } }), t));
      t += 1700 + Math.random() * 900;
      replyTimers.push(setTimeout(() => {
        const st = get();
        const viewing = st.tab === 'groups' && st.groupId === gid && st.groupTab === 'chat';
        const msg: ChatMsg = { id: uid('c'), groupId: gid, authorId: line.authorId, author: name, at: Date.now(), text: line.text, ...(ski ? { ski: true } : {}) };
        set({ messages: [...st.messages, msg], typing: null, unread: viewing ? st.unread : { ...st.unread, [gid]: (st.unread[gid] ?? 0) + 1 } });
      }, t));
      t += 600;
    }
  };

  return {
    ...initial(),
    scope: 'b' as Scope,
    badges: true,
    theme: loadThemeMode(),
    dark: resolveTheme(loadThemeMode()) === 'dark',
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
      set({ extras: [...extras, b], screen: 'app', tab: 'map', demoOpen: false, scenario: 'sail' });
      get().showToast(`${b.name} on ${b.boat} is nearby`, 'sailboat');
    },
    resetAll: () => {
      clock.reset(); clock.setFrozen(false); clock.setSpeed(1);
      clearReplies();
      set({ ...initial() });
    },
    enterApp: () => {
      clock.reset();
      const p = get().profile;
      // Scope B: the community chosen at sign-up decides whether you're in the Sailing group.
      let groups = get().groups;
      const inSailing = groups.some((g) => g.id === 'sailing');
      if (p.vertical === 'sailing' && !inSailing) groups = [...groups, { ...GROUPS.find((g) => g.id === 'sailing')!, members: [...GROUPS.find((g) => g.id === 'sailing')!.members] }];
      if (p.vertical === 'other' && inSailing) groups = groups.filter((g) => g.id !== 'sailing');
      set({
        screen: 'app', tab: 'map', follow: true, sheetOpen: false, groups,
        visibleGroups: get().visibleGroups.filter((id) => groups.some((g) => g.id === id)),
        profile: { ...p, handle: p.handle || `${get().countryCode} ${get().phone || DEMO_PHONE}` },
      });
      get().showToast(`Welcome aboard, ${p.name || 'skipper'}`, 'sailboat');
    },
    setRadius: (r) => set({ radius: r, follow: true, zoomSeq: get().zoomSeq + 1 }),

    setScope: (scope) => {
      const s = get();
      if (s.scope === scope) return;
      const vis: Visibility = scope === 'b' ? (s.visibility === 'friends' ? 'groups' : s.visibility) : s.visibility === 'groups' ? 'friends' : s.visibility;
      const tab = TABS_BY_SCOPE[scope].includes(s.tab) ? s.tab : 'map';
      if (scope === 'a' && s.scenario === 'ski') get().setScenario('sail');
      set({
        scope, visibility: vis, tab, mapGroup: 'all', listFilter: 'all',
        groupId: null, groupSheet: null, addToGroupFor: null, chatId: null, subpage: null, selectedId: null, contactOpen: false,
      });
      get().showToast(scope === 'b' ? 'Scope B (MVP+): groups on' : 'Scope A (MVP)', 'info');
    },
    setTheme: (m) => {
      saveThemeMode(m);
      const r = resolveTheme(m);
      applyResolvedTheme(r);
      set({ theme: m, dark: r === 'dark' });
    },
    setScenario: (sc) => {
      const s = get();
      if (s.scenario === sc) return;
      clearReplies();
      const posts = s.posts.filter((p) => !p.ski);
      const messages = s.messages.filter((m) => !m.ski);
      set({
        scenario: sc,
        posts: sc === 'ski' ? [...skiPosts(), ...posts] : posts,
        messages: sc === 'ski' ? [...messages, ...skiMessages()] : messages,
        unread: sc === 'ski' ? { ...s.unread, family: (s.unread.family ?? 0) + 3 } : s.unread,
        typing: null, selectedId: null, contactOpen: false, marinaId: null, mapGroup: 'all', sheetOpen: false,
        follow: true, recenterSeq: s.recenterSeq + 1, tab: 'map', screen: s.screen === 'app' ? 'app' : s.screen, demoOpen: false,
      });
      if (s.screen !== 'app') get().enterApp();
      get().showToast(sc === 'ski' ? 'Ski trip: Family Crew in the Alps' : 'Back on Kiel Fjord', sc === 'ski' ? 'snowflake' : 'sailboat');
    },

    openGroup: (id) => {
      const unread = get().unread[id] ?? 0;
      set({ groupId: id, groupTab: unread > 0 ? 'chat' : 'feed', unread: unread > 0 ? { ...get().unread, [id]: 0 } : get().unread });
    },
    setGroupTab: (t) => {
      const id = get().groupId;
      set({ groupTab: t, ...(t === 'chat' && id ? { unread: { ...get().unread, [id]: 0 } } : {}) });
    },
    sendMessage: (gid, text, photo) => {
      const s = get();
      const msg: ChatMsg = { id: uid('c'), groupId: gid, authorId: ME, author: s.profile.name || 'You', at: Date.now(), text, ...(photo ? { photo } : {}), ...(s.scenario === 'ski' && gid === 'family' ? { ski: true } : {}) };
      set({ messages: [...s.messages, msg] });
      scheduleReplies(gid);
    },
    addPost: (audience, loc, scene, caption) => {
      const s = get();
      const post: GroupPost = {
        id: uid('p'), audience, loc, authorId: ME, author: s.profile.name || 'You', at: Date.now(), scene, hull: '#F4F1EA',
        caption, place: placeTag(s.scenario), likes: 0, comments: 0, ...(s.scenario === 'ski' && audience.groups.includes('family') ? { ski: true } : {}),
      };
      set({ posts: [post, ...s.posts], groupSheet: null, composeGroup: null });
      const label = audienceText(audience, s.groups);
      get().showToast(label === 'Everyone' ? 'Posted for everyone' : `Posted to ${label}`, 'check');
    },
    likePost: (id) => set({ posts: get().posts.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)) }),
    createGroup: (name, icon, tone) => {
      const g: Group = { id: uid('g'), name, type: 'private', icon, tone, members: [ME], memberCount: 1, admin: true, code: newCode() };
      set({ groups: [g, ...get().groups] });
      return g.id;
    },
    joinGroup: (g) => {
      const s = get();
      if (s.groups.some((x) => x.id === g.id)) return;
      set({ groups: [...s.groups, { ...g, members: [ME, ...g.members.filter((m) => m !== ME)], memberCount: g.memberCount + 1 }] });
      get().showToast(`You joined ${g.name}`, 'user-check');
    },
    joinByCode: (code) => {
      const g = CODE_GROUPS[code.trim().toUpperCase()];
      if (!g) return false;
      if (get().groups.some((x) => x.id === g.id)) { get().showToast(`You’re already in ${g.name}`, 'info'); return true; }
      get().joinGroup(g);
      return true;
    },
    toggleMember: (gid, pid) => {
      const s = get();
      const g = s.groups.find((x) => x.id === gid);
      if (!g) return;
      const has = g.members.includes(pid);
      const groups = s.groups.map((x) => (x.id === gid ? { ...x, members: has ? x.members.filter((m) => m !== pid) : [...x.members, pid], memberCount: x.memberCount + (has ? -1 : 1) } : x));
      set({ groups });
      get().showToast(`${personName(pid)} ${has ? 'removed from' : 'added to'} ${g.name}`, has ? 'user' : 'user-check');
    },
    toggleVisibleGroup: (gid) => {
      const v = get().visibleGroups;
      if (v.includes(gid) && v.length === 1) { get().showToast('Pick at least one group', 'info'); return; }
      set({ visibleGroups: v.includes(gid) ? v.filter((x) => x !== gid) : [...v, gid], visibility: 'groups' });
    },
    showGroupOnMap: (gid) => set({ tab: 'map', mapGroup: gid, groupId: null, selectedId: null, sheetOpen: false, follow: false, fitSeq: get().fitSeq + 1 }),
    toggleStealth: () => {
      const s = get();
      if (!s.sharing || s.visibility === 'invisible') {
        // Restore what the user had before, adjusted to the current scope.
        let v = s.visibility === 'invisible' ? s.prevVisibility : s.visibility;
        if (v === 'invisible') v = 'everyone';
        if (s.scope === 'b' && v === 'friends') v = 'groups';
        if (s.scope === 'a' && v === 'groups') v = 'friends';
        set({ sharing: true, visibility: v });
        get().showToast(`You’re visible again. ${visibilityText({ ...s, sharing: true, visibility: v }).b}.`, 'eye');
      } else {
        set({ prevVisibility: s.visibility, visibility: 'invisible' });
        get().showToast('You’re invisible. Nobody can see your position.', 'eye-off');
      }
    },
    setBadges: (on) => {
      set({ badges: on });
      // Keep the choice in the URL so a reload (or a shared link) stays in the same mode.
      try {
        const u = new URL(window.location.href);
        if (on) u.searchParams.delete('badges'); else u.searchParams.set('badges', 'off');
        window.history.replaceState(null, '', u);
      } catch { /* not critical */ }
    },
  };
});

/** Status pill text, for example "Visible to 2 groups". */
export function visibilityText(s: Pick<State, 'sharing' | 'visibility' | 'visibleGroups' | 'groups'>) {
  if (!s.sharing) return { a: 'Location off', b: 'You are hidden', off: true };
  if (s.visibility === 'invisible') return { a: 'Invisible', b: 'Nobody can see you', off: true };
  if (s.visibility === 'friends') return { a: 'Sharing location', b: 'Friends only', off: false };
  if (s.visibility === 'groups') {
    const n = s.visibleGroups.length;
    const one = n === 1 ? s.groups.find((g) => g.id === s.visibleGroups[0])?.name : null;
    return { a: 'Sharing location', b: one ? `Visible to ${one}` : `Visible to ${n} groups`, off: false };
  }
  return { a: 'Sharing location', b: 'Visible to everyone', off: false };
}

/** "Everyone", "Family Crew", "Family Crew, Pier 7 Friends" or "Family Crew +2". */
export function audienceText(a: { kind: string; groups: string[] }, groups: Group[]) {
  if (a.kind === 'everyone') return 'Everyone';
  const names = a.groups.map((id) => groups.find((g) => g.id === id)?.name).filter(Boolean) as string[];
  if (!names.length) return 'Your groups';
  return names.length <= 2 ? names.join(', ') : `${names[0]} +${names.length - 1}`;
}

/** Read ?demo, ?screen=map, ?scope=a|b, ?theme=light|dark|system and ?badges=off from the URL. */
export function applyUrlFlags() {
  const q = new URLSearchParams(window.location.search);
  const st = useApp.getState();
  if (q.get('badges') === 'off') useApp.setState({ badges: false });
  const scope = q.get('scope')?.toLowerCase();
  if (scope === 'a' || scope === 'b') useApp.setState({ scope });
  const theme = q.get('theme');
  if (theme === 'light' || theme === 'dark' || theme === 'system') st.setTheme(theme);
  if (q.has('demo')) st.set({ demoOpen: true });
  if (q.get('screen') === 'map') st.enterApp();
}
