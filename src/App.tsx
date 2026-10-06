import { useEffect, useState } from 'react';
import { Compass, Image, MessageCircle, User, Users } from 'lucide-react';
import { useApp, applyUrlFlags, TABS_BY_SCOPE, type Tab } from './store';
import { APP } from './config';
import { useThemeSync, useUiClock } from './hooks';
import { MvpBadge, cx } from './components/ui';
import { BrandArt } from './components/art';
import { Welcome, SignIn, PhoneScreen, CodeScreen, CommunityScreen, ProfileForm, Permissions } from './screens/Onboarding';
import { MapScreen } from './screens/MapScreen';
import { BoatCard, MarinaSheet, VisibilitySheet, ConfirmDialog, DemoPanel, Toast } from './screens/Overlays';
import { ProfileScreen } from './screens/Profile';
import { FeedScreen, ChatsScreen } from './screens/Teasers';
import { GroupsScreen, GroupSheets } from './screens/Groups';

const TAB_META: Record<Tab, { label: string; Icon: typeof Compass }> = {
  map: { label: 'Nearby', Icon: Compass },
  groups: { label: 'Groups', Icon: Users },
  feed: { label: 'Feed', Icon: Image },
  chats: { label: 'Chats', Icon: MessageCircle },
  profile: { label: 'Profile', Icon: User },
};

function TabBar() {
  const s = useApp();
  const b = s.scope === 'b';
  const tabs = TABS_BY_SCOPE[s.scope];
  const unread = Object.values(s.unread).reduce((t, n) => t + n, 0);
  return (
    <nav aria-label="Main" className="absolute inset-x-0 bottom-0 z-20 grid bg-chrome px-1 pt-1.5 shadow-[0_-1px_0_var(--line)]" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`, paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      {tabs.map((k) => {
        const { Icon } = TAB_META[k];
        const label = k === 'map' && b ? 'Map' : TAB_META[k].label;
        const on = s.tab === k;
        return (
          <button key={k} aria-current={on ? 'page' : undefined} aria-label={k === 'groups' ? `Groups, MVP+${unread ? `, ${unread} unread` : ''}` : undefined}
            onClick={() => s.set({ tab: k, subpage: null, chatId: null, selectedId: null, groupId: null, marinaId: null })}
            className={cx('relative flex h-14 flex-col items-center justify-center gap-[3px] text-[11px] font-semibold', on ? 'text-sky' : 'text-on-chrome-muted')}>
            {/* Active tab: Sky colour plus a bar and a heavier icon, so it doesn't rely on colour alone. */}
            <span className={cx('absolute top-0 h-[3px] w-7 rounded-full', on ? 'bg-sky' : 'bg-transparent')} />
            <span className="relative">
              <Icon size={22} strokeWidth={on ? 2.2 : 1.75} />
              {k === 'groups' && unread > 0 && <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky px-1 text-[10px] font-bold text-sail">{unread}</span>}
            </span>
            <span className="flex items-center gap-1">{label}{k === 'groups' && <MvpBadge className="h-[14px] rounded px-1 text-[9px]" />}</span>
          </button>
        );
      })}
    </nav>
  );
}

/** Brand splash on first open: the client's logo as drawn, on near-black. */
function Splash() {
  const [phase, setPhase] = useState<'show' | 'out' | 'gone'>(() => (new URLSearchParams(window.location.search).get('screen') === 'map' ? 'gone' : 'show'));
  useEffect(() => {
    if (phase === 'gone') return;
    const t1 = setTimeout(() => setPhase('out'), 1300);
    const t2 = setTimeout(() => setPhase('gone'), 1750);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (phase === 'gone') return null;
  return (
    <div className={cx('absolute inset-0 z-[80] flex flex-col items-center justify-center gap-3 bg-sail px-8', phase === 'out' && 'splash-out')} aria-hidden="true">
      <BrandArt tone="original" className="w-[230px]" />
      <span className="text-[32px] font-semibold tracking-tight text-white">{APP.name}</span>
      <span className="max-w-[260px] text-center text-[15px] leading-snug text-white/70">{APP.tagline}</span>
    </div>
  );
}

function PhoneApp() {
  const screen = useApp((s) => s.screen);
  const editing = useApp((s) => s.editingProfile);
  const tab = useApp((s) => s.tab);
  const inApp = screen === 'app' || (screen === 'profile' && editing);
  return (
    <div className="app-root relative h-full w-full overflow-hidden bg-background text-base leading-snug text-ink">
      {screen === 'welcome' && <Welcome />}
      {screen === 'signin' && <SignIn />}
      {screen === 'phone' && <PhoneScreen />}
      {screen === 'code' && <CodeScreen />}
      {screen === 'community' && <CommunityScreen />}
      {screen === 'profile' && <ProfileForm />}
      {screen === 'permissions' && <Permissions />}
      {inApp && (
        <>
          <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ bottom: 'calc(56px + 6px + max(16px, env(safe-area-inset-bottom)))', paddingTop: 'env(safe-area-inset-top)' }}>
            {tab === 'map' && <MapScreen />}
            {tab === 'groups' && <GroupsScreen />}
            {tab === 'feed' && <FeedScreen />}
            {tab === 'chats' && <ChatsScreen />}
            {tab === 'profile' && <ProfileScreen />}
          </div>
          <TabBar />
          <BoatCard />
          <MarinaSheet />
          <VisibilitySheet />
          <GroupSheets />
        </>
      )}
      <ConfirmDialog />
      <DemoPanel />
      <Toast />
      <Splash />
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
  useThemeSync();
  useEffect(() => { applyUrlFlags(); }, []);
  const { framed, scale } = useFramed();
  const dark = useApp((s) => s.dark);
  const badges = useApp((s) => s.badges);
  if (!framed) return <div className="h-dvh w-full"><PhoneApp /></div>;
  return (
    <div className="flex min-h-dvh items-center justify-center gap-16 bg-[var(--page)] p-6">
      <div className="hidden max-w-[320px] flex-col gap-4 lg:flex">
        <BrandArt tone={dark ? 'sky' : 'ocean'} className="-ml-2 w-[190px]" />
        <h1 className="text-5xl font-semibold tracking-tight text-ink">{APP.name}</h1>
        <p className="text-xl leading-snug text-muted">{APP.tagline}</p>
        {badges && <p className="mt-4 text-sm leading-relaxed text-muted">Interactive prototype. Long-press the round logo, or add <code className="rounded bg-surface/70 px-1">?demo</code> to the URL, for demo controls: scope A/B, theme, badges and the ski trip.</p>}
      </div>
      <div style={{ width: 414 * scale, height: 868 * scale }}>
        {/* The bezel is a physical phone, so it stays near-black in both themes. */}
        <div className="origin-top-left rounded-[56px] bg-[#111418] p-3 shadow-[0_30px_80px_var(--shadow-lg)] ring-1 ring-white/10" style={{ width: 414, height: 868, transform: `scale(${scale})` }}>
          <div className="h-[844px] w-[390px] overflow-hidden rounded-[44px]" style={{ transform: 'translateZ(0)' }}>
            <PhoneApp />
          </div>
        </div>
      </div>
    </div>
  );
}
