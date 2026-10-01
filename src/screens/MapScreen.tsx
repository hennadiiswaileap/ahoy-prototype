import { useRef, useState } from 'react';
import { ChevronDown, Radar, WifiOff, EyeOff, Layers, LocateFixed, Users } from 'lucide-react';
import { useApp, type Radius } from '../store';
import { APP, MAP } from '../config';
import { AVATAR_BG, PEOPLE } from '../demoData';
import { LogoMark } from '../components/art';
import { Avatar, Badge, cx } from '../components/ui';
import { useBoatInfos, useLongPress } from '../hooks';
import { NM } from '../sim';
import { MapView } from './MapView';

export const avatarBg = (id: string) => {
  const i = PEOPLE.findIndex((p) => p.id === id);
  return AVATAR_BG[(i >= 0 ? i : 1) % AVATAR_BG.length];
};

export function MapScreen() {
  const s = useApp();
  const { boats, infos } = useBoatInfos();
  const lp = useLongPress(() => s.set({ demoOpen: true }));
  const [radiusOpen, setRadiusOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const setUi = (o: { radiusOpen?: boolean; layersOpen?: boolean }) => {
    if (o.radiusOpen !== undefined) setRadiusOpen(o.radiusOpen);
    if (o.layersOpen !== undefined) setLayersOpen(o.layersOpen);
  };
  const sheetY = useRef<number | null>(null);

  const hidden = !s.sharing || s.visibility === 'invisible';
  const pill = !s.sharing
    ? { a: 'Location off', b: 'You are hidden', off: true }
    : s.visibility === 'invisible'
      ? { a: 'Invisible', b: 'Nobody can see you', off: true }
      : { a: 'Sharing location', b: s.visibility === 'friends' ? 'Friends only' : 'Visible to everyone', off: false };

  const R = s.radius * NM;
  const inR = boats.filter((b) => infos[b.id].dist <= R);
  const list = (s.listFilter === 'friends' ? inR.filter((b) => s.friends[b.id]) : inR).sort((a, b) => infos[a.id].dist - infos[b.id].dist);
  const faces = inR.filter((b) => s.friends[b.id]).slice(0, 3);
  const count = inR.length === 0 ? 'No boats nearby' : `${inR.length} ${inR.length === 1 ? 'boat' : 'boats'} nearby`;
  const offMin = 4 + Math.floor((s.realSec - s.offlineSince) / 60);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#C9DDEE]" onPointerDown={() => (radiusOpen || layersOpen) && setUi({ radiusOpen: false, layersOpen: false })}>
      <MapView />

      {/* top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[6] flex flex-col gap-2 px-3 pt-3 [&>*]:pointer-events-auto">
        <div className="flex items-center gap-2">
          <button aria-label={`${APP.name}, hold for demo controls`} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(11,37,69,.16)]" {...lp}>
            <LogoMark />
          </button>
          <button onClick={() => s.set({ visSheetOpen: true })} aria-label={`Visibility: ${pill.a}, ${pill.b}`} className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-full bg-white pl-4 pr-3.5 text-left shadow-[0_2px_10px_rgba(11,37,69,.16)]">
            <span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', pill.off ? 'bg-[#9AA7B5] shadow-[0_0_0_4px_rgba(154,167,181,.2)]' : 'bg-success shadow-[0_0_0_4px_rgba(46,158,106,.18)]')} />
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <b className="truncate text-sm font-semibold">{pill.a}</b>
              <span className="truncate text-[13px] text-muted">{pill.b}</span>
            </span>
            <ChevronDown size={18} className="text-muted" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setUi({ radiusOpen: !radiusOpen, layersOpen: false }); }} aria-label={`Search radius ${s.radius} nautical miles`} className="flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-white pl-3 pr-3.5 text-[15px] font-semibold shadow-[0_2px_10px_rgba(11,37,69,.16)]">
            <Radar size={18} className="text-sea" />{s.radius} nm
          </button>
        </div>
        {radiusOpen && (
          <div className="flex w-[230px] animate-pop flex-col gap-2 self-end rounded-2xl bg-white p-2.5 shadow-[0_10px_30px_rgba(11,37,69,.18)]" onPointerDown={(e) => e.stopPropagation()}>
            <div className="px-1 text-[13px] text-muted">Show boats within</div>
            <div className="grid grid-cols-4 gap-1.5">
              {MAP.radii.map((r) => (
                <button key={r} onClick={() => { s.setRadius(r as Radius); setUi({ radiusOpen: false }); }} className={cx('h-11 rounded-xl text-[15px] font-semibold', s.radius === r ? 'bg-navy text-white' : 'bg-mist')}>{r}</button>
              ))}
            </div>
          </div>
        )}
        {s.offline && (
          <div className="flex animate-drop items-center gap-2.5 rounded-[14px] bg-navy px-3.5 py-2.5 text-sm text-white shadow-[0_2px_10px_rgba(11,37,69,.12)]">
            <WifiOff size={18} />No connection, showing positions from {offMin} min ago
          </div>
        )}
        {hidden && (
          <div className="flex animate-drop items-center gap-2.5 rounded-[14px] bg-white py-1.5 pl-3.5 pr-2 text-sm shadow-[0_2px_10px_rgba(11,37,69,.12)]">
            <EyeOff size={18} className="shrink-0 text-muted" />
            <span className="flex-1">{!s.sharing ? 'Location sharing is off. Other sailors can’t see you.' : 'You’re invisible. You can still see others.'}</span>
            <button className="min-h-9 px-1 font-semibold text-sea" onClick={() => (!s.sharing ? (s.set({ sharing: true }), s.showToast('You are visible on the map again', 'eye')) : s.set({ visSheetOpen: true }))}>
              {!s.sharing ? 'Turn on' : 'Change'}
            </button>
          </div>
        )}
      </div>

      {/* floating buttons */}
      <div className={cx('absolute right-3 z-[5] flex flex-col gap-2.5 transition-all duration-300', s.sheetOpen ? 'pointer-events-none bottom-[650px] opacity-0' : 'bottom-[128px]')}>
        <button aria-label="Map layers" onClick={(e) => { e.stopPropagation(); setUi({ layersOpen: !layersOpen, radiusOpen: false }); }} className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(11,37,69,.18)]"><Layers size={22} strokeWidth={1.75} /></button>
        <button aria-label="Recenter on my boat" onClick={() => s.set({ follow: true, recenterSeq: s.recenterSeq + 1 })} className={cx('flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(11,37,69,.18)]', s.follow ? 'text-signal' : 'text-navy')}><LocateFixed size={22} strokeWidth={1.75} /></button>
      </div>
      {layersOpen && (
        <div className="absolute bottom-[128px] right-[68px] z-[7] flex animate-pop gap-2 rounded-2xl bg-white p-2.5 shadow-[0_10px_30px_rgba(11,37,69,.18)]" onPointerDown={(e) => e.stopPropagation()}>
          {(['standard', 'nautical'] as const).map((l) => (
            <button key={l} onClick={() => { s.set({ layer: l }); setUi({ layersOpen: false }); }} className="flex w-[92px] flex-col items-center gap-1.5 rounded-xl p-1 text-[13px] font-semibold capitalize">
              <span className={cx('h-[60px] w-[84px] overflow-hidden rounded-[10px]', s.layer === l && 'shadow-[0_0_0_2.5px_var(--color-signal)]')}>
                <svg viewBox="0 0 84 60" className="block h-full w-full">
                  <rect width="84" height="60" fill={l === 'standard' ? '#C9DDEE' : '#E3EEF7'} />
                  {l === 'nautical' && <path d="M0 0 H40 C36 20 46 34 36 60 H0 Z" fill="#C6DCEF" />}
                  <path d="M0 0 H34 C30 20 40 34 30 60 H0 Z" fill={l === 'standard' ? '#EEF1EA' : '#F4ECD6'} />
                  <path d="M62 0 H84 V60 H56 C64 40 54 20 62 0 Z" fill={l === 'standard' ? '#EEF1EA' : '#F4ECD6'} />
                  {l === 'nautical' && <><path d="M48 0 L46 60" stroke="#C2378F" strokeWidth="1.5" strokeDasharray="3 3" /><rect x="40" y="18" width="4" height="5" fill="#2E8A57" /><rect x="50" y="34" width="4" height="5" fill="#D64545" /></>}
                </svg>
              </span>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* bottom sheet */}
      <div className={cx('absolute inset-x-0 bottom-0 z-[8] flex flex-col overflow-hidden rounded-t-[22px] bg-white shadow-[0_-6px_24px_rgba(11,37,69,.14)] transition-[height] duration-[380ms] ease-[cubic-bezier(.2,.8,.2,1)]', s.sheetOpen ? 'h-[640px] max-h-[calc(100%-70px)]' : 'h-[116px]')}>
        <button
          className="block w-full touch-none px-5 pb-2.5 pt-2 text-left"
          aria-label={s.sheetOpen ? 'Collapse boat list' : 'Expand boat list'}
          onPointerDown={(e) => (sheetY.current = e.clientY)}
          onPointerUp={(e) => {
            const dy = sheetY.current == null ? 0 : e.clientY - sheetY.current;
            sheetY.current = null;
            if (Math.abs(dy) < 8) s.set({ sheetOpen: !s.sheetOpen });
            else s.set({ sheetOpen: dy < 0 });
          }}
        >
          <span className="mx-auto mb-3 block h-[5px] w-10 rounded-full bg-[#C9D6E3]" />
          <span className="flex items-center justify-between gap-3">
            <span>
              <span className="block text-[22px] font-semibold leading-tight">{count}</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-sm text-muted"><span className="live-dot h-2 w-2 rounded-full bg-success" />{s.offline ? 'Offline · last known positions' : `Within ${s.radius} nm · updating live`}</span>
            </span>
            <span className="flex">
              {faces.map((b) => <Avatar key={b.id} initial={b.name[0]} bg={avatarBg(b.id)} size={32} className="-ml-2.5 shadow-[0_0_0_2.5px_#fff]" />)}
            </span>
          </span>
        </button>
        <div className="flex gap-2 px-5 pb-2.5 pt-0.5">
          {(['all', 'friends'] as const).map((f) => (
            <button key={f} onClick={() => s.set({ listFilter: f })} className={cx('inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold', s.listFilter === f ? 'bg-navy text-white' : 'bg-white text-navy ring-1 ring-inset ring-sea-light')}>
              {f === 'friends' && <Users size={15} />}{f === 'all' ? 'All boats' : 'Friends'}
            </button>
          ))}
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto px-2 pb-4">
          {list.map((b) => {
            const inf = infos[b.id];
            const fr = !!s.friends[b.id];
            return (
              <button key={b.id} onClick={() => s.set({ selectedId: b.id, contactOpen: false })} className="flex min-h-[68px] w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left hover:bg-[#F3F7FA]">
                <Avatar initial={b.name[0]} bg={avatarBg(b.id)} ring={fr} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-semibold">{b.name}{fr && <Badge>Friend</Badge>}</span>
                  <span className="block truncate text-sm text-muted">{b.boat} · {b.model}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-semibold tabular-nums">{inf.distLabel}</span>
                  <span className="block text-[13px] text-muted">{inf.seenLabel}</span>
                </span>
              </button>
            );
          })}
          {list.length === 0 && <p className="px-5 py-7 text-center text-[15px] text-muted">{s.listFilter === 'friends' ? `No friends within ${s.radius} nm right now.` : `No boats within ${s.radius} nm. Try a larger radius.`}</p>}
        </div>
      </div>
    </div>
  );
}
