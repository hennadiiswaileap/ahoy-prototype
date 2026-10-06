import { ChevronRight, Users, Globe, Lock, LogOut, Trash2, MapPin, X, Sailboat, Compass, SunMoon, Monitor, Sun, Moon } from 'lucide-react';
import { useApp } from '../store';
import { APP } from '../config';
import type { ThemeMode } from '../theme';
import { PresetAvatar } from '../components/art';
import { Avatar, Badge, Button, IconButton, MvpBadge, ScreenHeader, Switch, cx } from '../components/ui';
import { useBoatInfos } from '../hooks';
import { avatarBg } from './MapScreen';
import { CONTACT_META } from './Onboarding';
import { Radio, VisibilityOptions, useVisibilityActions } from './Overlays';

const Section = ({ title, badge, children }: { title?: string; badge?: React.ReactNode; children: React.ReactNode }) => (
  <div className="mt-[18px] px-4">
    {title && <div className="flex items-center gap-2 px-1.5 pb-2 text-[13px] font-semibold uppercase tracking-wider text-muted">{title}{badge}</div>}
    <div className="overflow-hidden rounded-2xl bg-surface">{children}</div>
  </div>
);
const Row = ({ Icon, label, value, onClick, red, badge }: { Icon: typeof Users; label: string; value?: string | number; onClick: () => void; red?: boolean; badge?: React.ReactNode }) => (
  <button onClick={onClick} className={cx('flex min-h-14 w-full items-center gap-3.5 border-b border-line px-4 py-3 text-left last:border-b-0', red && 'text-danger')}>
    <Icon size={22} strokeWidth={1.75} className={red ? 'text-danger' : 'text-ocean'} />
    <b className="flex flex-1 items-center gap-2 font-semibold">{label}{badge}</b>
    {value != null && <span className="text-[15px] text-muted">{value}</span>}
    {!red && label !== 'Sign out' && <ChevronRight size={18} className="text-muted" />}
  </button>
);

function SubPage({ title, children, white }: { title: string; children: React.ReactNode; white?: boolean }) {
  const s = useApp();
  return (
    <div className={cx('absolute inset-0 z-[25] animate-slide-in overflow-y-auto', white ? 'bg-surface' : 'bg-background')}>
      <ScreenHeader title={title} back={() => s.set({ subpage: null })} />
      <div className="h-3.5" />
      {children}
    </div>
  );
}

const THEMES: { k: ThemeMode; t: string; d: string; Icon: typeof Sun }[] = [
  { k: 'system', t: 'System', d: 'Match your phone’s light or dark setting', Icon: Monitor },
  { k: 'light', t: 'Light', d: 'Best in bright sunlight', Icon: Sun },
  { k: 'dark', t: 'Dark', d: 'Easier on the eyes at night', Icon: Moon },
];

export function ProfileScreen() {
  const s = useApp();
  const a = useVisibilityActions();
  const { boats, infos } = useBoatInfos();
  const p = s.profile;
  const C = CONTACT_META[p.contact];
  const b = s.scope === 'b';
  const friends = boats.filter((x) => s.friends[x.id]);
  const community = p.vertical === 'sailing' ? 'Sailing' : p.otherActivity.trim() ? `Other: ${p.otherActivity.trim()}` : 'Other';
  return (
    <div className="absolute inset-0 animate-fade-in overflow-y-auto bg-background pb-6">
      <ScreenHeader title="Profile" />
      <div className="h-3.5" />
      <div className="px-4">
        <div className="flex items-center gap-4 rounded-2xl bg-surface p-4">
          <PresetAvatar index={p.avatar} size={76} />
          <div className="min-w-0 flex-1">
            <b className="block text-xl font-semibold">{p.name}</b>
            <span className="block text-muted">{p.boat || 'Your boat'} · {p.model || (p.type === 'motor' ? 'Motorboat' : 'Sailboat')}</span>
            <span className="block text-[13px] text-muted">{p.mmsi ? `MMSI ${p.mmsi}` : 'No MMSI added'}</span>
            <Badge tone="friend" className="mt-1.5 max-w-full">
              {p.vertical === 'sailing' ? <Sailboat size={13} className="shrink-0 text-ocean" /> : <Compass size={13} className="shrink-0 text-ocean" />}
              <span className="truncate">{community} community</span>
            </Badge>
          </div>
        </div>
        <Button variant="secondary" size="md" className="mt-2.5" onClick={() => s.set({ screen: 'profile', editingProfile: true })}>Edit profile</Button>
      </div>
      <Section title="Location">
        <div className="px-4"><Switch on={s.sharing} onToggle={a.toggleShare} label="Share my location" sub={s.sharing ? 'Your boat is on the map' : 'You are hidden from everyone'} /></div>
      </Section>
      <Section title="Who can see me">
        <VisibilityOptions list />
      </Section>
      <Section title="Account">
        {b
          ? <Row Icon={Users} label="Groups" badge={<MvpBadge />} value={s.groups.length} onClick={() => s.set({ tab: 'groups' })} />
          : <Row Icon={Users} label="Friends" value={friends.length} onClick={() => s.set({ subpage: 'friends' })} />}
        <Row Icon={C.Icon} label="Preferred contact" value={C.label} onClick={() => s.set({ screen: 'profile', editingProfile: true })} />
        <Row Icon={SunMoon} label="Appearance" value={THEMES.find((t) => t.k === s.theme)!.t} onClick={() => s.set({ subpage: 'appearance' })} />
        <Row Icon={Globe} label="Language" value="English" onClick={() => s.set({ subpage: 'language' })} />
        <Row Icon={Lock} label="Privacy policy" onClick={() => s.set({ subpage: 'privacy' })} />
      </Section>
      <Section>
        <Row Icon={LogOut} label="Sign out" onClick={() => s.set({ confirm: 'signout' })} />
        <Row Icon={Trash2} label="Delete account" red onClick={() => s.set({ confirm: 'delete' })} />
      </Section>
      <p className="mt-[18px] text-center text-[13px] text-muted">{APP.name} {APP.version}{s.badges ? ` · Scope ${b ? 'B (MVP+)' : 'A (MVP)'}` : ''}</p>

      {s.subpage === 'friends' && (
        <SubPage title="Friends">
          <div className="px-4">
            <div className="overflow-hidden rounded-2xl bg-surface">
              {friends.map((x) => (
                <div key={x.id} className="flex min-h-14 items-center gap-3 border-b border-line px-4 py-3 last:border-b-0">
                  <Avatar initial={x.name[0]} bg={avatarBg(x.id)} ring="teak" />
                  <span className="min-w-0 flex-1"><b className="block font-semibold">{x.name}</b><span className="block text-sm text-muted">{x.boat} · {infos[x.id].distLabel} away</span></span>
                  <button onClick={() => s.set({ tab: 'map', subpage: null, selectedId: x.id, follow: false, focus: { lon: infos[x.id].pos.lon, lat: infos[x.id].pos.lat, seq: Date.now() } })} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ring-1 ring-inset ring-outline"><MapPin size={15} />Map</button>
                  <IconButton label={`Remove ${x.name} from friends`} className="text-muted" onClick={() => s.toggleFriend(x.id)}><X size={18} /></IconButton>
                </div>
              ))}
            </div>
            {friends.length === 0 && <p className="px-5 py-7 text-center text-[15px] text-muted">No friends yet. Open a boat on the map and tap Add to friends.</p>}
          </div>
        </SubPage>
      )}
      {s.subpage === 'appearance' && (
        <SubPage title="Appearance">
          <div className="mx-4 overflow-hidden rounded-2xl bg-surface">
            {THEMES.map((t) => (
              <button key={t.k} role="radio" aria-checked={s.theme === t.k} onClick={() => s.setTheme(t.k)} className="flex min-h-16 w-full items-center gap-3.5 border-b border-line px-4 py-3 text-left last:border-b-0">
                <t.Icon size={22} strokeWidth={1.75} className="text-ocean" />
                <span className="flex-1"><b className="block font-semibold">{t.t}</b><span className="text-sm text-muted">{t.d}</span></span>
                <Radio on={s.theme === t.k} />
              </button>
            ))}
          </div>
        </SubPage>
      )}
      {s.subpage === 'language' && (
        <SubPage title="Language">
          <div className="mx-4 overflow-hidden rounded-2xl bg-surface">
            {[['English', ''], ['Deutsch', 'Coming in a future version'], ['Dansk', 'Coming in a future version']].map(([l, d], i) => (
              <button key={l} onClick={() => i && s.showToast('Coming in a future version', 'globe')} className="flex min-h-16 w-full items-center gap-3.5 border-b border-line px-4 py-3 text-left last:border-b-0">
                <Radio on={i === 0} /><span className="flex-1"><b className="block font-semibold">{l}</b>{d && <span className="text-sm text-muted">{d}</span>}</span>
              </button>
            ))}
          </div>
        </SubPage>
      )}
      {s.subpage === 'privacy' && (
        <SubPage title="Privacy policy" white>
          <div className="flex flex-col gap-[18px] px-6 pb-10 pt-2">
            {[
              ['What others see', `Your boat appears on the map only while Share my location is on, and only to the people your visibility setting allows: everyone, ${b ? 'members of the groups you pick' : 'friends only'}, or nobody.`],
              ['How long positions are kept', 'Positions are kept for 24 hours so the map can show recent tracks, then deleted. We never sell location data.'],
              ['Your contact details', 'Your phone number is only revealed when you choose a contact method for someone, or when a friend contacts you.'],
              ['About this prototype', 'This is a demo build. Everything stays on this device and no data is sent anywhere.'],
            ].map(([h, t]) => (
              <div key={h}><h3 className="mb-1 text-[17px] font-semibold">{h}</h3><p className="leading-relaxed text-muted">{t}</p></div>
            ))}
          </div>
        </SubPage>
      )}
    </div>
  );
}
