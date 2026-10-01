import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MLMap, Marker } from 'maplibre-gl';
// Bundle MapLibre's web worker (and its shared chunk) as one file and point MapLibre at it.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

maplibregl.setWorkerUrl(workerUrl);
import { MAP } from '../config';
import { useApp } from '../store';
import { clock, posAt, USER_TRACK, TRACKS, distanceM, circleRing, NM } from '../sim';
import { allBoats } from '../hooks';
import { HULL, DECK } from '../components/art';

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: { type: 'raster', tiles: [MAP.osmTiles], tileSize: 256, maxzoom: 19, attribution: '© OpenStreetMap contributors' },
    seamark: { type: 'raster', tiles: [MAP.seamarkTiles], tileSize: 256, maxzoom: 18, attribution: '© OpenSeaMap contributors' },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#C9DDEE' } },
    { id: 'osm', type: 'raster', source: 'osm', paint: { 'raster-saturation': -0.45, 'raster-contrast': -0.08, 'raster-brightness-min': 0.08 } },
    { id: 'seamark', type: 'raster', source: 'seamark', minzoom: 9 },
  ],
};

export function zoomForRadius(nm: number, lat = 54.43) {
  const px = 190;
  return Math.log2((156543.03 * Math.cos((lat * Math.PI) / 180) * px) / (nm * NM));
}

interface MarkerRec { marker: Marker; el: HTMLButtonElement; glyph: HTMLElement; cls: string }

export function MapView() {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const zoomSeq = useApp((s) => s.zoomSeq);
  const recenterSeq = useApp((s) => s.recenterSeq);
  const layer = useApp((s) => s.layer);
  const focus = useApp((s) => s.focus);

  useEffect(() => {
    if (!box.current) return;
    const st = useApp.getState();
    const me0 = posAt(USER_TRACK, clock.now());
    const map = new maplibregl.Map({
      container: box.current,
      style: STYLE,
      center: [me0.lon, me0.lat],
      zoom: zoomForRadius(st.radius),
      minZoom: 7.5,
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
    map.on('zoomstart', (e: any) => { if ((e as any).originalEvent) interacting = true; });
    map.on('zoomend', () => { interacting = false; });
    map.on('click', () => { const s = useApp.getState(); if (s.selectedId) return; });
    map.on('load', () => {
      map.addSource('radius', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [circleRing(me0, st.radius * NM)] } } });
      map.addLayer({ id: 'radius-fill', type: 'fill', source: 'radius', paint: { 'fill-color': '#8DB3D6', 'fill-opacity': 0.08 } });
      map.addLayer({ id: 'radius-line', type: 'line', source: 'radius', paint: { 'line-color': '#1D5C96', 'line-opacity': 0.5, 'line-width': 1.5, 'line-dasharray': [3, 3] } });
    });

    // --- "you" marker ---
    const youEl = document.createElement('div');
    youEl.className = 'you-mk';
    youEl.innerHTML = '<span class="pulse"></span><span class="arrow"><svg viewBox="0 0 44 44" width="44" height="44"><path class="cone" d="M22 2 L29 17 L22 14 L15 17 Z"/></svg></span><span class="dot"></span>';
    const youArrow = youEl.querySelector('.arrow') as HTMLElement;
    const you = new maplibregl.Marker({ element: youEl }).setLngLat([me0.lon, me0.lat]).addTo(map);

    // --- boat markers ---
    const recs = new Map<string, MarkerRec>();
    const ensureMarkers = () => {
      const s = useApp.getState();
      allBoats(s.extras).forEach((b) => {
        if (recs.has(b.id)) return;
        const el = document.createElement('button');
        el.className = 'boat-mk';
        el.setAttribute('aria-label', `${b.boat}, ${b.name}`);
        const type = b.type ?? 'sail';
        el.innerHTML = `<span class="glyph"><svg viewBox="0 0 24 24"><path class="hull" d="${HULL[type]}"/><path class="deck" d="${DECK[type]}"/></svg></span><span class="name">${b.boat}</span>`;
        el.addEventListener('click', (e) => { e.stopPropagation(); useApp.getState().set({ selectedId: b.id, contactOpen: false }); });
        const marker = new maplibregl.Marker({ element: el }).setLngLat(b.route.center).addTo(map);
        recs.set(b.id, { marker, el, glyph: el.querySelector('.glyph') as HTMLElement, cls: '' });
      });
    };
    ensureMarkers();
    const unsub = useApp.subscribe((s, p) => { if (s.extras !== p.extras) ensureMarkers(); });

    // --- clusters (screen-space, refreshed a few times per second) ---
    let clusterMarkers: Marker[] = [];
    let hidden = new Set<string>();
    let lastCluster = 0;
    const doClusters = () => {
      clusterMarkers.forEach((m) => m.remove());
      clusterMarkers = [];
      hidden = new Set();
      if (map.getZoom() >= MAP.clusterBelowZoom) return;
      const pts = [...recs.entries()].map(([id, r]) => ({ id, p: map.project(r.marker.getLngLat()) }));
      const used = new Set<string>();
      pts.forEach((a) => {
        if (used.has(a.id)) return;
        const grp = pts.filter((b) => !used.has(b.id) && Math.hypot(a.p.x - b.p.x, a.p.y - b.p.y) < 40);
        if (grp.length < 2) return;
        grp.forEach((b) => { used.add(b.id); hidden.add(b.id); });
        const cx = grp.reduce((s, b) => s + b.p.x, 0) / grp.length, cy = grp.reduce((s, b) => s + b.p.y, 0) / grp.length;
        const ll = map.unproject([cx, cy]);
        const el = document.createElement('button');
        el.className = 'cluster-mk';
        el.textContent = String(grp.length);
        el.setAttribute('aria-label', `${grp.length} boats, zoom in`);
        el.addEventListener('click', (e) => { e.stopPropagation(); useApp.getState().set({ follow: false }); map.easeTo({ center: ll, zoom: map.getZoom() + 2 }); });
        clusterMarkers.push(new maplibregl.Marker({ element: el }).setLngLat(ll).addTo(map));
      });
    };

    // --- animation loop: positions are analytic, so every frame is exact ---
    let raf = 0, lastCircle = 0;
    const frame = (now: number) => {
      const s = useApp.getState();
      const t = clock.now();
      const me = posAt(USER_TRACK, t);
      you.setLngLat([me.lon, me.lat]);
      youArrow.style.transform = `rotate(${me.heading}deg)`;
      const off = !s.sharing || s.visibility === 'invisible';
      youEl.classList.toggle('off', off);
      if (s.follow && !interacting && !map.isMoving()) map.setCenter([me.lon, me.lat]);
      const R = s.radius * NM;
      allBoats(s.extras).forEach((b) => {
        const r = recs.get(b.id);
        if (!r) return;
        const p = posAt(TRACKS[b.id], t);
        r.marker.setLngLat([p.lon, p.lat]);
        r.glyph.style.transform = `rotate(${p.heading}deg)`;
        const cls = ['boat-mk', s.friends[b.id] ? 'friend' : '', b.staleMinutes != null ? 'stale' : '', s.selectedId === b.id ? 'sel' : '', hidden.has(b.id) ? 'hid' : distanceM(me, p) > R ? 'far' : ''].join(' ');
        if (cls !== r.cls) { r.el.className = cls; r.cls = cls; }
      });
      if (now - lastCluster > 300) { lastCluster = now; doClusters(); }
      if (now - lastCircle > 400 && map.getSource('radius')) {
        lastCircle = now;
        (map.getSource('radius') as maplibregl.GeoJSONSource).setData({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [circleRing(me, R)] } });
      }
      box.current?.classList.toggle('show-names', map.getZoom() >= 13);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => { cancelAnimationFrame(raf); unsub(); map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !zoomSeq) return;
    const me = posAt(USER_TRACK, clock.now());
    map.easeTo({ center: [me.lon, me.lat], zoom: zoomForRadius(useApp.getState().radius), duration: 600 });
  }, [zoomSeq]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !recenterSeq) return;
    const me = posAt(USER_TRACK, clock.now());
    map.easeTo({ center: [me.lon, me.lat], duration: 600 });
  }, [recenterSeq]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    map.easeTo({ center: [focus.lon, focus.lat], zoom: Math.max(map.getZoom(), 12), duration: 600 });
  }, [focus]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => map.getLayer('seamark') && map.setLayoutProperty('seamark', 'visibility', layer === 'nautical' ? 'visible' : 'none');
    if (map.isStyleLoaded()) apply(); else map.once('load', apply);
  }, [layer]);

  return <div ref={box} className="absolute inset-0" aria-label="Map of Kiel Fjord" />;
}
