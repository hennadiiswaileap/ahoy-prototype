import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MLMap, Marker } from 'maplibre-gl';
// Bundle MapLibre's web worker (and its shared chunk) as one file and point MapLibre at it.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

maplibregl.setWorkerUrl(workerUrl);
import { MAP } from '../config';
import { MARINAS } from '../demoData';
import type { Group } from '../demoGroups';
import { useApp } from '../store';
import { clock, posAt, userTrack, TRACKS, distanceM, circleRing, unitFor, unitMetres, memberId } from '../sim';
import { mapPeople, privateGroupMates } from '../hooks';
import { HULL, DECK, PERSON, ANCHOR, BADGE_CHECK } from '../components/art';
import { MAP_THEME } from '../theme';

const mapTheme = (dark: boolean) => MAP_THEME[dark ? 'dark' : 'light'];

function makeStyle(dark: boolean): maplibregl.StyleSpecification {
  const t = mapTheme(dark);
  return {
    version: 8,
    sources: {
      osm: { type: 'raster', tiles: [MAP.osmTiles], tileSize: 256, maxzoom: 19, attribution: '© OpenStreetMap contributors' },
      seamark: { type: 'raster', tiles: [MAP.seamarkTiles], tileSize: 256, maxzoom: 18, attribution: '© OpenSeaMap contributors' },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': t.background } },
      { id: 'osm', type: 'raster', source: 'osm', paint: { ...t.raster } },
      { id: 'seamark', type: 'raster', source: 'seamark', minzoom: 9 },
    ],
  };
}

/** Zoom at which `metres` is about 190 px on screen. */
export function zoomForRadius(metres: number, lat: number) {
  return Math.log2((156543.03 * Math.cos((lat * Math.PI) / 180) * 190) / metres);
}

/** `base` keeps MapLibre's own classes (maplibregl-marker…), which position the marker. Never drop them. */
interface MarkerRec { marker: Marker; el: HTMLButtonElement; glyph: HTMLElement; base: string; cls: string; person: boolean; stale: boolean }
interface MarinaRec { id: string; marker: Marker; el: HTMLButtonElement; base: string; cls: string }

export function MapView() {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const ready = useRef(false);
  const syncRef = useRef<() => void>(() => {});
  const zoomSeq = useApp((s) => s.zoomSeq);
  const recenterSeq = useApp((s) => s.recenterSeq);
  const fitSeq = useApp((s) => s.fitSeq);
  const layer = useApp((s) => s.layer);
  const focus = useApp((s) => s.focus);
  const dark = useApp((s) => s.dark);
  const scenario = useApp((s) => s.scenario);

  /** Runs now if the map has loaded, otherwise once it has. */
  const whenReady = (fn: (m: MLMap) => void) => {
    const map = mapRef.current;
    if (!map) return;
    if (ready.current) fn(map); else map.once('load', () => fn(map));
  };

  useEffect(() => {
    if (!box.current) return;
    const st = useApp.getState();
    const me0 = posAt(userTrack(st.scenario), clock.now());
    const map = new maplibregl.Map({
      container: box.current,
      style: makeStyle(st.dark),
      center: [me0.lon, me0.lat],
      zoom: zoomForRadius(st.radius * unitMetres(unitFor(st.scenario)), me0.lat),
      minZoom: 6,
      maxZoom: 16,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
    });
    map.touchZoomRotate.disableRotation();
    map.setPadding({ top: 110, bottom: 150, left: 0, right: 0 });
    mapRef.current = map;
    let interacting = false;
    map.on('dragstart', () => { interacting = true; useApp.getState().set({ follow: false }); });
    map.on('dragend', () => { interacting = false; });
    map.on('zoomstart', (e: any) => { if (e.originalEvent) interacting = true; });
    map.on('zoomend', () => { interacting = false; });
    map.on('load', () => {
      ready.current = true;
      const t = mapTheme(useApp.getState().dark);
      map.addSource('radius', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [circleRing(me0, st.radius * unitMetres(unitFor(st.scenario)))] } } });
      map.addLayer({ id: 'radius-fill', type: 'fill', source: 'radius', paint: { 'fill-color': t.radiusFill, 'fill-opacity': 0.08 } });
      map.addLayer({ id: 'radius-line', type: 'line', source: 'radius', paint: { 'line-color': t.radiusLine, 'line-opacity': 0.55, 'line-width': 1.5, 'line-dasharray': [3, 3] } });
      const s = useApp.getState();
      map.setLayoutProperty('seamark', 'visibility', s.layer === 'nautical' && s.scenario === 'sail' ? 'visible' : 'none');
    });

    // --- marinas (added first so boats draw on top) ---
    const marinas: MarinaRec[] = MARINAS.map((m) => {
      const el = document.createElement('button');
      el.className = 'marina-mk';
      el.setAttribute('aria-label', `${m.name} marina`);
      el.innerHTML = `<span class="pin"><svg viewBox="0 0 24 24">${ANCHOR}</svg></span><span class="name">${m.name}</span>`;
      el.addEventListener('click', (e) => { e.stopPropagation(); useApp.getState().set({ marinaId: m.id, selectedId: null, contactOpen: false }); });
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([m.lon, m.lat]).addTo(map);
      return { id: m.id, marker, el, base: el.className, cls: '' };
    });

    // --- "you" marker: a near-black boat (a person on the ski trip) with a Sky halo ---
    const youEl = document.createElement('div');
    youEl.className = 'you-mk';
    const you = new maplibregl.Marker({ element: youEl }).setLngLat([me0.lon, me0.lat]).addTo(map);
    let youShape = '';
    let youGlyph: HTMLElement = youEl;
    const setYouShape = (sc: string) => {
      youShape = sc;
      youEl.innerHTML = sc === 'ski'
        ? `<span class="pulse"></span><span class="glyph person"><svg viewBox="0 0 24 24">${PERSON}</svg></span>`
        : `<span class="pulse"></span><span class="glyph"><svg viewBox="0 0 24 24"><path class="hull" d="${HULL.sail}"/><path class="deck" d="${DECK.sail}"/></svg></span>`;
      youGlyph = youEl.querySelector('.glyph') as HTMLElement;
    };
    setYouShape(st.scenario);

    // --- boats (or people on the ski trip) ---
    const recs = new Map<string, MarkerRec>();
    const syncMarkers = () => {
      const s = useApp.getState();
      const people = mapPeople(s.scenario, s.extras);
      const ids = new Set(people.map((p) => p.id));
      recs.forEach((r, id) => { if (!ids.has(id)) { r.marker.remove(); recs.delete(id); } });
      people.forEach((b) => {
        if (recs.has(b.id)) return;
        const person = !!b.activity;
        const el = document.createElement('button');
        el.className = 'boat-mk';
        el.setAttribute('aria-label', person ? `${b.name}, ${b.activity}` : `${b.boat}, ${b.name}`);
        const type = b.type ?? 'sail';
        // The badge is a sibling of the glyph so it doesn't rotate with the boat.
        const badge = `<span class="mk-badge"><svg viewBox="0 0 24 24">${BADGE_CHECK}</svg></span>`;
        el.innerHTML = person
          ? `<span class="glyph person"><svg viewBox="0 0 24 24">${PERSON}</svg></span>${badge}<span class="name">${b.name}</span>`
          : `<span class="glyph"><svg viewBox="0 0 24 24"><path class="hull" d="${HULL[type]}"/><path class="deck" d="${DECK[type]}"/></svg></span>${badge}<span class="name">${b.boat}</span>`;
        el.addEventListener('click', (e) => { e.stopPropagation(); useApp.getState().set({ selectedId: b.id, contactOpen: false, marinaId: null }); });
        const marker = new maplibregl.Marker({ element: el }).setLngLat(b.route.center).addTo(map);
        recs.set(b.id, { marker, el, glyph: el.querySelector('.glyph') as HTMLElement, base: el.className, cls: '', person, stale: b.staleMinutes != null });
      });
    };
    syncRef.current = syncMarkers;
    syncMarkers();
    const unsub = useApp.subscribe((s, p) => { if (s.extras !== p.extras) syncMarkers(); });

    // Scope B filter and teak rings, cached per groups array.
    let lastGroups: Group[] | null = null;
    let mates = new Set<string>();
    const filterGroup = (s: ReturnType<typeof useApp.getState>) => (s.scope === 'b' && s.mapGroup !== 'all' ? s.groups.find((g) => g.id === s.mapGroup) : undefined);

    // --- clusters (screen-space, refreshed a few times per second) ---
    let clusterMarkers: Marker[] = [];
    let hidden = new Set<string>();
    let hiddenMarinas = new Set<string>();
    let lastCluster = 0;
    const doClusters = () => {
      clusterMarkers.forEach((m) => m.remove());
      clusterMarkers = [];
      hidden = new Set();
      hiddenMarinas = new Set();
      const s = useApp.getState();
      const g = filterGroup(s);
      const group = <T extends { id: string; p: maplibregl.Point }>(pts: T[], dist: number, make: (grp: T[], ll: maplibregl.LngLat) => HTMLElement, hide: Set<string>) => {
        const used = new Set<string>();
        pts.forEach((a) => {
          if (used.has(a.id)) return;
          const grp = pts.filter((b) => !used.has(b.id) && Math.hypot(a.p.x - b.p.x, a.p.y - b.p.y) < dist);
          if (grp.length < 2) return;
          grp.forEach((b) => { used.add(b.id); hide.add(b.id); });
          const ll = map.unproject([grp.reduce((t, b) => t + b.p.x, 0) / grp.length, grp.reduce((t, b) => t + b.p.y, 0) / grp.length]);
          const el = make(grp, ll);
          clusterMarkers.push(new maplibregl.Marker({ element: el, anchor: el.classList.contains('marina-mk') ? 'bottom' : 'center' }).setLngLat(ll).addTo(map));
        });
      };
      if (s.showMarinas && s.scenario === 'sail') {
        group(marinas.map((m) => ({ id: m.id, p: map.project(m.marker.getLngLat()) })), 28, (grp, ll) => {
          const el = document.createElement('button');
          el.className = 'marina-mk';
          el.setAttribute('aria-label', `${grp.length} marinas, zoom in`);
          el.innerHTML = `<span class="pin"><svg viewBox="0 0 24 24">${ANCHOR}</svg></span><span class="count">${grp.length}</span>`;
          el.addEventListener('click', (e) => { e.stopPropagation(); useApp.getState().set({ follow: false }); map.easeTo({ center: ll, zoom: map.getZoom() + 1.6 }); });
          return el;
        }, hiddenMarinas);
      }
      if (map.getZoom() >= MAP.clusterBelowZoom) return;
      const pts = [...recs.entries()].filter(([id]) => !g || g.members.includes(memberId(id))).map(([id, r]) => ({ id, p: map.project(r.marker.getLngLat()) }));
      group(pts, 40, (grp, ll) => {
        const el = document.createElement('button');
        el.className = 'cluster-mk';
        el.textContent = String(grp.length);
        el.setAttribute('aria-label', `${grp.length} boats, zoom in`);
        el.addEventListener('click', (e) => { e.stopPropagation(); useApp.getState().set({ follow: false }); map.easeTo({ center: ll, zoom: map.getZoom() + 2 }); });
        return el;
      }, hidden);
    };

    // --- animation loop: positions are analytic, so every frame is exact ---
    let raf = 0, lastCircle = 0;
    const frame = (now: number) => {
      const s = useApp.getState();
      const t = clock.now();
      const me = posAt(userTrack(s.scenario), t);
      you.setLngLat([me.lon, me.lat]);
      if (s.scenario !== youShape) setYouShape(s.scenario);
      if (s.scenario === 'sail') youGlyph.style.transform = `rotate(${me.heading}deg)`;
      const off = !s.sharing || s.visibility === 'invisible';
      youEl.classList.toggle('off', off);
      youEl.classList.toggle('limited', !off && s.scope === 'b' && s.visibility === 'groups');
      if (s.follow && !interacting && !map.isMoving()) map.setCenter([me.lon, me.lat]);
      const R = s.radius * unitMetres(unitFor(s.scenario));
      if (s.groups !== lastGroups) { lastGroups = s.groups; mates = privateGroupMates(s.groups); }
      const g = filterGroup(s);
      recs.forEach((r, id) => {
        const p = posAt(TRACKS[id], t);
        r.marker.setLngLat([p.lon, p.lat]);
        if (!r.person) r.glyph.style.transform = `rotate(${p.heading}deg)`;
        const mid = memberId(id);
        // Friends (Scope A) and private-group members (Scope B) share one look: Teak ring + badge.
        const ring = (s.scope === 'b' ? mates.has(mid) : !!s.friends[id]) ? 'mate' : '';
        const out = g ? !g.members.includes(mid) : false;
        const vis = out || hidden.has(id) ? 'hid' : !g && distanceM(me, p) > R ? 'far' : '';
        const cls = [r.base, ring, r.stale ? 'stale' : '', s.selectedId === id ? 'sel' : '', vis].join(' ');
        if (cls !== r.cls) { r.el.className = cls; r.cls = cls; }
      });
      const showM = s.showMarinas && s.scenario === 'sail';
      marinas.forEach((m) => {
        const cls = [m.base, !showM || hiddenMarinas.has(m.id) ? 'hid' : '', s.marinaId === m.id ? 'sel' : ''].join(' ');
        if (cls !== m.cls) { m.el.className = cls; m.cls = cls; }
      });
      if (now - lastCluster > 300) { lastCluster = now; doClusters(); }
      if (now - lastCircle > 400 && map.getSource('radius')) {
        lastCircle = now;
        (map.getSource('radius') as maplibregl.GeoJSONSource).setData({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [circleRing(me, R)] } });
      }
      const z = map.getZoom();
      box.current?.classList.toggle('show-names', z >= MAP.namesZoom);
      box.current?.classList.toggle('show-marina-names', z >= MAP.marinaNamesZoom);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => { cancelAnimationFrame(raf); unsub(); map.remove(); mapRef.current = null; ready.current = false; };
  }, []);

  const easeToMe = (zoom?: boolean) => {
    const map = mapRef.current;
    if (!map) return;
    const s = useApp.getState();
    const me = posAt(userTrack(s.scenario), clock.now());
    map.easeTo({ center: [me.lon, me.lat], ...(zoom ? { zoom: zoomForRadius(s.radius * unitMetres(unitFor(s.scenario)), me.lat) } : {}), duration: 600 });
  };
  useEffect(() => { if (zoomSeq) easeToMe(true); }, [zoomSeq]);
  useEffect(() => { if (recenterSeq) easeToMe(); }, [recenterSeq]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    map.easeTo({ center: [focus.lon, focus.lat], zoom: Math.max(map.getZoom(), 12), duration: 600 });
  }, [focus]);

  // "Show on map" from a group: fit the group's members (and you) on screen.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !fitSeq) return;
    const s = useApp.getState();
    const g = s.groups.find((x) => x.id === s.mapGroup);
    if (!g) return;
    const t = clock.now();
    const pts = mapPeople(s.scenario, s.extras).filter((p) => g.members.includes(memberId(p.id))).map((p) => posAt(TRACKS[p.id], t));
    if (!pts.length) { s.showToast(`Nobody from ${g.name} is out right now`, 'info'); return; }
    pts.push(posAt(userTrack(s.scenario), t));
    const b = new maplibregl.LngLatBounds();
    pts.forEach((p) => b.extend([p.lon, p.lat]));
    map.fitBounds(b, { padding: 50, maxZoom: 13.5, duration: 700 });
  }, [fitSeq]);

  // Kiel Fjord <-> ski trip: swap markers and jump to the other place.
  const firstScenario = useRef(true);
  useEffect(() => {
    if (firstScenario.current) { firstScenario.current = false; return; }
    const map = mapRef.current;
    if (!map) return;
    syncRef.current();
    const s = useApp.getState();
    const me = posAt(userTrack(scenario), clock.now());
    map.jumpTo({ center: [me.lon, me.lat], zoom: zoomForRadius(s.radius * unitMetres(unitFor(scenario)), me.lat) });
  }, [scenario]);

  useEffect(() => {
    whenReady((map) => map.setLayoutProperty('seamark', 'visibility', layer === 'nautical' && scenario === 'sail' ? 'visible' : 'none'));
  }, [layer, scenario]);

  useEffect(() => {
    whenReady((map) => {
      const t = mapTheme(dark);
      map.setPaintProperty('bg', 'background-color', t.background);
      for (const [k, v] of Object.entries(t.raster)) map.setPaintProperty('osm', k as 'raster-opacity', v);
      if (map.getLayer('radius-fill')) map.setPaintProperty('radius-fill', 'fill-color', t.radiusFill);
      if (map.getLayer('radius-line')) map.setPaintProperty('radius-line', 'line-color', t.radiusLine);
    });
  }, [dark]);

  // MapLibre's stylesheet sets `position: relative` on the map element, so the
  // positioning lives on a wrapper and the map element just fills it.
  return (
    <div className="absolute inset-0">
      <div ref={box} className="h-full w-full" aria-label={scenario === 'ski' ? 'Map of the ski area' : 'Map of Kiel Fjord'} />
    </div>
  );
}
