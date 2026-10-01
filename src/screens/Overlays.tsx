import { X, MessageCircle, Send, Phone, UserCheck, UserPlus, Camera, Anchor, Globe, Users, EyeOff, Eye, SlidersHorizontal, RotateCcw, Map as MapIcon, WifiOff, FastForward, Plus, Info, Check, Sailboat, User, Trash2, LogOut, Bell } from 'lucide-react';
import { useApp, type Visibility } from '../store';
import { APP } from '../config';
import { EXTRA_BOATS, type ContactKind } from '../demoData';
import { Scene } from '../components/art';
import { Avatar, Badge, Button, IconButton, Sheet, Switch, cx } from '../components/ui';
import { useBoatInfos } from '../hooks';
import { avatarBg } from './MapScreen';

const CONTACT: Record<ContactKind, { label: string; Icon: typeof Phone }> = {
  whatsapp: { label: 'WhatsApp', Icon: MessageCircle },
  telegram: { label: 'Telegram', Icon: Send },
  phone: { label: 'Call', Icon: Phone },
};

export function BoatCard() {
  const s = useApp();
  const { boats, infos } = useBoatInfos();
  const b = boats.find((x) => x.id === s.selectedId);
  if (!b) return null;
  const inf = infos[b.id];
  const fr = !!s.friends[b.id];
  const close = () => s.set({ selectedId: null, contactOpen: false });
  return (
    <>
      <Sheet onClose={close} label={`${b.name} on ${b.boat}`}>
        <div className="overflow-y-auto">
        <div className="relative h-[156px] shrink-0 overflow-hidden">
          <Scene kind={b.scene} hull={b.hull} />
          <IconButton white label="Close" onClick={close} className="absolute right-2.5 top-2.5"><X size={22} strokeWidth={1.75} /></IconButton>
        </div>
        <div className="flex flex-col gap-3.5 px-5 pb-8">
          <div className="relative -mt-[34px] flex items-end gap-3.5">
            <Avatar initial={b.name[0]} bg={avatarBg(b.id)} size={76} className={fr ? 'shadow-[0_0_0_4px_#fff,0_0_0_6px_var(--color-sea)]' : 'shadow-[0_0_0_4px_#fff]'} />
            <div className="flex-1 pb-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[22px] font-semibold">{b.name}</span>
                {fr && <Badge><UserCheck size={14} />Friend</Badge>}
                {inf.live && <Badge tone="live">Live</Badge>}
              </div>
              <div className="text-muted">{b.boat} · {b.model}</div>
            </div>
          </div>
          <div className="self-start rounded-[14px] bg-mist px-3 py-2.5"><b className="block whitespace-nowrap text-lg font-semibold tabular-nums">{inf.seenMin < 1 ? 'now' : `${inf.seenMin} min`}</b><span className="text-[13px] text-muted">Last update</span></div>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <span className="flex items-center gap-1.5"><Anchor size={15} />Home port {b.home}</span>
          </div>
          <Button onClick={() => s.set({ contactOpen: true })}><MessageCircle size={22} strokeWidth={1.75} />Contact {b.name}</Button>
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="secondary" size="md" onClick={() => s.toggleFriend(b.id)}>{fr ? <UserCheck size={18} /> : <UserPlus size={18} />}{fr ? 'Friends' : 'Add to friends'}</Button>
            <Button variant="secondary" size="md" onClick={() => s.showToast('Coming in a future version', 'camera')}><Camera size={18} />Share photo</Button>
          </div>
        </div>
        </div>
      </Sheet>
      {s.contactOpen && (
        <Sheet z={40} onClose={() => s.set({ contactOpen: false })} title={`Contact ${b.name}`} label={`Contact ${b.name}`}>
          <div className="flex flex-col gap-3 px-5 pb-8">
            <p className="-mt-1 text-muted">{b.boat} is {inf.distLabel} {inf.bearingLabel} of you.</p>
            {(Object.keys(CONTACT) as ContactKind[]).map((k) => {
              const C = CONTACT[k];
              return (
                <button key={k} onClick={() => { s.set({ contactOpen: false }); s.showToast(k === 'phone' ? `Calling ${b.name}…` : `Opening ${C.label} for ${b.name}…`, k); }} className="flex min-h-16 w-full items-center gap-3.5 rounded-2xl bg-mist px-3.5 py-3 text-left">
                  <span className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-white text-sea"><C.Icon size={22} strokeWidth={1.75} /></span>
                  <span className="flex-1"><b className="block font-semibold">{C.label}</b><span className="text-sm text-muted">{k === 'phone' ? `Ring ${b.name} directly` : `Message ${b.name} on ${C.label}`}</span></span>
                  {b.contact === k && <Badge tone="live">Preferred</Badge>}
                </button>
              );
            })}
          </div>
        </Sheet>
      )}
    </>
  );
}

export const VIS_OPTIONS: { k: Visibility; t: string; d: string; Icon: typeof Globe }[] = [
  { k: 'everyone', t: 'Everyone', d: `All sailors on ${APP.name} can see and contact you.`, Icon: Globe },
  { k: 'friends', t: 'Friends only', d: 'Only people you added as friends see your boat.', Icon: Users },
  { k: 'invisible', t: 'Invisible', d: 'Nobody sees you. You can still see others.', Icon: EyeOff },
];

export function useVisibilityActions() {
  const s = useApp();
  return {
    toggleShare: () => { const on = !s.sharing; s.set({ sharing: on }); s.showToast(on ? 'You are visible on the map again' : 'Location sharing is off', on ? 'eye' : 'eye-off'); },
    pick: (v: Visibility) => { s.set({ visibility: v }); s.showToast(`Visibility: ${VIS_OPTIONS.find((o) => o.k === v)!.t}`, v === 'invisible' ? 'eye-off' : 'eye'); },
  };
}

export function VisibilitySheet() {
  const s = useApp();
  const a = useVisibilityActions();
  if (!s.visSheetOpen) return null;
  const close = () => s.set({ visSheetOpen: false });
  return (
    <Sheet onClose={close} title="Who can see you" label="Who can see you">
      <div className="flex flex-col gap-3 px-5 pb-8">
        <Switch on={s.sharing} onToggle={a.toggleShare} label="Share my location" sub={s.sharing ? 'Your boat is on the map' : 'You are hidden from everyone'} />
        {VIS_OPTIONS.map((o) => (
          <button key={o.k} role="radio" aria-checked={s.visibility === o.k} disabled={!s.sharing} onClick={() => a.pick(o.k)}
            className={cx('flex min-h-16 w-full items-center gap-3.5 rounded-2xl px-3.5 py-3 text-left disabled:opacity-45', s.visibility === o.k ? 'bg-white shadow-[inset_0_0_0_2px_var(--color-navy)]' : 'bg-mist')}>
            <span className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-white text-sea"><o.Icon size={22} strokeWidth={1.75} /></span>
            <span className="flex-1"><b className="block font-semibold">{o.t}</b><span className="text-sm text-muted">{o.d}</span></span>
            <Radio on={s.visibility === o.k} />
          </button>
        ))}
        <Button variant="dark" onClick={close}>Done</Button>
      </div>
    </Sheet>
  );
}

export function Radio({ on }: { on: boolean }) {
  return (
    <span className={cx('flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2', on ? 'border-navy' : 'border-sea-light')}>
      {on && <span className="h-3 w-3 rounded-full bg-navy" />}
    </span>
  );
}

export function ConfirmDialog() {
  const s = useApp();
  if (!s.confirm) return null;
  const del = s.confirm === 'delete';
  return (
    <div className="absolute inset-0 z-[65] flex animate-fade-in items-center justify-center bg-navy/45 p-7">
      <div role="alertdialog" aria-label={del ? 'Delete your account?' : 'Sign out?'} className="flex w-full animate-pop flex-col gap-2.5 rounded-[22px] bg-white px-5 pb-4 pt-[22px]">
        <span className="text-[22px] font-semibold">{del ? 'Delete your account?' : 'Sign out?'}</span>
        <p className="text-[15px] text-muted">{del ? 'Your profile, friends and position history will be removed for good. This cannot be undone.' : 'You will stop sharing your location until you sign in again.'}</p>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          <Button variant="secondary" size="md" onClick={() => s.set({ confirm: null })}>Cancel</Button>
          <Button variant={del ? 'danger' : 'dark'} size="md" onClick={() => { s.resetAll(); useApp.getState().showToast(del ? 'Account deleted' : 'Signed out', del ? 'trash' : 'logout'); }}>{del ? 'Delete' : 'Sign out'}</Button>
        </div>
      </div>
    </div>
  );
}

export function DemoPanel() {
  const s = useApp();
  if (!s.demoOpen) return null;
  const next = EXTRA_BOATS[s.extras.length];
  const Btn = ({ on, onClick, Icon, children, wide }: { on?: boolean; onClick: () => void; Icon: typeof X; children: React.ReactNode; wide?: boolean }) => (
    <button onClick={onClick} className={cx('flex min-h-[52px] items-center gap-2.5 rounded-[14px] px-3 py-2 text-left text-sm font-semibold leading-tight text-white', on ? 'bg-signal' : 'bg-sea-light/15', wide && 'col-span-2')}>
      <Icon size={20} strokeWidth={1.75} className={on ? 'text-white' : 'text-sea-light'} />{children}
    </button>
  );
  return (
    <div role="dialog" aria-label="Demo controls" className="absolute inset-x-3 bottom-[90px] z-[55] animate-slide-up rounded-[20px] bg-navy p-3.5 text-white shadow-[0_18px_40px_rgba(11,37,69,.4)]">
      <div className="flex items-center justify-between pb-2 pl-1.5">
        <b className="flex items-center gap-2 text-[15px]"><SlidersHorizontal size={18} />Demo controls</b>
        <IconButton label="Close demo controls" className="text-white" onClick={() => s.set({ demoOpen: false })}><X size={22} /></IconButton>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Btn Icon={RotateCcw} onClick={() => s.resetAll()}>Reset onboarding</Btn>
        <Btn Icon={MapIcon} onClick={() => { s.set({ demoOpen: false, selectedId: null, subpage: null, chatId: null, visSheetOpen: false }); if (s.screen !== 'app') s.enterApp(); else s.set({ tab: 'map', follow: true }); }}>Jump to map</Btn>
        <Btn Icon={WifiOff} on={s.offline} onClick={() => s.setOffline(!s.offline)}>{s.offline ? 'Offline: on' : 'Simulate offline'}</Btn>
        <Btn Icon={FastForward} on={s.fast} onClick={() => s.setFast(!s.fast)}>{s.fast ? 'Speed: 4x' : 'Speed up simulation'}</Btn>
        <Btn Icon={Plus} wide onClick={() => s.addBoat()}>{next ? `Add a boat nearby (${next.boat})` : 'All demo boats added'}</Btn>
      </div>
    </div>
  );
}

const TOAST_ICONS: Record<string, typeof X> = {
  info: Info, check: Check, sailboat: Sailboat, user: User, 'user-check': UserCheck, camera: Camera, eye: Eye, 'eye-off': EyeOff,
  trash: Trash2, logout: LogOut, message: MessageCircle, whatsapp: MessageCircle, telegram: Send, phone: Phone, bell: Bell,
};
export function Toast() {
  const t = useApp((s) => s.toast);
  if (!t) return null;
  const Icon = TOAST_ICONS[t.icon ?? 'info'] ?? Info;
  return (
    <div key={t.id} role="status" className="absolute top-[72px] left-1/2 z-[70] flex -translate-x-1/2 animate-toast items-center gap-2 whitespace-nowrap rounded-full bg-navy px-[18px] py-3 text-[15px] font-semibold text-white shadow-[0_10px_30px_rgba(11,37,69,.3)]">
      <Icon size={18} className="text-sea-light" />{t.msg}
    </div>
  );
}
