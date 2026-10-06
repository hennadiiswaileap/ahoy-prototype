import { X, MessageCircle, Phone, UserCheck, UserPlus, Camera, Anchor, Clock, Globe, Users, EyeOff, Eye, SlidersHorizontal, RotateCcw, Map as MapIcon, WifiOff, FastForward, Plus, Info, Check, Sailboat, User, Trash2, LogOut, Bell, CalendarDays, Wrench, House, Snowflake, Hash } from 'lucide-react';
import { useApp, type Visibility, type Scope } from '../store';
import { APP } from '../config';
import { EXTRA_BOATS, MARINAS, type ContactKind } from '../demoData';
import type { ThemeMode } from '../theme';
import { Scene } from '../components/art';
import { Avatar, Badge, Button, IconButton, MvpBadge, Sheet, Switch, cx } from '../components/ui';
import { sharedPrivateGroups, useBoatInfos } from '../hooks';
import { clock, posAt, userTrack, distanceM, bearingDeg, compass, distLabel } from '../sim';
import { avatarBg } from './MapScreen';
import { GroupAvatar } from './Groups';

const CONTACT: Record<ContactKind, { label: string; Icon: typeof Phone }> = {
  whatsapp: { label: 'WhatsApp', Icon: MessageCircle },
  phone: { label: 'Call', Icon: Phone },
};

export function BoatCard() {
  const s = useApp();
  const { boats, infos } = useBoatInfos();
  const b = boats.find((x) => x.id === s.selectedId);
  if (!b) return null;
  const inf = infos[b.id];
  const scopeB = s.scope === 'b';
  const fr = !scopeB && !!s.friends[b.id];
  const shared = scopeB ? sharedPrivateGroups(s.groups, b.id) : [];
  const ring = scopeB ? (shared.length ? 'shadow-[0_0_0_4px_var(--surface),0_0_0_6px_var(--teak)]' : null) : fr ? 'shadow-[0_0_0_4px_var(--surface),0_0_0_6px_var(--ocean)]' : null;
  const close = () => s.set({ selectedId: null, contactOpen: false });
  return (
    <>
      <Sheet onClose={close} label={b.activity ? b.name : `${b.name} on ${b.boat}`}>
        <div className="overflow-y-auto">
        <div className="relative h-[156px] shrink-0 overflow-hidden">
          <Scene kind={b.scene} hull={b.hull} />
          <IconButton white label="Close" onClick={close} className="absolute right-2.5 top-2.5"><X size={22} strokeWidth={1.75} /></IconButton>
        </div>
        <div className="flex flex-col gap-3.5 px-5 pb-8">
          <div className="relative -mt-[34px] flex items-end gap-3.5">
            <Avatar initial={b.name[0]} bg={avatarBg(b.id)} size={76} className={ring ?? 'shadow-[0_0_0_4px_var(--surface)]'} />
            <div className="min-w-0 flex-1 pb-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[22px] font-semibold">{b.name}</span>
                {fr && <Badge><UserCheck size={14} />Friend</Badge>}
                {shared.slice(0, 2).map((g) => <Badge key={g.id} tone="group">{g.name}</Badge>)}
                {inf.live && <Badge tone="live"><span className="live-dot h-1.5 w-1.5 rounded-full bg-on-accent" />Live</Badge>}
              </div>
              <div className="truncate text-muted">{b.activity ?? `${b.boat} · ${b.model}`}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted">
            <span className="flex min-w-0 items-center gap-1.5">{b.activity ? <House size={15} className="shrink-0" /> : <Anchor size={15} className="shrink-0" />}<span className="truncate">{b.activity ? 'Home' : 'Home port'} {b.home}</span></span>
            <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap tabular-nums"><Clock size={15} /><span className="sr-only">Last update </span>{inf.seenMin < 1 ? 'Just now' : `${inf.seenMin} min ago`}</span>
          </div>
          <Button onClick={() => s.set({ contactOpen: true })}><MessageCircle size={22} strokeWidth={1.75} />Contact {b.name}</Button>
          <div className="grid grid-cols-2 gap-2.5">
            {scopeB ? (
              <Button variant="secondary" size="md" className="relative" onClick={() => s.set({ addToGroupFor: b.id })}><UserPlus size={18} />Add to group<span className="absolute -top-2 right-3 rounded-full bg-surface"><MvpBadge /></span></Button>
            ) : (
              <Button variant="secondary" size="md" onClick={() => s.toggleFriend(b.id)}>{fr ? <UserCheck size={18} /> : <UserPlus size={18} />}{fr ? 'Friends' : 'Add to friends'}</Button>
            )}
            <Button variant="secondary" size="md" onClick={() => s.showToast('Coming in a future version', 'camera')}><Camera size={18} />Share photo</Button>
          </div>
        </div>
        </div>
      </Sheet>
      {s.contactOpen && (
        <Sheet z={40} onClose={() => s.set({ contactOpen: false })} title={`Contact ${b.name}`} label={`Contact ${b.name}`}>
          <div className="flex flex-col gap-3 px-5 pb-8">
            <p className="-mt-1 text-muted">{b.boat || b.name} is {inf.distLabel} {inf.bearingLabel} of you.</p>
            {(Object.keys(CONTACT) as ContactKind[]).map((k) => {
              const C = CONTACT[k];
              return (
                <button key={k} onClick={() => { s.set({ contactOpen: false }); s.showToast(k === 'phone' ? `Calling ${b.name}…` : `Opening ${C.label} for ${b.name}…`, k); }} className="flex min-h-16 w-full items-center gap-3.5 rounded-2xl bg-fill px-3.5 py-3 text-left">
                  <span className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-surface text-ocean"><C.Icon size={22} strokeWidth={1.75} /></span>
                  <span className="flex-1"><b className="block font-semibold">{C.label}</b><span className="text-sm text-muted">{k === 'phone' ? `Ring ${b.name} directly` : `Message ${b.name} on ${C.label}`}</span></span>
                  {b.contact === k && <Badge tone="ok">Preferred</Badge>}
                </button>
              );
            })}
          </div>
        </Sheet>
      )}
    </>
  );
}

/** Small info sheet for a marina tapped on the map. No booking flow. */
export function MarinaSheet() {
  const s = useApp();
  useApp((x) => x.tick);
  const m = MARINAS.find((x) => x.id === s.marinaId);
  if (!m || s.scenario !== 'sail') return null;
  const me = posAt(userTrack('sail'), clock.now());
  const where = `${distLabel(distanceM(me, m), 'nm')} ${compass(bearingDeg(me, m))} of you`;
  return (
    <Sheet onClose={() => s.set({ marinaId: null })} title={m.name} label={`${m.name} marina`}>
      <div className="flex flex-col gap-3 px-5 pb-8">
        <p className="-mt-1 flex items-center gap-1.5 text-muted"><Anchor size={16} className="text-ocean" />Marina · {where}</p>
        <span className="mt-1 text-sm font-semibold">Upcoming</span>
        {m.events.slice(0, 2).map((e) => (
          <div key={e.title} className="flex items-center gap-3 rounded-xl bg-fill px-3.5 py-3">
            <CalendarDays size={20} className="shrink-0 text-ocean" />
            <span className="text-[15px]">{e.title} · <span className="text-muted">{e.when}</span></span>
          </div>
        ))}
        <div className="mt-1 flex items-start gap-3 rounded-2xl bg-teak/12 px-3.5 py-3 ring-1 ring-inset ring-teak/40">
          <Wrench size={20} className="mt-0.5 shrink-0 text-teak" />
          <span className="text-[15px]"><b className="block font-semibold">Coming soon: port services</b><span className="text-muted">Berths, fuel and harbour office details will live here.</span></span>
        </div>
      </div>
    </Sheet>
  );
}

const VIS: Record<Scope, { k: Visibility; t: string; d: string; Icon: typeof Globe }[]> = {
  a: [
    { k: 'everyone', t: 'Everyone', d: `All sailors on ${APP.name} can see and contact you.`, Icon: Globe },
    { k: 'friends', t: 'Friends only', d: 'Only people you added as friends see your boat.', Icon: Users },
    { k: 'invisible', t: 'Invisible', d: 'Nobody sees you. You can still see others.', Icon: EyeOff },
  ],
  b: [
    { k: 'everyone', t: 'Everyone', d: `All sailors on ${APP.name} can see and contact you.`, Icon: Globe },
    { k: 'groups', t: 'Selected groups', d: 'Only members of the groups you pick see your boat.', Icon: Users },
    { k: 'invisible', t: 'Invisible', d: 'Nobody sees you. You can still see others.', Icon: EyeOff },
  ],
};

export function useVisibilityActions() {
  const s = useApp();
  return {
    toggleShare: () => { const on = !s.sharing; s.set({ sharing: on }); s.showToast(on ? 'You are visible on the map again' : 'Location sharing is off', on ? 'eye' : 'eye-off'); },
    pick: (v: Visibility) => {
      const groups = v === 'groups' && !s.visibleGroups.length ? s.groups.filter((g) => g.type === 'private').map((g) => g.id).slice(0, 2) : s.visibleGroups;
      s.set({ visibility: v, visibleGroups: groups });
      s.showToast(`Visibility: ${VIS[s.scope].find((o) => o.k === v)!.t}`, v === 'invisible' ? 'eye-off' : 'eye');
    },
  };
}

/** Who-can-see-me options, used in the visibility sheet and on the Profile tab. */
export function VisibilityOptions({ list }: { list?: boolean }) {
  const s = useApp();
  const a = useVisibilityActions();
  const order = { private: 0, region: 1, community: 2 } as const;
  return (
    <>
      {VIS[s.scope].map((o) => {
        const on = s.visibility === o.k;
        return (
          <div key={o.k} className={cx(list ? 'border-b border-line last:border-b-0' : cx('overflow-hidden rounded-2xl', on ? 'bg-surface shadow-[inset_0_0_0_2px_var(--ink)]' : 'bg-fill'))}>
            <button role="radio" aria-checked={on} disabled={!s.sharing} onClick={() => a.pick(o.k)} className={cx('flex min-h-16 w-full items-center gap-3.5 text-left disabled:opacity-45', list ? 'px-4 py-3' : 'px-3.5 py-3')}>
              {list ? <Radio on={on} /> : <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-surface text-ocean"><o.Icon size={22} strokeWidth={1.75} /></span>}
              <span className="flex-1"><b className="flex items-center gap-1.5 font-semibold">{o.t}{o.k === 'groups' && <MvpBadge />}</b><span className="text-sm text-muted">{o.d}</span></span>
              {!list && <Radio on={on} />}
            </button>
            {o.k === 'groups' && on && s.sharing && (
              <div className={cx('flex flex-col pb-2', list ? 'pl-12 pr-4' : 'px-3.5')}>
                {[...s.groups].sort((x, y) => order[x.type] - order[y.type]).map((g) => {
                  const picked = s.visibleGroups.includes(g.id);
                  return (
                    <button key={g.id} role="checkbox" aria-checked={picked} onClick={() => s.toggleVisibleGroup(g.id)} className="flex min-h-12 items-center gap-3 border-t border-line py-2 text-left">
                      <GroupAvatar g={g} size={30} />
                      <span className="flex-1 text-[15px] font-semibold">{g.name}</span>
                      <span className={cx('flex h-6 w-6 items-center justify-center rounded-md border-2', picked ? 'border-ink bg-ink text-on-ink' : 'border-sky')}>{picked && <Check size={16} strokeWidth={3} />}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export function VisibilitySheet() {
  const s = useApp();
  const a = useVisibilityActions();
  if (!s.visSheetOpen) return null;
  const close = () => s.set({ visSheetOpen: false });
  return (
    <Sheet onClose={close} title="Who can see you" label="Who can see you">
      <div className="flex flex-col gap-3 overflow-y-auto px-5 pb-8">
        <Switch on={s.sharing} onToggle={a.toggleShare} label="Share my location" sub={s.sharing ? 'Your boat is on the map' : 'You are hidden from everyone'} />
        <VisibilityOptions />
        <Button variant="dark" onClick={close}>Done</Button>
      </div>
    </Sheet>
  );
}

export function Radio({ on }: { on: boolean }) {
  return (
    <span className={cx('flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2', on ? 'border-ink' : 'border-sky')}>
      {on && <span className="h-3 w-3 rounded-full bg-ink" />}
    </span>
  );
}

export function ConfirmDialog() {
  const s = useApp();
  if (!s.confirm) return null;
  const del = s.confirm === 'delete';
  return (
    <div className="absolute inset-0 z-[65] flex animate-fade-in items-center justify-center bg-[var(--scrim)] p-7">
      <div role="alertdialog" aria-label={del ? 'Delete your account?' : 'Sign out?'} className="flex w-full animate-pop flex-col gap-2.5 rounded-[22px] bg-surface px-5 pb-4 pt-[22px]">
        <span className="text-[22px] font-semibold">{del ? 'Delete your account?' : 'Sign out?'}</span>
        <p className="text-[15px] text-muted">{del ? `Your profile, ${s.scope === 'b' ? 'groups' : 'friends'} and position history will be removed for good. This cannot be undone.` : 'You will stop sharing your location until you sign in again.'}</p>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          <Button variant="secondary" size="md" onClick={() => s.set({ confirm: null })}>Cancel</Button>
          <Button variant={del ? 'danger' : 'dark'} size="md" onClick={() => { s.resetAll(); useApp.getState().showToast(del ? 'Account deleted' : 'Signed out', del ? 'trash' : 'logout'); }}>{del ? 'Delete' : 'Sign out'}</Button>
        </div>
      </div>
    </div>
  );
}

function PanelSwitch<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-[52px] shrink-0 pl-1.5 text-[13px] font-semibold opacity-70">{label}</span>
      <div className="flex flex-1 gap-1 rounded-xl bg-on-ink/10 p-1" role="radiogroup" aria-label={label}>
        {options.map(([v, l]) => (
          <button key={v} role="radio" aria-checked={value === v} onClick={() => onChange(v)} className={cx('h-9 flex-1 rounded-lg text-[13px] font-semibold', value === v ? 'bg-on-ink text-ink' : 'text-on-ink/75')}>{l}</button>
        ))}
      </div>
    </div>
  );
}

export function DemoPanel() {
  const s = useApp();
  if (!s.demoOpen) return null;
  const next = EXTRA_BOATS[s.extras.length];
  const ski = s.scenario === 'ski';
  const Btn = ({ on, onClick, Icon, children, wide, disabled }: { on?: boolean; onClick: () => void; Icon: typeof X; children: React.ReactNode; wide?: boolean; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} className={cx('flex min-h-[48px] items-center gap-2.5 rounded-[14px] px-3 py-2 text-left text-sm font-semibold leading-tight disabled:opacity-40', on ? 'bg-dehler-red text-on-accent' : 'bg-on-ink/10 text-on-ink', wide && 'col-span-2')}>
      <Icon size={20} strokeWidth={1.75} className={on ? '' : 'opacity-70'} />{children}
    </button>
  );
  return (
    <div role="dialog" aria-label="Demo controls" className="absolute inset-x-3 bottom-[90px] z-[55] flex animate-slide-up flex-col gap-2 rounded-[20px] bg-ink p-3.5 text-on-ink shadow-[0_18px_40px_var(--shadow-lg)]">
      <div className="flex items-center justify-between pl-1.5">
        <b className="flex items-center gap-2 text-[15px]"><SlidersHorizontal size={18} />Demo controls</b>
        <IconButton label="Close demo controls" className="text-on-ink" onClick={() => s.set({ demoOpen: false })}><X size={22} /></IconButton>
      </div>
      <PanelSwitch<Scope> label="Scope" value={s.scope} options={[['a', 'A (MVP)'], ['b', 'B (MVP+)']]} onChange={(v) => s.setScope(v)} />
      <PanelSwitch<ThemeMode> label="Theme" value={s.theme} options={[['system', 'System'], ['light', 'Light'], ['dark', 'Dark']]} onChange={(v) => s.setTheme(v)} />
      <div className="mt-1 grid grid-cols-2 gap-2">
        <Btn Icon={RotateCcw} onClick={() => s.resetAll()}>Reset onboarding</Btn>
        <Btn Icon={MapIcon} onClick={() => { s.set({ demoOpen: false, selectedId: null, subpage: null, chatId: null, groupId: null, visSheetOpen: false }); if (s.screen !== 'app') s.enterApp(); else s.set({ tab: 'map', follow: true }); }}>Jump to map</Btn>
        <Btn Icon={WifiOff} on={s.offline} onClick={() => s.setOffline(!s.offline)}>{s.offline ? 'Offline: on' : 'Simulate offline'}</Btn>
        <Btn Icon={FastForward} on={s.fast} onClick={() => s.setFast(!s.fast)}>{s.fast ? 'Speed: 4x' : 'Speed up simulation'}</Btn>
        {s.scope === 'b' && <Btn Icon={Snowflake} wide on={ski} onClick={() => s.setScenario(ski ? 'sail' : 'ski')}>{ski ? 'Ski trip: on (tap to sail again)' : 'Scenario: ski trip'}</Btn>}
        <Btn Icon={Plus} wide disabled={ski} onClick={() => s.addBoat()}>{next ? `Add a boat nearby (${next.boat})` : 'All demo boats added'}</Btn>
      </div>
    </div>
  );
}

const TOAST_ICONS: Record<string, typeof X> = {
  info: Info, check: Check, sailboat: Sailboat, user: User, 'user-check': UserCheck, camera: Camera, eye: Eye, 'eye-off': EyeOff,
  trash: Trash2, logout: LogOut, message: MessageCircle, whatsapp: MessageCircle, phone: Phone, bell: Bell, globe: Globe, snowflake: Snowflake, hash: Hash,
};
export function Toast() {
  const t = useApp((s) => s.toast);
  if (!t) return null;
  const Icon = TOAST_ICONS[t.icon ?? 'info'] ?? Info;
  return (
    <div key={t.id} role="status" className="absolute top-[72px] left-1/2 z-[70] flex max-w-[calc(100%-24px)] -translate-x-1/2 animate-toast items-center gap-2 rounded-full bg-ink px-[18px] py-3 text-[15px] font-semibold text-on-ink shadow-[0_10px_30px_var(--shadow-lg)]">
      <Icon size={18} className="shrink-0 opacity-75" /><span className="truncate">{t.msg}</span>
    </div>
  );
}
