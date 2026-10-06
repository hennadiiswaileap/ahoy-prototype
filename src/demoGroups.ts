/**
 * Scope B (MVP+) demo data: groups, group posts and group chats. All fictional.
 *
 * Group members are person IDs from demoData.ts (b1…b14 sail on the map,
 * x1…x3 are the demo panel's extra boats) plus people who are ashore right
 * now (m1…m5). "me" is the user.
 */
import { PEOPLE, EXTRA_BOATS, type SceneKind } from './demoData';

export type GroupType = 'community' | 'region' | 'private';
export type GroupIcon = 'sailboat' | 'globe' | 'map' | 'home' | 'anchor' | 'users' | 'flag' | 'sun';
export type GroupTone = 'teak' | 'ocean' | 'sky' | 'grey';

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  icon: GroupIcon;
  tone: GroupTone;
  members: string[];
  /** Shown member count. Region and community groups are far bigger than the people on the map. */
  memberCount: number;
  admin?: boolean;
  code?: string;
}

/** Who can see a post. */
export interface PostAudience { kind: 'everyone' | 'groups'; groups: string[] }
/** Who can see where a post was taken. Separate from the post audience (spec FEED-02). */
export interface LocationAudience { kind: 'nobody' | 'groups' | 'same'; groups: string[] }

export interface GroupPost {
  id: string;
  audience: PostAudience;
  loc: LocationAudience;
  authorId: string;
  author: string;
  at: number;
  scene: SceneKind;
  hull: string;
  caption: string;
  place: string;
  likes: number;
  comments: number;
  liked?: boolean;
  /** Only shown during the ski trip scenario. */
  ski?: boolean;
}

export interface ChatMsg {
  id: string;
  groupId: string;
  authorId: string;
  author: string;
  at: number;
  text: string;
  photo?: SceneKind;
  ski?: boolean;
}

export const ME = 'me';

/** Group members who aren't on the water right now. */
export const ASHORE: Record<string, string> = { m1: 'Gisela', m2: 'Paul', m3: 'Tom', m4: 'Lena', m5: 'Kai' };

const SAIL_IDS = [...PEOPLE.filter((p) => p.type !== 'motor').map((p) => p.id), ...EXTRA_BOATS.map((x) => x.id)];
const ALL_IDS = [...PEOPLE.map((p) => p.id), ...EXTRA_BOATS.map((x) => x.id)];

/** Groups the user is in at the start of the demo. */
export const GROUPS: Group[] = [
  { id: 'family', name: 'Family Crew', type: 'private', icon: 'home', tone: 'teak', members: [ME, 'b1', 'b3', 'b5', 'm1', 'm2'], memberCount: 6, admin: true, code: 'FAMILY-72' },
  { id: 'pier7', name: 'Pier 7 Friends', type: 'private', icon: 'anchor', tone: 'sky', members: [ME, 'b2', 'b6', 'b8', 'b14', 'm3', 'm4', 'm5'], memberCount: 8, code: 'PIER7-4K' },
  { id: 'kiel', name: 'Kiel Fjord', type: 'region', icon: 'map', tone: 'ocean', members: [ME, 'b1', 'b2', 'b3', 'b6', 'b7', 'b8', 'b10', 'b11', 'b13', 'b14'], memberCount: 1284 },
  { id: 'baltic', name: 'Baltic', type: 'region', icon: 'globe', tone: 'sky', members: [ME, ...ALL_IDS], memberCount: 12460 },
  { id: 'sailing', name: 'Sailing', type: 'community', icon: 'sailboat', tone: 'ocean', members: [ME, ...SAIL_IDS], memberCount: 48210 },
];

/** Region groups suggested from the user's location (shown in Join group). */
export const SUGGESTED_REGIONS: Group[] = [
  { id: 'eckernfoerde', name: 'Eckernförde Bay', type: 'region', icon: 'map', tone: 'sky', members: ['b7', 'b11'], memberCount: 642 },
  { id: 'luebeck', name: 'Lübeck Bay', type: 'region', icon: 'map', tone: 'sky', members: ['b4', 'b12'], memberCount: 2130 },
];

/** Private groups you can join by code. The demo code is offered as a shortcut chip. */
export const DEMO_JOIN_CODE = 'LABOE-24';
export const CODE_GROUPS: Record<string, Group> = {
  [DEMO_JOIN_CODE]: { id: 'laboe', name: 'Laboe Harbour Crew', type: 'private', icon: 'flag', tone: 'ocean', members: ['b4', 'b11', 'b12', 'm3'], memberCount: 11, code: DEMO_JOIN_CODE },
};

export const INITIAL_UNREAD: Record<string, number> = { family: 2, pier7: 3 };

const ago = (min: number) => Date.now() - min * 60_000;

export function initialPosts(): GroupPost[] {
  return [
    { id: 'fp1', audience: { kind: 'groups', groups: ['family'] }, loc: { kind: 'same', groups: [] }, authorId: 'b1', author: 'Frauke', at: ago(25), scene: 'sunset', hull: '#F4F1EA', caption: 'Windspiel is back in the water. First sail of the autumn!', place: 'Off Strande', likes: 5, comments: 2 },
    { id: 'pp1', audience: { kind: 'groups', groups: ['pier7'] }, loc: { kind: 'same', groups: [] }, authorId: 'b2', author: 'Jens', at: ago(50), scene: 'day', hull: '#0B2545', caption: 'Pier 7 barbecue is on: Saturday 18:00. Bring your own sausages.', place: 'Kiel-Schilksee', likes: 7, comments: 4 },
    { id: 'kp1', audience: { kind: 'groups', groups: ['kiel'] }, loc: { kind: 'same', groups: [] }, authorId: 'b6', author: 'Anke', at: ago(70), scene: 'lighthouse', hull: '#F4F1EA', caption: 'Heads-up: busy ferry traffic at the Friedrichsort narrows this afternoon.', place: 'Friedrichsort', likes: 23, comments: 8 },
    { id: 'fp2', audience: { kind: 'groups', groups: ['family'] }, loc: { kind: 'same', groups: [] }, authorId: 'b5', author: 'Mette', at: ago(180), scene: 'harbour', hull: '#7A2E2A', caption: 'Anchored off Laboe, kettle on. Who’s coming for dinner?', place: 'Laboe', likes: 4, comments: 3 },
    { id: 'bp1', audience: { kind: 'groups', groups: ['baltic'] }, loc: { kind: 'nobody', groups: [] }, authorId: 'b7', author: 'Malte', at: ago(240), scene: 'dawn', hull: '#0B2545', caption: 'Forecast: westerly 5 Bft tomorrow afternoon. Leave early.', place: 'Kiel Fjord', likes: 58, comments: 14 },
    { id: 'pp2', audience: { kind: 'groups', groups: ['pier7'] }, loc: { kind: 'nobody', groups: [] }, authorId: 'b8', author: 'Wiebke', at: ago(300), scene: 'harbour', hull: '#F4F1EA', caption: 'Found a berth in Düsternbrook at last.', place: 'Düsternbrook', likes: 9, comments: 2 },
    { id: 'kp2', audience: { kind: 'everyone', groups: [] }, loc: { kind: 'groups', groups: ['kiel'] }, authorId: 'b11', author: 'Lars', at: ago(420), scene: 'race', hull: '#F4F1EA', caption: 'Rounded the lighthouse at 6 knots on a beam reach. Best sail of the season.', place: 'Kiel Lighthouse', likes: 41, comments: 6 },
    { id: 'sp1', audience: { kind: 'groups', groups: ['sailing'] }, loc: { kind: 'same', groups: [] }, authorId: 'b12', author: 'Ida', at: ago(540), scene: 'sunset', hull: '#0B2545', caption: 'Golden hour, anchored, nowhere to be.', place: 'Marstal', likes: 132, comments: 17 },
    { id: 'fp3', audience: { kind: 'groups', groups: ['family'] }, loc: { kind: 'nobody', groups: [] }, authorId: 'b3', author: 'Henrik', at: ago(1560), scene: 'race', hull: '#1D5C96', caption: 'Tried the new spinnaker with Paul as crew. No twists!', place: 'Strande', likes: 6, comments: 1 },
    { id: 'pp3', audience: { kind: 'groups', groups: ['pier7'] }, loc: { kind: 'same', groups: [] }, authorId: 'b14', author: 'Freya', at: ago(2900), scene: 'dawn', hull: '#1D5C96', caption: 'Early start, glassy water and nobody else around.', place: 'Kiel Lighthouse', likes: 11, comments: 0 },
  ];
}

export function initialMessages(): ChatMsg[] {
  const m = (id: string, groupId: string, authorId: string, author: string, min: number, text: string, photo?: SceneKind): ChatMsg => ({ id, groupId, authorId, author, at: ago(min), text, photo });
  return [
    m('f1', 'family', 'b1', 'Frauke', 95, 'Morning! Anyone out today?'),
    m('f2', 'family', 'b3', 'Henrik', 80, 'Leaving Strande at 10, heading for Laboe.'),
    m('f3', 'family', 'b5', 'Mette', 40, 'View from the anchorage', 'harbour'),
    m('f4', 'family', 'b1', 'Frauke', 18, 'Fish rolls at the Laboe pier at 1?'),
    m('p1', 'pier7', 'b2', 'Jens', 130, 'Barbecue is on for Saturday at 18:00.'),
    m('p2', 'pier7', 'b6', 'Anke', 120, 'I’ll bring the grill from Sturmvogel.'),
    m('p3', 'pier7', 'b8', 'Wiebke', 70, 'Count me in!'),
    m('p4', 'pier7', 'm5', 'Kai', 35, 'Running late, save me a sausage.'),
    m('k1', 'kiel', 'b6', 'Anke', 75, 'Ferry traffic at Friedrichsort, keep to starboard.'),
    m('k2', 'kiel', 'b11', 'Lars', 60, 'Thanks for the heads-up!'),
    m('t1', 'baltic', 'b7', 'Malte', 250, 'Anyone heading to Bornholm next week?'),
    m('t2', 'baltic', 'b11', 'Lars', 230, 'Maybe, if the wind turns.'),
    m('s1', 'sailing', 'b12', 'Ida', 600, 'Welcome to all the new members this week!'),
  ];
}

/** Replies that group members "send" a few seconds after the user writes in the chat. */
export const CANNED: Record<string, { authorId: string; text: string }[]> = {
  family: [
    { authorId: 'b1', text: 'Sounds good to me!' },
    { authorId: 'b5', text: 'Count me in.' },
    { authorId: 'b3', text: 'On my way, give me 20 minutes.' },
    { authorId: 'm1', text: 'Lovely, send more photos!' },
    { authorId: 'm2', text: 'Save me a seat.' },
  ],
  pier7: [
    { authorId: 'b2', text: 'Nice one!' },
    { authorId: 'b6', text: 'I’m in.' },
    { authorId: 'b8', text: 'See you at the pier.' },
    { authorId: 'm4', text: 'Bringing cake.' },
    { authorId: 'b14', text: 'Ha, love it.' },
  ],
  kiel: [
    { authorId: 'b6', text: 'Thanks for sharing.' },
    { authorId: 'b11', text: 'Good to know.' },
    { authorId: 'b1', text: 'Wind is picking up out here.' },
  ],
  baltic: [
    { authorId: 'b7', text: 'Fair winds!' },
    { authorId: 'b11', text: 'Agreed.' },
  ],
  sailing: [
    { authorId: 'b12', text: 'Welcome aboard!' },
    { authorId: 'b4', text: 'Great stuff.' },
  ],
};

// ---------- Ski trip scenario: extra Family Crew content ----------

export function skiPosts(): GroupPost[] {
  return [
    { id: 'skp1', audience: { kind: 'groups', groups: ['family'] }, loc: { kind: 'same', groups: [] }, authorId: 'b1', author: 'Frauke', at: ago(12), scene: 'ski', hull: '#F4F1EA', caption: 'First run of the day. Perfect snow!', place: 'Top station', likes: 4, comments: 1, ski: true },
    { id: 'skp2', audience: { kind: 'groups', groups: ['family'] }, loc: { kind: 'same', groups: [] }, authorId: 'm2', author: 'Paul', at: ago(30), scene: 'lift', hull: '#F4F1EA', caption: 'No queue at the chairlift right now.', place: 'Valley station', likes: 3, comments: 0, ski: true },
  ];
}

export function skiMessages(): ChatMsg[] {
  return [
    { id: 'skm1', groupId: 'family', authorId: 'b3', author: 'Henrik', at: ago(14), text: 'Meet at the lift at 12?', ski: true },
    { id: 'skm2', groupId: 'family', authorId: 'b5', author: 'Mette', at: ago(11), text: 'Yes! Lunch at the hut after.', ski: true },
    { id: 'skm3', groupId: 'family', authorId: 'm1', author: 'Gisela', at: ago(6), text: 'I’ve got us a table by the window.', photo: 'lift', ski: true },
  ];
}

export const SKI_CANNED: { authorId: string; text: string }[] = [
  { authorId: 'b1', text: 'Last run, then coffee?' },
  { authorId: 'b3', text: 'Race you to the bottom!' },
  { authorId: 'b5', text: 'My legs are done for today.' },
  { authorId: 'm2', text: 'See you at the lift.' },
];
