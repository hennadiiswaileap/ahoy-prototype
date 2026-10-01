import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronDown, Phone, MessageCircle, Send, Info, Sailboat, Ship, Eye, LocateFixed, ShieldCheck, Users, Bell, Delete } from 'lucide-react';
import { useApp } from '../store';
import { APP } from '../config';
import { COUNTRY_CODES, DEMO_PHONE, DEMO_CODE, type ContactKind } from '../demoData';
import { Button, IconButton, Input, Segmented, cx } from '../components/ui';
import { LogoMark, WelcomeArt, LocationArt, NotifArt, AVATARS } from '../components/art';
import { useLongPress } from '../hooks';

const SLIDES = [
  { title: 'See who’s sailing near you', text: 'Live positions of cruising sailors around you, right on the chart.' },
  { title: 'Reach any boat in one tap', text: 'No more waving across the water. Message or call the skipper directly.' },
  { title: 'You decide who sees you', text: 'Share with everyone, only friends, or go invisible. Switch any time.' },
];

function Steps({ n }: { n: number }) {
  return (
    <div className="flex flex-1 gap-1.5 pr-11">
      {[0, 1, 2, 3].map((i) => <span key={i} className={cx('h-1 flex-1 rounded-full', i < n ? 'bg-navy' : 'bg-line')} />)}
    </div>
  );
}
function Header({ onBack, step }: { onBack: () => void; step?: number }) {
  return (
    <div className="flex items-center gap-2 px-3 pt-3">
      <IconButton label="Back" onClick={onBack}><ChevronLeft size={24} strokeWidth={1.75} /></IconButton>
      {step != null && <Steps n={step} />}
    </div>
  );
}
const Screen = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cx('absolute inset-0 flex animate-fade-in flex-col bg-mist', className)}>{children}</div>
);

export function Welcome() {
  const { set } = useApp();
  const [slide, setSlide] = useState(0);
  const startX = useRef<number | null>(null);
  const lp = useLongPress(() => set({ demoOpen: true }));
  return (
    <Screen>
      <div className="flex items-center justify-between pl-5 pr-4 pt-4">
        <button className="flex h-11 items-center gap-2.5" aria-label={`${APP.name}, hold for demo controls`} {...lp}>
          <LogoMark />
          <span className="text-xl font-semibold tracking-tight">{APP.name}</span>
        </button>
        <button className="h-11 px-3 font-semibold text-sea" onClick={() => set({ screen: 'signin' })}>Skip</button>
      </div>
      <div
        className="flex-1 touch-pan-y overflow-hidden"
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current == null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (dx < -40) setSlide((s) => Math.min(2, s + 1));
          if (dx > 40) setSlide((s) => Math.max(0, s - 1));
        }}
      >
        <div className="flex h-full w-[300%] transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)]" style={{ transform: `translateX(${-slide * 33.3333}%)` }}>
          {SLIDES.map((s, i) => (
            <div key={i} className="flex w-1/3 flex-col items-center justify-center gap-3.5 px-8 text-center">
              <div className="mb-4"><WelcomeArt n={i} /></div>
              <h1 className="text-[28px] font-semibold leading-tight tracking-tight">{s.title}</h1>
              <p className="max-w-[300px] text-[17px] text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-1 pb-5">
        {SLIDES.map((_, i) => (
          <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => setSlide(i)} className="flex h-7 w-7 items-center justify-center">
            <span className={cx('h-2 rounded-full transition-all', i === slide ? 'w-6 bg-navy' : 'w-2 bg-sea-light')} />
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center gap-3 px-6 pb-8">
        <Button onClick={() => set({ screen: 'signin' })}>Get started</Button>
        <p className="text-[13px] text-muted">Made for cruising sailors on the Baltic</p>
      </div>
    </Screen>
  );
}

export function SignIn() {
  const { set } = useApp();
  const [busy, setBusy] = useState<null | 'apple' | 'google'>(null);
  const go = (k: 'apple' | 'google') => {
    setBusy(k);
    setTimeout(() => set({ screen: 'phone' }), 1300);
  };
  const Spin = () => <span className="h-[18px] w-[18px] animate-spin rounded-full border-[2.5px] border-current border-r-transparent" />;
  return (
    <Screen className="justify-between px-6 pb-7">
      <div className="flex flex-col items-center gap-3.5 pt-[110px] text-center">
        <LogoMark size={76} />
        <h1 className="mt-2.5 text-[28px] font-semibold tracking-tight">Welcome aboard</h1>
        <p className="max-w-[290px] text-[17px] text-muted">Sign in to see the sailors around you and let them reach you.</p>
      </div>
      <div className="flex flex-col gap-3">
        <Button variant="dark" disabled={!!busy} onClick={() => go('apple')}>{busy === 'apple' ? <><Spin />Signing in…</> : 'Continue with Apple'}</Button>
        <Button variant="secondary" disabled={!!busy} onClick={() => go('google')}>{busy === 'google' ? <><Spin />Signing in…</> : 'Continue with Google'}</Button>
        <p className="mt-1.5 text-center text-[13px] text-muted">By continuing you agree to the Terms of Use and Privacy Policy.</p>
      </div>
    </Screen>
  );
}

export function PhoneScreen() {
  const { set, phone, countryCode } = useApp();
  const [open, setOpen] = useState(false);
  const valid = phone.replace(/\D/g, '').length >= 6;
  return (
    <Screen>
      <Header onBack={() => set({ screen: 'signin' })} step={1} />
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 pt-6">
        <h1 className="text-[28px] font-semibold tracking-tight">What’s your number?</h1>
        <p className="text-muted">We’ll text you a code. Your number is never shown on the map.</p>
        <div className="relative mt-3 flex gap-2.5">
          <button onClick={() => setOpen(!open)} aria-label={`Country code ${countryCode}`} className="flex h-[52px] shrink-0 items-center gap-1 rounded-[14px] border-[1.5px] border-line bg-white pl-3.5 pr-2.5 text-[17px] font-semibold">
            {countryCode}<ChevronDown size={18} />
          </button>
          <Input type="tel" inputMode="tel" autoComplete="tel-national" placeholder={DEMO_PHONE} aria-label="Phone number" value={phone} onChange={(e) => set({ phone: e.target.value.replace(/[^0-9 ]/g, '').slice(0, 16) })} />
          {open && (
            <div className="absolute left-0 top-[58px] z-10 w-[220px] animate-pop rounded-2xl bg-white p-1.5 shadow-[0_12px_32px_rgba(11,37,69,.18)]">
              {COUNTRY_CODES.map((c) => (
                <button key={c.code} onClick={() => { set({ countryCode: c.code }); setOpen(false); }} className="flex h-11 w-full items-center justify-between rounded-[10px] px-3 text-[15px] hover:bg-mist">
                  <span>{c.country}</span><b>{c.code}</b>
                </button>
              ))}
            </div>
          )}
        </div>
        {!phone && (
          <button onClick={() => set({ phone: DEMO_PHONE })} className="inline-flex h-9 items-center gap-1.5 self-start rounded-full bg-[#DCE9F5] px-3.5 text-sm font-semibold text-sea">
            <Phone size={15} />Use {countryCode} {DEMO_PHONE}
          </button>
        )}
      </div>
      <div className="px-6 pb-7 pt-4">
        <Button disabled={!valid} onClick={() => set({ screen: 'code' })}>Send code</Button>
      </div>
    </Screen>
  );
}

export function CodeScreen() {
  const { set, phone, countryCode, showToast, profile } = useApp();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [left, setLeft] = useState(30);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const type = (c: string) => {
    setCode(c);
    if (c.length === 6) {
      setVerifying(true);
      setTimeout(() => set({ screen: 'profile', editingProfile: false, profile: { ...profile, handle: profile.handle || `${countryCode} ${phone || DEMO_PHONE}` } }), 900);
    }
  };
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
  return (
    <Screen>
      <Header onBack={() => set({ screen: 'phone' })} step={2} />
      <div className="flex flex-1 flex-col gap-3 px-6 pt-6">
        <h1 className="text-[28px] font-semibold tracking-tight">Enter the code</h1>
        <p className="text-muted">Sent to {countryCode} {phone || DEMO_PHONE}. <button className="font-semibold text-sea" onClick={() => set({ screen: 'phone' })}>Change</button></p>
        <div className="mt-2 grid grid-cols-6 gap-2" aria-label="Verification code">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cx('flex h-[58px] items-center justify-center rounded-[14px] border-[1.5px] bg-white text-[26px] font-semibold', code.length === 6 ? 'border-success' : i === code.length ? 'border-sea shadow-[0_0_0_3px_rgba(29,92,150,.15)]' : 'border-line')}>
              {code[i] ?? ''}
            </div>
          ))}
        </div>
        <div className="flex min-h-11 items-center justify-between">
          {verifying ? (
            <span className="flex items-center gap-2 text-[15px] text-muted"><span className="h-4 w-4 animate-spin rounded-full border-2 border-sea border-r-transparent" />Verifying…</span>
          ) : (
            <button className="text-[15px] font-semibold text-sea disabled:font-normal disabled:text-muted" disabled={left > 0} onClick={() => { setLeft(30); showToast(`New code sent to ${countryCode} ${phone || DEMO_PHONE}`, 'message'); }}>
              {left > 0 ? `Resend code in 0:${String(left).padStart(2, '0')}` : 'Resend code'}
            </button>
          )}
          {!code && !verifying && (
            <button onClick={() => type(DEMO_CODE)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#DCE9F5] px-3.5 text-sm font-semibold text-sea">
              <MessageCircle size={15} />From Messages: 482 913
            </button>
          )}
        </div>
      </div>
      {/* Native numeric keyboard stand-in so the demo works by tapping on any device */}
      <div className="grid grid-cols-3 gap-2 bg-[#E2EAF1] px-5 pb-6 pt-2">
        {keys.map((k, i) => (
          <button
            key={i}
            aria-label={k === 'del' ? 'Delete' : k || 'Blank'}
            disabled={!k || verifying}
            onClick={() => (k === 'del' ? setCode(code.slice(0, -1)) : code.length < 6 && type(code + k))}
            className={cx('flex h-[52px] items-center justify-center rounded-xl text-2xl', k && k !== 'del' ? 'bg-white shadow-[0_1px_0_#C2CFDC] active:bg-line' : '')}
          >
            {k === 'del' ? <Delete size={24} strokeWidth={1.75} /> : k}
          </button>
        ))}
      </div>
    </Screen>
  );
}

const CONTACT_META: Record<ContactKind, { label: string; Icon: typeof Phone; field: string; ph: string }> = {
  whatsapp: { label: 'WhatsApp', Icon: MessageCircle, field: 'WhatsApp number', ph: '+49 151 2345 6789' },
  telegram: { label: 'Telegram', Icon: Send, field: 'Telegram handle', ph: '@username' },
  phone: { label: 'Phone', Icon: Phone, field: 'Phone number', ph: '+49 151 2345 6789' },
};
export { CONTACT_META };

export function ProfileForm() {
  const { set, profile, editingProfile, showToast, countryCode, phone } = useApp();
  const [hint, setHint] = useState(false);
  const p = profile;
  const upd = (o: Partial<typeof p>) => set({ profile: { ...p, ...o } });
  const invalid = !p.name.trim() || !p.boat.trim();
  return (
    <Screen className="z-[26]">
      <Header onBack={() => set(editingProfile ? { screen: 'app', editingProfile: false } : { screen: 'code' })} step={editingProfile ? undefined : 3} />
      <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto px-6 pb-4 pt-6">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">{editingProfile ? 'Edit profile' : 'Create your profile'}</h1>
          <p className="mt-1.5 text-muted">This is what other sailors see when they tap your boat.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Photo</span>
          <div className="flex gap-3.5">
            {AVATARS.map((a, i) => (
              <button key={i} aria-label={`${a.label} avatar`} aria-pressed={p.avatar === i} onClick={() => upd({ avatar: i })} className={cx('rounded-full p-[3px] transition', p.avatar === i ? 'shadow-[inset_0_0_0_3px_var(--color-signal)]' : '')}>
                <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full text-navy" style={{ background: a.bg }}><a.Icon size={28} strokeWidth={1.6} /></span>
              </button>
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-1.5"><span className="text-sm font-semibold">Your name</span><Input placeholder="e.g. Jonas" value={p.name} onChange={(e) => upd({ name: e.target.value })} /></label>
        <label className="flex flex-col gap-1.5"><span className="text-sm font-semibold">Boat name</span><Input placeholder="e.g. Morgenwind" value={p.boat} onChange={(e) => upd({ boat: e.target.value })} /></label>
        <label className="flex flex-col gap-1.5"><span className="text-sm font-semibold">Boat model <span className="font-normal text-muted">(optional)</span></span><Input placeholder="e.g. Bavaria 34" value={p.model} onChange={(e) => upd({ model: e.target.value })} /></label>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Boat type</span>
          <Segmented value={p.type} onChange={(v) => upd({ type: v })} options={[{ value: 'sail', label: 'Sailboat', icon: <Sailboat size={18} /> }, { value: 'motor', label: 'Motorboat', icon: <Ship size={18} /> }]} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1 text-sm font-semibold">MMSI <span className="font-normal text-muted">(optional)</span>
            <button aria-label="What is MMSI?" onClick={() => setHint(!hint)} className="-my-1.5 flex h-8 w-8 items-center justify-center text-sea"><Info size={18} /></button>
          </span>
          <Input inputMode="numeric" placeholder="211 234 567" aria-label="MMSI" value={p.mmsi} onChange={(e) => upd({ mmsi: e.target.value.replace(/[^0-9 ]/g, '').slice(0, 11) })} />
          {hint && <p className="rounded-xl bg-white px-3 py-2.5 text-sm leading-snug text-muted">Your boat’s 9-digit radio ID from the VHF licence. It lets friends match you with the boat they see in AIS apps.</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">How should sailors reach you?</span>
          <Segmented
            value={p.contact}
            onChange={(v) => upd({ contact: v, handle: v === 'telegram' ? '' : p.handle.startsWith('+') ? p.handle : `${countryCode} ${phone || DEMO_PHONE}` })}
            options={(Object.keys(CONTACT_META) as ContactKind[]).map((k) => { const M = CONTACT_META[k]; return { value: k, label: M.label, icon: <M.Icon size={18} /> }; })}
          />
          <Input className="mt-1" aria-label={CONTACT_META[p.contact].field} placeholder={CONTACT_META[p.contact].ph} value={p.handle} onChange={(e) => upd({ handle: e.target.value })} />
          <p className="text-[13px] text-muted">Only revealed when you choose to contact someone, or a friend contacts you.</p>
        </div>
      </div>
      <div className="bg-mist px-6 pb-7 pt-2.5 shadow-[0_-1px_0_#DCE5EE]">
        <Button disabled={invalid} onClick={() => {
          if (editingProfile) { set({ screen: 'app', editingProfile: false }); showToast('Profile saved', 'check'); }
          else set({ screen: 'permissions' });
        }}>{editingProfile ? 'Save' : 'Continue'}</Button>
      </div>
    </Screen>
  );
}

export function Permissions() {
  const { set, enterApp } = useApp();
  const [step, setStep] = useState<'loc' | 'notif'>('loc');
  const [dialog, setDialog] = useState<null | 'loc' | 'notif'>(null);
  const loc = step === 'loc';
  const bullets = loc
    ? [{ Icon: Eye, t: 'You choose who sees you', d: 'Everyone, friends only, or invisible.' }, { Icon: LocateFixed, t: 'Only while you share', d: 'One switch in Profile turns it off.' }, { Icon: Phone, t: 'Your number stays private', d: 'Shown only when you pick a contact method.' }]
    : [{ Icon: Users, t: 'Friends nearby', d: 'When a friend comes within your radius.' }, { Icon: MessageCircle, t: 'Contact requests', d: 'When a sailor wants to reach you.' }, { Icon: Bell, t: 'Nothing else', d: 'No marketing, no noise.' }];
  const afterLoc = (sharing: boolean) => { setDialog(null); set({ sharing }); setStep('notif'); };
  return (
    <Screen>
      <Header onBack={() => (loc ? set({ screen: 'profile' }) : setStep('loc'))} step={4} />
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-6 pt-6">
        <div className="flex justify-center pb-1 pt-2">{loc ? <LocationArt /> : <NotifArt />}</div>
        <h1 className="text-[28px] font-semibold tracking-tight">{loc ? 'Show your boat on the map' : 'Know when friends are close'}</h1>
        <p className="text-muted">{loc ? `Location is what makes ${APP.name} work: it puts your boat on the chart so nearby sailors can find and reach you.` : 'Get a quiet heads-up when a friend sails within range or someone wants to reach you.'}</p>
        <div className="mt-1.5 flex flex-col gap-3.5">
          {bullets.map((b) => (
            <div key={b.t} className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sea"><b.Icon size={22} strokeWidth={1.75} /></div>
              <div><b className="block font-semibold">{b.t}</b><span className="text-[15px] text-muted">{b.d}</span></div>
            </div>
          ))}
        </div>
        {loc && (
          <div className="mt-1.5 flex items-start gap-2.5 rounded-[14px] bg-[#DDF1E7] px-3.5 py-3 text-sm text-[#1E5C40]">
            <ShieldCheck size={18} className="mt-px shrink-0" />We never sell location data. Positions are deleted after 24 hours.
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 px-6 pb-7 pt-4">
        <Button onClick={() => setDialog(step)}>{loc ? 'Enable location' : 'Enable notifications'}</Button>
        <Button variant="ghost" size="md" onClick={() => (loc ? afterLoc(false) : enterApp())}>Not now</Button>
      </div>
      {dialog && (
        <div className="absolute inset-0 z-[60] flex animate-fade-in items-center justify-center bg-navy/40">
          <div role="dialog" className="w-[300px] animate-pop overflow-hidden rounded-[20px] bg-[#F6F8FA] text-center shadow-[0_20px_50px_rgba(11,37,69,.3)]">
            <div className="flex flex-col items-center gap-2 px-[18px] pb-3.5 pt-5">
              <div className="text-[17px] font-semibold leading-snug">{dialog === 'loc' ? `Allow “${APP.name}” to use your location?` : `“${APP.name}” would like to send you notifications`}</div>
              <div className="text-sm text-[#3B4A5C]">{dialog === 'loc' ? 'Your position is shown to other sailors only with the visibility you choose.' : 'Alerts when friends are nearby or someone contacts you. You can change this in Settings.'}</div>
              {dialog === 'loc' && (
                <svg viewBox="0 0 264 96" className="mt-1 h-24 w-full rounded-xl bg-[#DCE8F3]">
                  <path d="M0 0 H90 C80 30 100 50 84 96 H0 Z" fill="#F4ECD6" /><path d="M200 0 H264 V96 H180 C196 70 180 40 200 0 Z" fill="#F4ECD6" />
                  <circle cx="138" cy="50" r="16" fill="#FF6B35" opacity="0.3" /><circle cx="138" cy="50" r="7" fill="#FF6B35" stroke="#fff" strokeWidth="2.5" />
                </svg>
              )}
            </div>
            {(dialog === 'loc'
              ? [['Allow while using the app', () => afterLoc(true), true], ['Allow always', () => afterLoc(true)], ['Don’t allow', () => afterLoc(false)]]
              : [['Allow', () => enterApp(), true], ['Don’t allow', () => enterApp()]]
            ).map(([label, fn, strong]) => (
              <button key={label as string} onClick={fn as () => void} className={cx('h-12 w-full border-t border-[#D9E1E8] text-base text-sea', strong ? 'font-semibold' : '')}>{label as string}</button>
            ))}
          </div>
        </div>
      )}
    </Screen>
  );
}
