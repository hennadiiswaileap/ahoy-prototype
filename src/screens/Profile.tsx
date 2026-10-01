import { ChevronLeft, ChevronRight, Users, Globe, Lock, LogOut, Trash2, MapPin, X } from 'lucide-react';
import { useApp } from '../store';
import { APP } from '../config';
import { PresetAvatar } from '../components/art';
import { Avatar, Button, IconButton, Switch, cx } from '../components/ui';
import { useBoatInfos } from '../hooks';
import { avatarBg } from './MapScreen';
import { CONTACT_META } from './Onboarding';
import { VIS_OPTIONS, Radio, useVisibilityActions } from './Overlays';

const Section = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <div className="mt-[18px] px-4">
    {title && <div className="px-1.5 pb-2 text-[13px] font-semibold uppercase tracking-wider text-muted">{title}</div>}
    <div className="overflow-hidden rounded-2xl bg-white">{children}</div>
  </div>
);
const Row = ({ Icon, label, value, onClick, red }: { Icon: typeof Users; label: string; value?: string | number; onClick: () => void; red?: boolean }) => (
  <button onClick={onClick} className={cx('flex min-h-14 w-full items-center gap-3.5 border-b border-mist px-4 py-3 text-left last:border-b-0', red && 'text-[#B3261E]')}>
    <Icon size={22} strokeWidth={1.75} className={red ? 'text-[#B3261E]' : 'text-sea'} />
    <b className="flex-1 font-semibold">{label}</b>
    {value != null && <span className="text-[15px] text-muted">{value}</span>}
    {!red && label !== 'Sign out' && <ChevronRight size={18} className="text-sea-light" />}
  </button>
);

function SubPage({ title, children, white }: { title: string; children: React.ReactNode; white?: boolean }) {
  const s = useApp();
  return (
    <div className={cx('absolute inset-0 z-[25] animate-slide-in overflow-y-auto', white ? 'bg-white' : 'bg-mist')}>
      <div className={cx('sticky top-0 z-[2] flex items-center gap-2.5 px-3 py-2.5', white ? 'bg-white' : 'bg-mist')}>
        <IconButton label="Back" onClick={() => s.set({ subpage: null })}><ChevronLeft size={24} strokeWidth={1.75} /></IconButton>
        <h1 className="text-[22px] font-semibold">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function ProfileScreen() {
  const s = useApp();
  const a = useVisibilityActions();
  const { boats, infos } = useBoatInfos();
  const p = s.profile;
  const C = CONTACT_META[p.contact];
  const friends = boats.filter((b) => s.friends[b.id]);
  return (
    <div className="absolute inset-0 animate-fade-in overflow-y-auto bg-mist pb-6">
      <div className="sticky top-0 z-[2] bg-mist px-5 pb-2.5 pt-[18px]"><h1 className="text-[22px] font-semibold">Profile</h1></div>
      <div className="px-4">
        <div className="flex items-center gap-4 rounded-2xl bg-white p-4">
          <PresetAvatar index={p.avatar} size={76} />
          <div className="min-w-0 flex-1">
            <b className="block text-xl font-semibold">{p.name}</b>
            <span className="block text-muted">{p.boat || 'Your boat'} · {p.model || (p.type === 'motor' ? 'Motorboat' : 'Sailboat')}</span>
            <span className="block text-[13px] text-muted">{p.mmsi ? `MMSI ${p.mmsi}` : 'No MMSI added'}</span>
          </div>
        </div>
        <Button variant="secondary" size="md" className="mt-2.5" onClick={() => s.set({ screen: 'profile', editingProfile: true })}>Edit profile</Button>
      </div>
      <Section title="Location">
        <div className="px-4"><Switch on={s.sharing} onToggle={a.toggleShare} label="Share my location" sub={s.sharing ? 'Your boat is on the map' : 'You are hidden from everyone'} /></div>
      </Section>
      <Section title="Who can see me">
        {VIS_OPTIONS.map((o) => (
          <button key={o.k} role="radio" aria-checked={s.visibility === o.k} disabled={!s.sharing} onClick={() => a.pick(o.k)} className="flex min-h-16 w-full items-center gap-3.5 border-b border-mist px-4 py-3 text-left last:border-b-0 disabled:opacity-45">
            <Radio on={s.visibility === o.k} />
            <span className="flex-1"><b className="block font-semibold">{o.t}</b><span className="text-sm text-muted">{o.d}</span></span>
          </button>
        ))}
      </Section>
      <Section title="Account">
        <Row Icon={Users} label="Friends" value={friends.length} onClick={() => s.set({ subpage: 'friends' })} />
        <Row Icon={C.Icon} label="Preferred contact" value={C.label} onClick={() => s.set({ screen: 'profile', editingProfile: true })} />
        <Row Icon={Globe} label="Language" value="English" onClick={() => s.set({ subpage: 'language' })} />
        <Row Icon={Lock} label="Privacy policy" onClick={() => s.set({ subpage: 'privacy' })} />
      </Section>
      <Section>
        <Row Icon={LogOut} label="Sign out" onClick={() => s.set({ confirm: 'signout' })} />
        <Row Icon={Trash2} label="Delete account" red onClick={() => s.set({ confirm: 'delete' })} />
      </Section>
      <p className="mt-[18px] text-center text-[13px] text-muted">{APP.name} {APP.version}</p>

      {s.subpage === 'friends' && (
        <SubPage title="Friends">
          <div className="px-4">
            <div className="overflow-hidden rounded-2xl bg-white">
              {friends.map((b) => (
                <div key={b.id} className="flex min-h-14 items-center gap-3 border-b border-mist px-4 py-3 last:border-b-0">
                  <Avatar initial={b.name[0]} bg={avatarBg(b.id)} ring />
                  <span className="min-w-0 flex-1"><b className="block font-semibold">{b.name}</b><span className="block text-sm text-muted">{b.boat} · {infos[b.id].distLabel} away</span></span>
                  <button onClick={() => s.set({ tab: 'map', subpage: null, selectedId: b.id, follow: false, focus: { lon: infos[b.id].pos.lon, lat: infos[b.id].pos.lat, seq: Date.now() } })} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ring-1 ring-inset ring-sea-light"><MapPin size={15} />Map</button>
                  <IconButton label={`Remove ${b.name} from friends`} className="text-muted" onClick={() => s.toggleFriend(b.id)}><X size={18} /></IconButton>
                </div>
              ))}
            </div>
            {friends.length === 0 && <p className="px-5 py-7 text-center text-[15px] text-muted">No friends yet. Open a boat on the map and tap Add to friends.</p>}
          </div>
        </SubPage>
      )}
      {s.subpage === 'language' && (
        <SubPage title="Language">
          <div className="mx-4 overflow-hidden rounded-2xl bg-white">
            {[['English', ''], ['Deutsch', 'Coming in a future version'], ['Dansk', 'Coming in a future version']].map(([l, d], i) => (
              <button key={l} onClick={() => i && s.showToast('Coming in a future version', 'globe')} className="flex min-h-16 w-full items-center gap-3.5 border-b border-mist px-4 py-3 text-left last:border-b-0">
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
              ['What others see', 'Your boat appears on the map only while Share my location is on, and only to the people your visibility setting allows: everyone, friends only, or nobody.'],
              ['How long positions are kept', 'Positions are kept for 24 hours so the map can show recent tracks, then deleted. We never sell location data.'],
              ['Your contact details', 'Your phone number or handle is only revealed when you choose a contact method for someone, or when a friend contacts you.'],
              ['About this prototype', 'This is a demo build. Everything stays on this device and no data is sent anywhere.'],
            ].map(([h, t]) => (
              <div key={h}><h3 className="mb-1 text-[17px] font-semibold">{h}</h3><p className="leading-relaxed text-[#3B4A5C]">{t}</p></div>
            ))}
          </div>
        </SubPage>
      )}
    </div>
  );
}
