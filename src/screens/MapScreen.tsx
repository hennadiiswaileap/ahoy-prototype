import { useRef, useState } from 'react';
import { ChevronDown, Radar, WifiOff, EyeOff, Layers, LocateFixed, Users, Anchor } from 'lucide-react';
import { useApp, visibilityText, type Radius } from '../store';
import { APP, MAP } from '../config';
import { PEOPLE } from '../demoData';
import { LogoMark } from '../components/art';
import { Avatar, Badge, MvpBadge, cx } from '../components/ui';
import { useBoatInfos, useLongPress, privateGroupMates, sharedPrivateGroups } from '../hooks';
import { unitMetres, memberId } from '../sim';
import { MapView } from './MapView';

/** Avatar background for a person: their place in the demo list, or a stable pick from their ID. */
export const avatarBg = (id: string) => {
  const mid = memberId(id);
  const i = PEOPLE.findIndex((p) => p.id === mid);
  const n = i >= 0 ? i : [...mid].reduce((t, c) => t + c.charCodeAt(0), 0);
  return `var(--avatar-${n % 6})`;
};

const GROUP_ORDER = { private: 0, region: 1, community: 2 } as const;

export function MapScreen() {
  const s = useApp();
  const { boats, infos, unit } = useBoatInfos();
  const lp = useLongPress(() => s.set({ demoOpen: true }));
  const [radiusOpen, setRadiusOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const setUi = (o: { radiusOpen?: boolean; layersOpen?: boolean }) => {
    if (o.radiusOpen !== undefined) setRadiusOpen(o.radiusOpen);
    if (o.layersOpen !== undefined) setLayersOpen(o.layersOpen);
  };
  const sheetY = useRef<number | null>(null);
  const b = s.scope === 'b';
  const ski = s.scenario === 'ski';

  const hidden = !s.sharing || s.visibility === 'invisible';
  const pill = visibilityText(s);

  const mates = b ? privateGroupMates(s.groups) : new Set<string>();
  const ringFor = (id: string) => (b ? (mates.has(memberId(id)) ? 'teak' : false) : s.friends[id] ? 'ocean' : false) as 'teak' | 'ocean' | false;
  const R = s.radius * unitMetres(unit);
  const inR = boats.filter((x) => infos[x.id].dist <= R);
  const group = b && s.mapGroup !== 'all' ? s.groups.find((g) => g.id === s.mapGroup) : undefined;
  const byDist = (a: { id: string }, c: { id: string }) => infos[a.id].dist - infos[c.id].dist;
  const list = group
    ? boats.filter((x) => group.members.includes(memberId(x.id))).sort(byDist)
    : (!b && s.listFilter === 'friends' ? inR.filter((x) => s.friends[x.id]) : inR).sort(byDist);
  const faces = (group ? list : inR.filter((x) => ringFor(x.id))).slice(0, 3);
  const noun = ski ? ['person', 'people'] : ['boat', 'boats'];
  const count = group
    ? `${list.length} ${ski ? 'out on the slopes' : 'on the water'}`
    : inR.length === 0 ? `No ${noun[1]} nearby` : `${inR.length} ${inR.length === 1 ? noun[0] : noun[1]} nearby`;
  const sub = s.offline ? 'Offline · last known positions' : group ? `${group.name} · ${group.memberCount.toLocaleString('en-GB')} members` : `Within ${s.radius} ${unit} · updating live`;
  const offMin = 4 + Math.floor((s.realSec - s.offlineSince) / 60);
  const chips = [...s.groups].sort((x, y) => GROUP_ORDER[x.type] - GROUP_ORDER[y.type]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-background" onPointerDown={() => (radiusOpen || layersOpen) && setUi({ radiusOpen: false, layersOpen: false })}>
      <MapView />

      {/* top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[6] flex flex-col gap-2 px-3 pt-3 [&>*]:pointer-events-auto">
        <div className="flex items-center gap-2">
          <button aria-label={`${APP.name}, hold for demo controls`} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface shadow-[0_2px_10px_var(--shadow-sm)]" {...lp}>
            <LogoMark />
          </button>
          <button onClick={() => s.set({ visSheetOpen: true })} aria-label={`Visibility: ${pill.a}, ${pill.b}`} className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-full bg-surface pl-4 pr-3.5 text-left shadow-[0_2px_10px_var(--shadow-sm)]">
            <span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', pill.off ? 'bg-muted shadow-[0_0_0_4px_color-mix(in_oklab,var(--muted)_20%,transparent)]' : 'bg-success shadow-[0_0_0_4px_color-mix(in_oklab,var(--success)_20%,transparent)]')} />
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <b className="truncate text-sm font-semibold">{pill.a}</b>
              <span className="truncate text-[13px] text-muted">{pill.b}</span>
            </span>
            <ChevronDown size={18} className="text-muted" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setUi({ radiusOpen: !radiusOpen, layersOpen: false }); }} aria-label={`Search radius ${s.radius} ${unit === 'km' ? 'kilometres' : 'nautical miles'}`} className="flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-surface pl-3 pr-3.5 text-[15px] font-semibold shadow-[0_2px_10px_var(--shadow-sm)]">
            <Radar size={18} className="text-ocean" />{s.radius} {unit}
          </button>
        </div>
        {radiusOpen && (
          <div className="flex w-[230px] animate-pop flex-col gap-2 self-end rounded-2xl bg-surface p-2.5 shadow-[0_10px_30px_var(--shadow-lg)]" onPointerDown={(e) => e.stopPropagation()}>
            <div className="px-1 text-[13px] text-muted">Show {noun[1]} within ({unit})</div>
            <div className="grid grid-cols-4 gap-1.5">
              {MAP.radii.map((r) => (
                <button key={r} onClick={() => { s.setRadius(r as Radius); setUi({ radiusOpen: false }); }} className={cx('h-11 rounded-xl text-[15px] font-semibold', s.radius === r ? 'bg-ink text-on-ink' : 'bg-fill')}>{r}</button>
              ))}
            </div>
          </div>
        )}
        {s.offline && (
          <div className="flex animate-drop items-center gap-2.5 rounded-[14px] bg-ink px-3.5 py-2.5 text-sm text-on-ink shadow-[0_2px_10px_var(--shadow-sm)]">
            <WifiOff size={18} />No connection, showing positions from {offMin} min ago
          </div>
        )}
        {hidden && (
          <div className="flex animate-drop items-center gap-2.5 rounded-[14px] bg-surface py-1.5 pl-3.5 pr-2 text-sm shadow-[0_2px_10px_var(--shadow-sm)]">
            <EyeOff size={18} className="shrink-0 text-muted" />
            <span className="flex-1">{!s.sharing ? 'Location sharing is off. Other sailors can’t see you.' : 'You’re invisible. You can still see others.'}</span>
            <button className="min-h-9 px-1 font-semibold text-ocean" onClick={() => (!s.sharing ? (s.set({ sharing: true }), s.showToast('You are visible on the map again', 'eye')) : s.set({ visSheetOpen: true }))}>
              {!s.sharing ? 'Turn on' : 'Change'}
            </button>
          </div>
        )}
      </div>

      {/* floating buttons */}
      <div className={cx('absolute right-3 z-[5] flex flex-col gap-2.5 transition-all duration-300', s.sheetOpen ? 'pointer-events-none bottom-[650px] opacity-0' : 'bottom-[128px]')}>
        <button aria-label="Map layers" onClick={(e) => { e.stopPropagation(); setUi({ layersOpen: !layersOpen, radiusOpen: false }); }} className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-ink shadow-[0_2px_10px_var(--shadow-sm)]"><Layers size={22} strokeWidth={1.75} /></button>
        <button aria-label="Recenter on my position" onClick={() => s.set({ follow: true, recenterSeq: s.recenterSeq + 1 })} className={cx('flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-[0_2px_10px_var(--shadow-sm)]', s.follow ? 'text-dehler-red' : 'text-ink')}><LocateFixed size={22} strokeWidth={1.75} /></button>
      </div>
      {layersOpen && (
        <div className="absolute bottom-[128px] right-[68px] z-[7] flex w-[212px] animate-pop flex-col gap-2 rounded-2xl bg-surface p-2.5 shadow-[0_10px_30px_var(--shadow-lg)]" onPointerDown={(e) => e.stopPropagation()}>
          <div className="flex gap-2">
            {(['standard', 'nautical'] as const).map((l) => (
              <button key={l} onClick={() => { s.set({ layer: l }); setUi({ layersOpen: false }); }} className="flex flex-1 flex-col items-center gap-1.5 rounded-xl p-1 text-[13px] font-semibold capitalize">
                <span className={cx('h-[60px] w-[84px] overflow-hidden rounded-[10px]', s.layer === l && 'shadow-[0_0_0_2.5px_var(--dehler-red)]')}>
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
          {!ski && (
            <button role="switch" aria-checked={s.showMarinas} onClick={() => s.set({ showMarinas: !s.showMarinas, marinaId: null })} className="flex h-11 items-center gap-2.5 border-t border-line px-1.5 pt-1 text-left text-sm font-semibold">
              <Anchor size={18} className="text-ocean" />
              <span className="flex-1">Show marinas</span>
              <span className={cx('relative h-6 w-10 shrink-0 rounded-full transition-colors', s.showMarinas ? 'bg-success' : 'bg-sky')}>
                <span className={cx('absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform', s.showMarinas && 'translate-x-4')} />
              </span>
            </button>
          )}
        </div>
      )}

      {/* bottom sheet */}
      <div className={cx('absolute inset-x-0 bottom-0 z-[8] flex flex-col overflow-hidden rounded-t-[22px] bg-surface shadow-[0_-6px_24px_var(--shadow-sm)] transition-[height] duration-[380ms] ease-[cubic-bezier(.2,.8,.2,1)]', s.sheetOpen ? 'h-[640px] max-h-[calc(100%-70px)]' : 'h-[116px]')}>
        <button
          className="block w-full touch-none px-5 pb-2.5 pt-2 text-left"
          aria-label={s.sheetOpen ? 'Collapse list' : 'Expand list'}
          onPointerDown={(e) => (sheetY.current = e.clientY)}
          onPointerUp={(e) => {
            const dy = sheetY.current == null ? 0 : e.clientY - sheetY.current;
            sheetY.current = null;
            if (Math.abs(dy) < 8) s.set({ sheetOpen: !s.sheetOpen });
            else s.set({ sheetOpen: dy < 0 });
          }}
        >
          <span className="mx-auto mb-3 block h-[5px] w-10 rounded-full bg-line" />
          <span className="flex items-center justify-between gap-3">
            <span className="min-w-0">
              <span className="block truncate text-[22px] font-semibold leading-tight">{count}</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-sm text-muted"><span className="live-dot h-2 w-2 shrink-0 rounded-full bg-success" /><span className="truncate">{sub}</span></span>
            </span>
            <span className="flex shrink-0">
              {faces.map((x) => <Avatar key={x.id} initial={x.name[0]} bg={avatarBg(x.id)} size={32} className="-ml-2.5 shadow-[0_0_0_2.5px_var(--surface)]" />)}
            </span>
          </span>
        </button>
        {b ? (
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-5 pb-2.5 pt-0.5">
            <MvpBadge />
            {[{ id: 'all', name: ski ? 'Everyone' : 'All boats' }, ...chips].map((g) => (
              <button key={g.id} onClick={() => (g.id === 'all' ? s.set({ mapGroup: 'all', follow: true, zoomSeq: s.zoomSeq + 1 }) : s.set({ mapGroup: g.id, follow: false, fitSeq: s.fitSeq + 1 }))} className={cx('inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold', s.mapGroup === g.id ? 'bg-ink text-on-ink' : 'bg-surface text-ink ring-1 ring-inset ring-sky')}>
                {g.id !== 'all' && 'type' in g && g.type === 'private' && <span className="h-2 w-2 rounded-full bg-teak" />}{g.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-2 px-5 pb-2.5 pt-0.5">
            {(['all', 'friends'] as const).map((f) => (
              <button key={f} onClick={() => s.set({ listFilter: f })} className={cx('inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold', s.listFilter === f ? 'bg-ink text-on-ink' : 'bg-surface text-ink ring-1 ring-inset ring-sky')}>
                {f === 'friends' && <Users size={15} />}{f === 'all' ? 'All boats' : 'Friends'}
              </button>
            ))}
          </div>
        )}
        <div className="no-scrollbar flex-1 overflow-y-auto px-2 pb-4">
          {list.map((x) => {
            const inf = infos[x.id];
            const shared = b ? sharedPrivateGroups(s.groups, x.id) : [];
            return (
              <button key={x.id} onClick={() => s.set({ selectedId: x.id, contactOpen: false, marinaId: null })} className="flex min-h-[68px] w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left hover:bg-fill">
                <Avatar initial={x.name[0]} bg={avatarBg(x.id)} ring={ringFor(x.id)} />
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-center gap-1.5 font-semibold">
                    <span className="truncate">{x.name}</span>
                    {!b && s.friends[x.id] && <Badge>Friend</Badge>}
                    {shared[0] && <Badge tone="group" className="min-w-0"><span className="truncate">{shared[0].name}</span></Badge>}
                  </span>
                  <span className="block truncate text-sm text-muted">{x.activity ?? `${x.boat} · ${x.model}`}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-semibold tabular-nums">{inf.distLabel}</span>
                  <span className="block text-[13px] text-muted">{inf.seenLabel}</span>
                </span>
              </button>
            );
          })}
          {list.length === 0 && (
            <p className="px-5 py-7 text-center text-[15px] text-muted">
              {group ? `Nobody from ${group.name} is out right now.` : !b && s.listFilter === 'friends' ? `No friends within ${s.radius} ${unit} right now.` : `No ${noun[1]} within ${s.radius} ${unit}. Try a larger radius.`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
