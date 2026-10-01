import { useEffect, useState } from 'react';
import { Compass, Image, Anchor, MessageCircle, User } from 'lucide-react';
import { useApp, applyUrlFlags, type Tab } from './store';
import { APP } from './config';
import { useUiClock } from './hooks';
import { cx } from './components/ui';
import { LogoMark } from './components/art';
import { Welcome, SignIn, PhoneScreen, CodeScreen, ProfileForm, Permissions } from './screens/Onboarding';
import { MapScreen } from './screens/MapScreen';
import { BoatCard, VisibilitySheet, ConfirmDialog, DemoPanel, Toast } from './screens/Overlays';
import { ProfileScreen } from './screens/Profile';
import { FeedScreen, PortsScreen, ChatsScreen } from './screens/Teasers';

const TABS: { k: Tab; label: string; Icon: typeof Compass }[] = [
  { k: 'map', label: 'Nearby', Icon: Compass },
  { k: 'feed', label: 'Feed', Icon: Image },
  { k: 'ports', label: 'Ports', Icon: Anchor },
  { k: 'chats', label: 'Chats', Icon: MessageCircle },
  { k: 'profile', label: 'Profile', Icon: User },
];

function TabBar() {
  const s = useApp();
  return (
    <nav aria-label="Main" className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-5 bg-white px-1 pt-1.5 shadow-[0_-1px_0_#DCE5EE]" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      {TABS.map(({ k, label, Icon }) => (
        <button key={k} aria-current={s.tab === k ? 'page' : undefined} onClick={() => s.set({ tab: k, subpage: null, chatId: null, selectedId: null })}
          className={cx('relative flex h-14 flex-col items-center justify-center gap-[3px] text-[11px] font-semibold', s.tab === k ? 'text-navy' : 'text-[#7C8B9C]')}>
          <span className={cx('absolute top-0 h-[3px] w-7 rounded-full', s.tab === k ? 'bg-signal' : 'bg-transparent')} />
          <Icon size={22} strokeWidth={1.75} />{label}
        </button>
      ))}
    </nav>
  );
}

function PhoneApp() {
  const screen = useApp((s) => s.screen);
  const editing = useApp((s) => s.editingProfile);
  const tab = useApp((s) => s.tab);
  const inApp = screen === 'app' || (screen === 'profile' && editing);
  return (
    <div className="app-root relative h-full w-full overflow-hidden bg-mist text-base leading-snug text-navy">
      {screen === 'welcome' && <Welcome />}
      {screen === 'signin' && <SignIn />}
      {screen === 'phone' && <PhoneScreen />}
      {screen === 'code' && <CodeScreen />}
      {screen === 'profile' && <ProfileForm />}
      {screen === 'permissions' && <Permissions />}
      {inApp && (
        <>
          <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ bottom: 'calc(56px + 6px + max(16px, env(safe-area-inset-bottom)))', paddingTop: 'env(safe-area-inset-top)' }}>
            {tab === 'map' && <MapScreen />}
            {tab === 'feed' && <FeedScreen />}
            {tab === 'ports' && <PortsScreen />}
            {tab === 'chats' && <ChatsScreen />}
            {tab === 'profile' && <ProfileScreen />}
          </div>
          <TabBar />
          <BoatCard />
          <VisibilitySheet />
        </>
      )}
      <ConfirmDialog />
      <DemoPanel />
      <Toast />
    </div>
  );
}

/** Desktop: phone frame with name and tagline. Phones: full screen, no frame. */
function useFramed() {
  const q = '(min-width: 760px) and (pointer: fine)';
  const [framed, setFramed] = useState(() => window.matchMedia(q).matches);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setFramed(mq.matches);
    const rs = () => setScale(Math.min(1, (window.innerHeight - 48) / 868));
    mq.addEventListener('change', on); window.addEventListener('resize', rs); rs();
    return () => { mq.removeEventListener('change', on); window.removeEventListener('resize', rs); };
  }, []);
  return { framed, scale };
}

export default function App() {
  useUiClock();
  useEffect(() => { applyUrlFlags(); }, []);
  const { framed, scale } = useFramed();
  if (!framed) return <div className="h-dvh w-full"><PhoneApp /></div>;
  return (
    <div className="flex min-h-dvh items-center justify-center gap-16 bg-[#DDE5EC] p-6">
      <div className="hidden max-w-[320px] flex-col gap-4 lg:flex">
        <LogoMark size={56} />
        <h1 className="text-5xl font-semibold tracking-tight text-navy">{APP.name}</h1>
        <p className="text-xl leading-snug text-muted">{APP.tagline}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted">Interactive prototype. Long-press the round logo, or add <code className="rounded bg-white/70 px-1">?demo</code> to the URL, for demo controls.</p>
      </div>
      <div style={{ width: 414 * scale, height: 868 * scale }}>
        <div className="origin-top-left rounded-[56px] bg-navy p-3 shadow-[0_30px_80px_rgba(11,37,69,.35)]" style={{ width: 414, height: 868, transform: `scale(${scale})` }}>
          <div className="h-[844px] w-[390px] overflow-hidden rounded-[44px]" style={{ transform: 'translateZ(0)' }}>
            <PhoneApp />
          </div>
        </div>
      </div>
    </div>
  );
}
