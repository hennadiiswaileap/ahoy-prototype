/**
 * All demo data in one place. Everything here is fictional.
 *
 * Boat routes are ellipses on the water of Kiel Fjord. Each was generated and
 * checked against OpenStreetMap-derived coastline data so the whole loop stays
 * at least ~120 m off land. `rot` is in radians (east = 0, clockwise on screen).
 */

export type ContactKind = 'whatsapp' | 'telegram' | 'phone';
export type BoatType = 'sail' | 'motor';
export type SceneKind = 'day' | 'sunset' | 'dawn' | 'harbour' | 'lighthouse' | 'race';

export interface Route {
  center: [number, number]; // [lon, lat]
  rx: number; // metres
  ry: number; // metres
  rot: number; // radians
}

export interface Person {
  id: string;
  name: string;
  boat: string;
  model: string;
  type?: BoatType;
  knots: number;
  friend?: boolean;
  contact: ContactKind;
  home: string;
  scene: SceneKind;
  hull: string;
  dir: 1 | -1;
  /** Seconds (sim time) between position reports; drives "last seen". */
  reportEvery: number;
  /** If set, the boat is at anchor/moored and was last seen this many minutes ago. */
  staleMinutes?: number;
  heading?: number;
  phase?: number;
  route: Route;
}

export const USER_ROUTE: Route = { center: [10.21131, 54.43611], rx: 1654, ry: 1305, rot: 1.372 };
/** Angle (degrees) on the user's ellipse closest to Kiel-Schilksee marina. */
export const USER_START_DEG = 80;
export const USER_KNOTS = 4.2;

export const PEOPLE: Person[] = [
  { id: 'b1', name: 'Frauke', boat: 'Windspiel', model: 'Hanse 388', knots: 5.8, friend: true, contact: 'whatsapp', home: 'Kiel-Schilksee', scene: 'sunset', hull: '#F4F1EA', dir: 1, reportEvery: 150, route: { center: [10.21842, 54.45648], rx: 1292, ry: 997, rot: 1.848 } },
  { id: 'b2', name: 'Jens', boat: 'Seeschwalbe', model: 'Bavaria 34', knots: 4.6, contact: 'telegram', home: 'Strande', scene: 'day', hull: '#0B2545', dir: -1, reportEvery: 240, phase: 2.6, route: { center: [10.20174, 54.42712], rx: 899, ry: 716, rot: 1.358 } },
  { id: 'b3', name: 'Henrik', boat: 'Nordlicht', model: 'X-Yachts X4.3', knots: 6.7, friend: true, contact: 'whatsapp', home: 'Sønderborg', scene: 'race', hull: '#1D5C96', dir: 1, reportEvery: 90, route: { center: [10.2416, 54.42902], rx: 1395, ry: 1095, rot: 0.864 } },
  { id: 'b4', name: 'Søren', boat: 'Havørn', model: 'Hallberg-Rassy 37', knots: 6.2, contact: 'phone', home: 'Aarhus', scene: 'lighthouse', hull: '#F4F1EA', dir: -1, reportEvery: 300, route: { center: [10.2568, 54.46829], rx: 1988, ry: 1531, rot: 2.928 } },
  { id: 'b5', name: 'Mette', boat: 'Lille Ven', model: 'Dehler 34', knots: 0, staleMinutes: 8, heading: 40, contact: 'telegram', home: 'Svendborg', scene: 'harbour', hull: '#7A2E2A', dir: 1, reportEvery: 0, route: { center: [10.21801, 54.412], rx: 0, ry: 0, rot: 0 } },
  { id: 'b6', name: 'Anke', boat: 'Sturmvogel', model: 'Bavaria 37', knots: 3.2, contact: 'whatsapp', home: 'Laboe', scene: 'day', hull: '#F4F1EA', dir: 1, reportEvery: 200, route: { center: [10.19819, 54.38738], rx: 594, ry: 329, rot: 2.534 } },
  { id: 'b7', name: 'Malte', boat: 'Fjordkind', model: 'Sunbeam 32', knots: 4.1, contact: 'telegram', home: 'Kiel-Holtenau', scene: 'dawn', hull: '#0B2545', dir: -1, reportEvery: 120, route: { center: [10.17938, 54.37291], rx: 694, ry: 544, rot: 1.787 } },
  { id: 'b8', name: 'Wiebke', boat: 'Kleine Freiheit', model: 'Hanse 348', knots: 3.6, friend: true, contact: 'whatsapp', home: 'Kiel-Düsternbrook', scene: 'harbour', hull: '#F4F1EA', dir: 1, reportEvery: 180, route: { center: [10.16407, 54.34474], rx: 598, ry: 464, rot: 1.331 } },
  { id: 'b9', name: 'Torben', boat: 'Gezeitenspiel', model: 'Dufour 360', knots: 0, staleMinutes: 12, heading: 200, contact: 'phone', home: 'Flensburg', scene: 'harbour', hull: '#1D5C96', dir: 1, reportEvery: 0, route: { center: [10.164, 54.339], rx: 0, ry: 0, rot: 0 } },
  { id: 'b10', name: 'Kirsten', boat: 'Sonnenwende', model: 'Nimbus 305 Coupé', type: 'motor', knots: 6.8, contact: 'phone', home: 'Kiel-Wik', scene: 'day', hull: '#F4F1EA', dir: -1, reportEvery: 100, route: { center: [10.16398, 54.36655], rx: 595, ry: 473, rot: 3.084 } },
  { id: 'b11', name: 'Lars', boat: 'Albatros', model: 'Elan E4', knots: 6.9, contact: 'whatsapp', home: 'Faaborg', scene: 'race', hull: '#F4F1EA', dir: 1, reportEvery: 260, route: { center: [10.2229, 54.48148], rx: 1789, ry: 1407, rot: 1.557 } },
  { id: 'b12', name: 'Ida', boat: 'Mågen', model: 'X-Yachts X4.0', knots: 5.1, contact: 'telegram', home: 'Marstal', scene: 'lighthouse', hull: '#0B2545', dir: -1, reportEvery: 140, route: { center: [10.20077, 54.4412], rx: 885, ry: 664, rot: 3.106 } },
  { id: 'b13', name: 'Nils', boat: 'Nordstern', model: 'Greenline 33', type: 'motor', knots: 0, staleMinutes: 14, heading: 160, contact: 'phone', home: 'Kiel-Düsternbrook', scene: 'harbour', hull: '#F4F1EA', dir: 1, reportEvery: 0, route: { center: [10.166, 54.353], rx: 0, ry: 0, rot: 0 } },
  { id: 'b14', name: 'Freya', boat: 'Blauwal', model: 'Hallberg-Rassy 342', knots: 4.9, contact: 'whatsapp', home: 'Heiligenhafen', scene: 'sunset', hull: '#1D5C96', dir: 1, reportEvery: 210, route: { center: [10.24422, 54.44162], rx: 1178, ry: 939, rot: 1.372 } },
];

/** Boats the demo panel can drop in near the user. They sail a scaled copy of the user's (open-water) loop. */
export const EXTRA_BOATS: (Omit<Person, 'route'> & { scale: number })[] = [
  { id: 'x1', name: 'Sune', boat: 'Sommerbris', model: 'Bavaria C38', knots: 4.4, contact: 'whatsapp', home: 'Middelfart', scene: 'day', hull: '#F4F1EA', dir: 1, reportEvery: 120, scale: 0.55 },
  { id: 'x2', name: 'Gesche', boat: 'Flaschenpost', model: 'Hanse 315', knots: 3.9, contact: 'telegram', home: 'Eckernförde', scene: 'dawn', hull: '#0B2545', dir: -1, reportEvery: 160, scale: 0.35 },
  { id: 'x3', name: 'Ole', boat: 'Kattegat', model: 'Dehler 38', knots: 5.0, contact: 'phone', home: 'Kerteminde', scene: 'sunset', hull: '#1D5C96', dir: 1, reportEvery: 200, scale: 0.75 },
];

export const AVATAR_BG = ['#D6E5F2', '#F1E6D2', '#D5ECE1', '#FFE1D3', '#E3E0F0', '#DCE8F3'];

export const DEMO_PHONE = '151 2345 6789';
export const DEMO_CODE = '482913';

export const COUNTRY_CODES = [
  { country: 'Germany', code: '+49' },
  { country: 'Denmark', code: '+45' },
  { country: 'Sweden', code: '+46' },
  { country: 'Norway', code: '+47' },
  { country: 'Netherlands', code: '+31' },
  { country: 'Poland', code: '+48' },
];

// ---------------- Teaser content ----------------

export const POSTS = [
  { who: 'Frauke', boat: 'Windspiel', where: 'Laboe · 2 h', scene: 'sunset' as SceneKind, hull: '#F4F1EA', likes: 42, comments: 6, text: 'Golden hour off Laboe. Anchored, kettle on, nowhere to be.', bg: 0 },
  { who: 'Nordwind Magazin', boat: '', where: 'Sponsored · Kiel', scene: 'race' as SceneKind, hull: '#0B2545', likes: 128, comments: 14, text: 'Autumn checklist: seven things to do before you haul out. Full guide in our October issue.', partner: true, bg: 5 },
  { who: 'Søren', boat: 'Havørn', where: 'Kiel Lighthouse · 5 h', scene: 'lighthouse' as SceneKind, hull: '#F4F1EA', likes: 67, comments: 9, text: 'Rounded the lighthouse at 6 knots on a beam reach. Best sail of the season.', bg: 3 },
  { who: 'Wiebke', boat: 'Kleine Freiheit', where: 'Düsternbrook · Yesterday', scene: 'harbour' as SceneKind, hull: '#F4F1EA', likes: 31, comments: 4, text: 'Found a berth in Düsternbrook at last. Anyone up for fish rolls at the pier?', bg: 2 },
  { who: 'Henrik', boat: 'Nordlicht', where: 'Strande · Yesterday', scene: 'race' as SceneKind, hull: '#1D5C96', likes: 88, comments: 12, text: 'Spinnaker up for the first time with the new crew. No twists!', bg: 1 },
  { who: 'Malte', boat: 'Fjordkind', where: 'Friedrichsort · 2 d', scene: 'dawn' as SceneKind, hull: '#0B2545', likes: 24, comments: 2, text: 'Early start through the narrows. Glassy water and nobody else around.', bg: 4 },
  { who: 'Mette', boat: 'Lille Ven', where: 'Laboe · 3 d', scene: 'day' as SceneKind, hull: '#7A2E2A', likes: 53, comments: 7, text: 'First visit to Kiel with Lille Ven. Thank you for the warm welcome, Laboe!', bg: 0 },
];

export const CHALLENGE = {
  title: 'Kiel → Copenhagen: fastest this month',
  month: 'October',
  board: [
    { boat: 'Havørn', who: 'Søren · Hallberg-Rassy 37', time: '19 h 40 m' },
    { boat: 'Nordlicht', who: 'Henrik · X-Yachts X4.3', time: '20 h 15 m' },
    { boat: 'Albatros', who: 'Lars · Elan E4', time: '21 h 02 m' },
    { boat: 'Windspiel', who: 'Frauke · Hanse 388', time: '22 h 30 m' },
  ],
};

export const PORTS = [
  { name: 'Strande', dist: '1.1 nm · 15 min', desc: 'Small, friendly harbour north of Schilksee with a sandy beach next door.', berths: '8 berths free tonight', scene: 'harbour' as SceneKind, hull: '#F4F1EA',
    events: [{ dow: 'Sat', day: '3', title: 'Seafood market on the quay', when: 'Sat 3 Oct · 10:00' }], food: ['Strandkorb Kitchen', 'Zur Lotsenbank'] },
  { name: 'Laboe', dist: '2.3 nm · 30 min', desc: 'Lively harbour on the east shore, lots of guest berths and a long promenade.', berths: '12 berths free tonight', scene: 'sunset' as SceneKind, hull: '#1D5C96',
    events: [{ dow: 'Fri', day: '2', title: 'Wine evening at the harbour office', when: 'Fri 2 Oct · 18:30' }, { dow: 'Sat', day: '10', title: 'Laboe Harbour Festival', when: 'Sat 10 Oct · from 14:00' }], food: ['Fischküche am Steg', 'Café Ankerplatz'] },
  { name: 'Kiel-Düsternbrook', dist: '5.4 nm · 1 h 15 min', desc: 'Right in town, walking distance to shops and the old harbour.', berths: '4 berths free tonight', scene: 'harbour' as SceneKind, hull: '#0B2545',
    events: [{ dow: 'Thu', day: '8', title: 'Autumn regatta skipper briefing', when: 'Thu 8 Oct · 19:00' }], food: ['Bootshaus Bistro', 'Förde Deli'] },
  { name: 'Eckernförde', dist: '12 nm · 2 h 40 min', desc: 'Charming town harbour at the end of the bay, famous for smoked sprats.', berths: '15 berths free tonight', scene: 'dawn' as SceneKind, hull: '#F4F1EA',
    events: [{ dow: 'Sun', day: '4', title: 'Smokehouse open day', when: 'Sun 4 Oct · 11:00' }], food: ['Räucherkate am Hafen', 'Hafenstube'] },
];

export const CHATS = [
  { id: 'c1', personId: 'b1', who: 'Frauke · Windspiel', first: 'Frauke', when: '14:32', last: 'Want to meet for a fish roll at the harbour?', unread: 2, status: 'Sailing · 1.4 nm away',
    messages: [
      { text: 'Ahoy! Was that you under full main off Strande this morning?', at: '13:58' },
      { text: 'Guilty! Heading for Laboe tonight.', at: '14:05', me: true },
      { text: 'Got a great shot of you passing Bülk!', at: '14:31', photo: true },
      { text: 'Want to meet for a fish roll at the harbour?', at: '14:32' },
    ] },
  { id: 'c2', personId: 'b4', who: 'Søren · Havørn', first: 'Søren', when: 'Yesterday', last: 'Thanks for the tip about the guest berth in Laboe', unread: 0, status: 'Sailing · 3.2 nm away',
    messages: [
      { text: 'Any idea where guest boats moor in Laboe?', at: '17:12' },
      { text: 'Inner harbour, green signs. The office closes at 19:00.', at: '17:20', me: true },
      { text: 'Thanks for the tip about the guest berth in Laboe', at: '17:24' },
    ] },
  { id: 'c3', personId: 'b7', who: 'Malte · Fjordkind', first: 'Malte', when: 'Mon', last: 'Wind picks up after noon, leave early', unread: 0, status: 'Seen 2 h ago',
    messages: [
      { text: 'Going out tomorrow?', at: '20:02', me: true },
      { text: 'Wind picks up after noon, leave early', at: '20:10' },
    ] },
];
