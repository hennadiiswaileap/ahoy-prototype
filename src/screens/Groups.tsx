import { useEffect, useRef, useState } from 'react';
import {
  Users, Plus, Hash, ChevronLeft, MapPin, MapPinOff, Camera, Send, ImagePlus, Heart, MessageSquare, Copy, Share2, Lock, Check,
  Sailboat, Globe, Map as MapIcon, House, Anchor, Flag, Sun, UserPlus, CircleAlert,
} from 'lucide-react';
import { useApp, personName, placeTag, audienceText } from '../store';
import { APP } from '../config';
import type { SceneKind } from '../demoData';
import { GROUPS, SUGGESTED_REGIONS, DEMO_JOIN_CODE, ME, type Group, type GroupIcon, type GroupPost, type GroupTone, type PostAudience, type LocationAudience } from '../demoGroups';
import { PresetAvatar, Scene } from '../components/art';
import { Avatar, Badge, Button, IconButton, Input, MvpBadge, ScreenHeader, Segmented, Sheet, chromeBtn, cx } from '../components/ui';
import { clockTime, timeAgo, useBoatInfos } from '../hooks';
import { memberId } from '../sim';
import { avatarBg } from './MapScreen';

// ---------- shared bits ----------

export const GROUP_ICONS: Record<GroupIcon, typeof Users> = { sailboat: Sailboat, globe: Globe, map: MapIcon, home: House, anchor: Anchor, users: Users, flag: Flag, sun: Sun };
const TONE: Record<GroupTone, string> = {
  teak: 'bg-teak/30 text-ink',
  ocean: 'bg-ocean/15 text-ocean',
  sky: 'bg-sky/30 text-ink',
  grey: 'bg-fill text-muted',
};
const TYPE_LABEL = { private: 'Private', region: 'Region', community: 'Community' } as const;
export const memberLabel = (g: Group) => `${g.memberCount.toLocaleString('en-GB')} ${g.memberCount === 1 ? 'member' : 'members'}`;

export function GroupAvatar({ g, size = 48 }: { g: Pick<Group, 'icon' | 'tone'>; size?: number }) {
  const Icon = GROUP_ICONS[g.icon];
  return (
    <span className={cx('flex shrink-0 items-center justify-center rounded-2xl', TONE[g.tone])} style={{ width: size, height: size }}>
      <Icon size={size * 0.48} strokeWidth={1.8} />
    </span>
  );
}

function PersonAvatar({ id, size = 40 }: { id: string; size?: number }) {
  const s = useApp();
  if (id === ME) return <PresetAvatar index={s.profile.avatar} size={size} />;
  return <Avatar initial={personName(id)[0]} bg={avatarBg(id)} size={size} />;
}

/** A post shared with this group. */
export const inGroup = (p: GroupPost, gid: string) => p.audience.kind === 'groups' && p.audience.groups.includes(gid);
/** Whether the user (as a viewer) may see the post at all. */
export const canSeePost = (p: GroupPost, groups: Group[]) => p.authorId === ME || p.audience.kind === 'everyone' || p.audience.groups.some((id) => groups.some((g) => g.id === id));
/** Whether the user may see where someone else's post was taken. */
const canSeeLocation = (p: GroupPost, groups: Group[]) =>
  p.loc.kind === 'same' || (p.loc.kind === 'groups' && p.loc.groups.some((id) => groups.some((g) => g.id === id)));

/** Latest chat message or post in a group, for the groups list. */
function lastActivity(gid: string, s: ReturnType<typeof useApp.getState>) {
  const m = s.messages.filter((x) => x.groupId === gid).reduce<null | (typeof s.messages)[number]>((a, b) => (!a || b.at > a.at ? b : a), null);
  const p = s.posts.filter((x) => inGroup(x, gid)).reduce<null | GroupPost>((a, b) => (!a || b.at > a.at ? b : a), null);
  if (!m && !p) return null;
  if (m && (!p || m.at >= p.at)) return { at: m.at, text: `${m.authorId === ME ? 'You' : m.author}: ${m.photo && !m.text ? 'Photo' : m.text}` };
  return { at: p!.at, text: `${p!.authorId === ME ? 'You' : p!.author} posted: ${p!.caption}` };
}

// ---------- Groups tab ----------

export function GroupsScreen() {
  const s = useApp();
  const rows = s.groups.map((g) => ({ g, last: lastActivity(g.id, s) })).sort((a, b) => (b.last?.at ?? 0) - (a.last?.at ?? 0));
  return (
    <div className="absolute inset-0 animate-fade-in overflow-y-auto bg-background pb-4">
      <ScreenHeader title="Groups" badge={<MvpBadge />} action={
        <div className="flex items-center gap-2">
          <button onClick={() => s.set({ groupSheet: 'join' })} className={cx(chromeBtn, 'px-3.5 text-[15px] font-semibold')}><Hash size={17} />Join</button>
          <button aria-label="Create group" onClick={() => s.set({ groupSheet: 'create' })} className={cx(chromeBtn, 'w-11')}><Plus size={22} strokeWidth={1.75} /></button>
        </div>
      } />
      <div className="mx-4 mt-3.5 overflow-hidden rounded-2xl bg-surface">
        {rows.map(({ g, last }) => {
          const unread = s.unread[g.id] ?? 0;
          return (
            <button key={g.id} onClick={() => s.openGroup(g.id)} className="flex min-h-[76px] w-full items-center gap-3 border-b border-line px-3.5 py-3 text-left last:border-b-0">
              <GroupAvatar g={g} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <b className="flex min-w-0 items-center gap-1.5 font-semibold"><span className="truncate">{g.name}</span>{g.admin && <Badge tone="friend" className="h-[18px] px-1.5 text-[10px]">Admin</Badge>}</b>
                  <span className="shrink-0 text-[13px] text-muted">{last ? timeAgo(last.at) : ''}</span>
                </span>
                <span className="block text-[13px] text-muted">{TYPE_LABEL[g.type]} · {memberLabel(g)}</span>
                <span className="flex items-center justify-between gap-2">
                  <span className={cx('truncate text-[15px]', unread ? 'font-semibold text-ink' : 'text-muted')}>{last?.text ?? 'No messages yet'}</span>
                  {unread > 0 && <span className="flex h-[22px] min-w-[22px] shrink-0 items-center justify-center rounded-full bg-sky px-1.5 text-xs font-semibold text-sail">{unread}</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {s.scenario === 'sail' && <button onClick={() => s.set({ groupSheet: 'join' })} className="mx-4 mt-3.5 flex w-[calc(100%-32px)] items-center gap-3 rounded-2xl bg-ocean/10 px-4 py-3.5 text-left">
        <MapIcon size={22} className="shrink-0 text-ocean" />
        <span className="flex-1 text-[15px]"><b className="block font-semibold">You’re sailing in Kiel Fjord</b><span className="text-muted">See region groups near you, or join with a code.</span></span>
      </button>}
      {s.groupId && <GroupSpace />}
    </div>
  );
}

// ---------- group space: header, feed, chat ----------

function GroupSpace() {
  const s = useApp();
  const g = s.groups.find((x) => x.id === s.groupId);
  if (!g) return null;
  const posts = s.posts.filter((p) => inGroup(p, g.id));
  return (
    <div className="absolute inset-0 z-[4] flex animate-slide-in flex-col bg-background">
      <div className="bg-chrome px-3 pb-3 pt-2.5 text-on-chrome">
        <div className="flex items-center gap-2.5">
          <IconButton label="Back to groups" onChrome onClick={() => s.set({ groupId: null })}><ChevronLeft size={24} strokeWidth={1.75} /></IconButton>
          <GroupAvatar g={g} size={40} />
          <button className="min-w-0 flex-1 text-left" onClick={() => s.set({ groupSheet: 'members' })}>
            <b className="flex items-center gap-1.5 font-semibold"><span className="truncate">{g.name}</span><MvpBadge /></b>
            <span className="text-[13px] text-on-chrome-muted">{TYPE_LABEL[g.type]} · {memberLabel(g)}</span>
          </button>
        </div>
        <div className="mt-2.5 flex items-center gap-2 px-1">
          <div className="flex-1"><Segmented small value={s.groupTab} onChange={(t) => s.setGroupTab(t)} options={[{ value: 'feed', label: 'Feed' }, { value: 'chat', label: 'Chat' }]} /></div>
          <button onClick={() => s.showGroupOnMap(g.id)} className={cx(chromeBtn, 'rounded-[14px] px-3 text-sm font-semibold')}><MapPin size={16} />Show on map</button>
        </div>
      </div>
      {s.groupTab === 'feed' ? (
        <div className="flex-1 overflow-y-auto pb-4 pt-3.5">
          <div className="mx-4 mb-3.5">
            <Button variant="secondary" size="md" onClick={() => s.set({ groupSheet: 'compose', composeGroup: g.id })}><Camera size={18} />New post</Button>
          </div>
          {posts.map((p) => <PostCard key={p.id} p={p} />)}
          {posts.length === 0 && <p className="px-8 py-6 text-center text-[15px] text-muted">No posts yet. Share the first photo with {g.name}.</p>}
        </div>
      ) : (
        <GroupChat g={g} />
      )}
    </div>
  );
}

/** Who sees a post's location, in words. */
export function locationText(l: LocationAudience, groups: Group[]) {
  if (l.kind === 'nobody') return 'Nobody';
  if (l.kind === 'same') return 'Same as the post';
  return audienceText(l, groups);
}

export function PostCard({ p }: { p: GroupPost }) {
  const s = useApp();
  const mine = p.authorId === ME;
  const showPlace = mine ? p.loc.kind !== 'nobody' : canSeeLocation(p, s.groups);
  return (
    <article className="mx-4 mb-3.5 overflow-hidden rounded-2xl bg-surface">
      <div className="flex items-center gap-3 py-2.5 pl-3.5 pr-3">
        <PersonAvatar id={p.authorId} />
        <span className="min-w-0 flex-1">
          <b className="block truncate font-semibold">{mine ? 'You' : p.author}</b>
          <span className="flex min-w-0 items-center gap-1 text-[13px] text-muted">
            {showPlace ? <MapPin size={13} className="shrink-0" /> : mine ? <MapPinOff size={13} className="shrink-0" /> : null}
            <span className="truncate">{showPlace ? `${p.place} · ` : mine ? 'Location hidden · ' : ''}{timeAgo(p.at)}</span>
          </span>
        </span>
        <Badge tone={p.audience.kind === 'everyone' ? 'info' : 'group'} className="max-w-[45%] shrink">
          {p.audience.kind === 'everyone' ? <Globe size={12} className="shrink-0" /> : <Users size={12} className="shrink-0" />}
          <span className="truncate">{audienceText(p.audience, s.groups)}</span>
        </Badge>
      </div>
      <div className="h-56 overflow-hidden"><Scene kind={p.scene} hull={p.hull} /></div>
      <div className="flex items-center gap-1 px-1.5 pt-1.5">
        <button onClick={() => s.likePost(p.id)} aria-label={p.liked ? 'Unlike' : 'Like'} aria-pressed={!!p.liked} className="flex h-11 items-center gap-1.5 rounded-[10px] px-2.5 text-[15px] font-semibold">
          <Heart size={22} strokeWidth={1.75} className={p.liked ? 'fill-ocean text-ocean' : ''} />{p.likes}
        </button>
        <button onClick={() => s.showToast('Comments are coming in a future version', 'message')} aria-label="Comments" className="flex h-11 items-center gap-1.5 rounded-[10px] px-2.5 text-[15px] font-semibold"><MessageSquare size={22} strokeWidth={1.75} />{p.comments}</button>
      </div>
      <p className="px-4 pb-3 pt-0.5 text-[15px] leading-relaxed">{p.caption}</p>
      {mine && (
        <p className="flex items-center gap-1.5 border-t border-line px-4 py-2.5 text-[13px] text-muted">
          <MapPin size={13} className="shrink-0" />Location visible to: {locationText(p.loc, s.groups)}
        </p>
      )}
    </article>
  );
}

const PHOTOS: Record<'sail' | 'ski', SceneKind[]> = {
  sail: ['day', 'sunset', 'dawn', 'harbour', 'lighthouse', 'race'],
  ski: ['ski', 'lift', 'day', 'sunset', 'harbour', 'race'],
};

function GroupChat({ g }: { g: Group }) {
  const s = useApp();
  const [text, setText] = useState('');
  const [picker, setPicker] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const msgs = s.messages.filter((m) => m.groupId === g.id);
  const typing = s.typing?.groupId === g.id ? s.typing.name : null;
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs.length, typing]);
  const send = () => { const t = text.trim(); if (!t) return; s.sendMessage(g.id, t); setText(''); };
  return (
    <>
      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3.5 py-4">
        {msgs.map((m, i) => {
          const mine = m.authorId === ME;
          const first = i === 0 || msgs[i - 1].authorId !== m.authorId;
          return (
            <div key={m.id} className={cx('flex items-end gap-2', mine ? 'justify-end' : 'justify-start', first && i > 0 && 'mt-2')}>
              {!mine && <span className="w-8 shrink-0">{first && <PersonAvatar id={m.authorId} size={32} />}</span>}
              <div className={cx('max-w-[78%] rounded-[18px] leading-snug', mine ? 'rounded-br-md bg-accent text-on-accent' : 'rounded-bl-md bg-surface', m.photo ? 'p-1' : 'px-3.5 py-2.5')}>
                {!mine && first && <span className={cx('block text-[13px] font-semibold text-ocean', m.photo && 'px-2.5 pt-1.5')}>{m.author}</span>}
                {m.photo && <div className="h-[150px] w-[220px] overflow-hidden rounded-[14px]"><Scene kind={m.photo} /></div>}
                {(m.text || m.photo) && (
                  <p className={cx(m.photo && 'px-2.5 pb-1 pt-1.5')}>
                    {m.text}
                    <time className="mt-0.5 block text-right text-[11px] opacity-60">{clockTime(m.at)}</time>
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="mt-2 flex items-center gap-2 pl-10 text-[13px] text-muted" aria-live="polite">
            <span className="flex gap-0.5">{[0, 1, 2].map((d) => <span key={d} className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" style={{ animationDelay: `${d * 0.15}s` }} />)}</span>
            {typing} is typing
          </div>
        )}
        <div ref={end} />
      </div>
      {picker && (
        <div className="grid grid-cols-3 gap-2 bg-surface px-3 pb-1 pt-3 shadow-[0_-1px_0_var(--line)]">
          {PHOTOS[s.scenario].map((k) => (
            <button key={k} onClick={() => { s.sendMessage(g.id, '', k); setPicker(false); }} aria-label={`Send ${k} photo`} className="h-[72px] overflow-hidden rounded-xl"><Scene kind={k} /></button>
          ))}
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 bg-surface px-3 py-2.5">
        <IconButton type="button" label="Attach photo" aria-pressed={picker} onClick={() => setPicker(!picker)} className={picker ? 'text-ocean' : ''}><ImagePlus size={22} strokeWidth={1.75} /></IconButton>
        <input value={text} onChange={(e) => setText(e.target.value)} onFocus={() => setPicker(false)} placeholder={`Message ${g.name}…`} aria-label="Message" className="h-11 min-w-0 flex-1 rounded-full bg-fill px-4 text-[15px] text-ink outline-none placeholder:text-muted" />
        <button type="submit" disabled={!text.trim()} aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent disabled:opacity-40"><Send size={18} /></button>
      </form>
    </>
  );
}

// ---------- sheets ----------

/** All Scope B sheets, rendered at app level so they cover the tab bar. */
export function GroupSheets() {
  const s = useApp();
  if (s.scope !== 'b') return null;
  return (
    <>
      {s.groupSheet === 'create' && <CreateGroupSheet />}
      {s.groupSheet === 'join' && <JoinGroupSheet />}
      {s.groupSheet === 'invite' && <InviteSheet />}
      {s.groupSheet === 'members' && <MembersSheet />}
      {s.groupSheet === 'compose' && <ComposeSheet />}
      {s.addToGroupFor && <AddToGroupSheet />}
    </>
  );
}

const PICK: { icon: GroupIcon; tone: GroupTone }[] = [
  { icon: 'anchor', tone: 'teak' }, { icon: 'sailboat', tone: 'ocean' }, { icon: 'home', tone: 'sky' },
  { icon: 'users', tone: 'sky' }, { icon: 'flag', tone: 'ocean' }, { icon: 'sun', tone: 'teak' },
];

function CreateGroupSheet() {
  const s = useApp();
  const [name, setName] = useState('');
  const [pick, setPick] = useState(0);
  const close = () => s.set({ groupSheet: null });
  const create = () => {
    const id = s.createGroup(name.trim(), PICK[pick].icon, PICK[pick].tone);
    s.set({ groupSheet: 'invite', inviteFor: id });
  };
  return (
    <Sheet onClose={close} title="Create a group" label="Create a group" badge={<MvpBadge />}>
      <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-8">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Photo</span>
          <div className="flex gap-1.5">
            {PICK.map((p, i) => (
              <button key={i} aria-label={`${p.icon} picture`} aria-pressed={pick === i} onClick={() => setPick(i)} className={cx('rounded-[18px] p-[3px]', pick === i && 'shadow-[inset_0_0_0_3px_var(--select)]')}>
                <GroupAvatar g={p} size={42} />
              </button>
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-1.5"><span className="text-sm font-semibold">Group name</span><Input autoFocus placeholder="e.g. Sunday Sailors" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} /></label>
        <div className="flex items-start gap-3 rounded-2xl bg-fill px-3.5 py-3">
          <Lock size={20} className="mt-0.5 shrink-0 text-ocean" />
          <span className="text-[15px]"><b className="block font-semibold">Private group</b><span className="text-muted">Only people with your invite link or code can join. You’re the admin.</span></span>
        </div>
        <Button disabled={!name.trim()} onClick={create}>Create group</Button>
      </div>
    </Sheet>
  );
}

function InviteSheet() {
  const s = useApp();
  const g = s.groups.find((x) => x.id === s.inviteFor);
  if (!g?.code) return null;
  const link = `https://ahoy-prototype.vercel.app/join/${g.code}`;
  const copy = async (text: string, what: string) => {
    try { await navigator.clipboard.writeText(text); s.showToast(`${what} copied`, 'check'); } catch { s.showToast(`Couldn’t copy. The ${what.toLowerCase()} is ${text}`, 'info'); }
  };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: `Join ${g.name} on ${APP.name}`, text: `Join ${g.name} on ${APP.name} with code ${g.code}`, url: link }); } catch { /* cancelled */ } }
    else copy(link, 'Link');
  };
  const done = () => { s.set({ groupSheet: null, inviteFor: null }); if (!s.groupId) s.openGroup(g.id); };
  return (
    <Sheet onClose={done} title={`Invite to ${g.name}`} label={`Invite people to ${g.name}`} badge={<MvpBadge />}>
      <div className="flex flex-col gap-3.5 px-5 pb-8">
        <p className="-mt-1 text-muted">Send the link, or read out the code. Anyone with either can join.</p>
        <div className="flex items-center gap-3 rounded-2xl bg-fill px-4 py-3.5">
          <span className="flex-1"><span className="block text-[13px] text-muted">Invite code</span><b className="font-mono text-2xl font-semibold tracking-wider">{g.code}</b></span>
          <Button variant="secondary" size="md" fit onClick={() => copy(g.code!, 'Code')}><Copy size={17} />Copy</Button>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-fill px-4 py-3.5">
          <span className="min-w-0 flex-1"><span className="block text-[13px] text-muted">Invite link</span><span className="block truncate text-[15px] text-ocean">{link.replace('https://', '')}</span></span>
          <Button variant="secondary" size="md" fit onClick={() => copy(link, 'Link')}><Copy size={17} />Copy</Button>
        </div>
        <Button onClick={share}><Share2 size={20} />Share invite</Button>
        <Button variant="ghost" size="md" onClick={done}>Done</Button>
      </div>
    </Sheet>
  );
}

function JoinGroupSheet() {
  const s = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const close = () => s.set({ groupSheet: null });
  const join = () => {
    if (s.joinByCode(code)) close();
    else setError(true);
  };
  const kiel = GROUPS.find((g) => g.id === 'kiel')!;
  const regions = [kiel, ...SUGGESTED_REGIONS];
  return (
    <Sheet onClose={close} title="Join a group" label="Join a group" badge={<MvpBadge />}>
      <div className="flex flex-col gap-3 overflow-y-auto px-5 pb-8">
        <span className="text-sm font-semibold">Have an invite code?</span>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); join(); }}>
          <Input autoCapitalize="characters" placeholder="e.g. LABOE-24" aria-label="Invite code" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(false); }} className="font-mono uppercase tracking-wider" />
          <Button type="submit" fit className="px-5" disabled={!code.trim()}>Join</Button>
        </form>
        {error && <p className="flex items-start gap-1.5 text-sm text-danger" role="alert"><CircleAlert size={16} className="mt-0.5 shrink-0" />No group found with that code. Check it and try again.</p>}
        {!code && s.badges && (
          <button onClick={() => setCode(DEMO_JOIN_CODE)} className="inline-flex h-9 items-center gap-1.5 self-start rounded-full bg-ocean/12 px-3.5 text-sm font-semibold text-ink">
            <Hash size={15} className="text-ocean" />Use demo code {DEMO_JOIN_CODE}
          </button>
        )}
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold"><MapPin size={16} className="text-ocean" />You’re sailing in Kiel Fjord</div>
        <p className="-mt-1.5 text-[15px] text-muted">Region groups near you. Join to see local tips, warnings and meet-ups.</p>
        <div className="overflow-hidden rounded-2xl bg-fill">
          {regions.map((g) => {
            const joined = s.groups.some((x) => x.id === g.id);
            return (
              <div key={g.id} className="flex items-center gap-3 border-b border-line px-3.5 py-3 last:border-b-0">
                <GroupAvatar g={g} size={40} />
                <span className="min-w-0 flex-1"><b className="block truncate font-semibold">{g.name}</b><span className="text-[13px] text-muted">Region · {memberLabel(g)}</span></span>
                {joined
                  ? <span className="inline-flex items-center gap-1 text-sm font-semibold text-ocean"><Check size={16} />Joined</span>
                  : <Button size="md" fit className="h-9 text-sm" onClick={() => s.joinGroup(g)}>Join</Button>}
              </div>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}

function MembersSheet() {
  const s = useApp();
  const { boats, infos } = useBoatInfos();
  const g = s.groups.find((x) => x.id === s.groupId);
  if (!g) return null;
  const onMap = boats.filter((b) => g.members.includes(memberId(b.id)));
  const onMapIds = new Set(onMap.map((b) => memberId(b.id)));
  const ashore = g.members.filter((m) => m !== ME && !onMapIds.has(m));
  const more = g.memberCount - 1 - onMap.length - ashore.length;
  const ski = s.scenario === 'ski';
  return (
    <Sheet onClose={() => s.set({ groupSheet: null })} title={g.name} label={`${g.name} members`} badge={<MvpBadge />}>
      <div className="flex flex-col gap-3 overflow-y-auto px-5 pb-8">
        <p className="-mt-1 text-muted">{TYPE_LABEL[g.type]} · {memberLabel(g)}</p>
        {g.type === 'private' && <Button variant="secondary" size="md" onClick={() => s.set({ groupSheet: 'invite', inviteFor: g.id })}><UserPlus size={18} />Invite people</Button>}
        <div className="overflow-hidden rounded-2xl bg-fill">
          <div className="flex min-h-14 items-center gap-3 border-b border-line px-3.5 py-2.5">
            <PresetAvatar index={s.profile.avatar} size={40} />
            <span className="flex-1"><b className="block font-semibold">You</b><span className="text-[13px] text-muted">{g.admin ? 'Admin' : 'Member'}</span></span>
          </div>
          {onMap.sort((a, b) => infos[a.id].dist - infos[b.id].dist).map((b) => (
            <button key={b.id} onClick={() => s.set({ selectedId: b.id, groupSheet: null })} className="flex min-h-14 w-full items-center gap-3 border-b border-line px-3.5 py-2.5 text-left last:border-b-0">
              <Avatar initial={b.name[0]} bg={avatarBg(b.id)} size={40} />
              <span className="min-w-0 flex-1"><b className="block font-semibold">{b.name}</b><span className="block truncate text-[13px] text-muted">{b.activity ?? b.boat} · {infos[b.id].distLabel} away</span></span>
              <span className="flex items-center gap-1.5 text-[13px] text-ocean"><span className="live-dot h-2 w-2 rounded-full bg-ocean" />{ski ? 'Out' : 'On the water'}</span>
            </button>
          ))}
          {ashore.map((m) => (
            <div key={m} className="flex min-h-14 items-center gap-3 border-b border-line px-3.5 py-2.5 last:border-b-0">
              <Avatar initial={personName(m)[0]} bg={avatarBg(m)} size={40} />
              <span className="flex-1"><b className="block font-semibold">{personName(m)}</b><span className="text-[13px] text-muted">Ashore</span></span>
            </div>
          ))}
        </div>
        {more > 0 && <p className="text-center text-[15px] text-muted">and {more.toLocaleString('en-GB')} more members</p>}
      </div>
    </Sheet>
  );
}

/** Toggle chips for picking one or more of the user's groups. */
function GroupPicker({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const s = useApp();
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-0.5">
      {s.groups.map((g) => {
        const on = selected.includes(g.id);
        return (
          <button key={g.id} role="checkbox" aria-checked={on} onClick={() => onToggle(g.id)} className={cx('inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold', on ? 'bg-select text-on-select' : 'bg-surface text-ink ring-1 ring-inset ring-outline')}>
            {on && <Check size={15} strokeWidth={2.5} />}{g.name}
          </button>
        );
      })}
    </div>
  );
}

function ComposeSheet() {
  const s = useApp();
  const preset = s.composeGroup;
  const [aud, setAud] = useState<PostAudience>(preset ? { kind: 'groups', groups: [preset] } : { kind: 'everyone', groups: [] });
  const [loc, setLoc] = useState<LocationAudience>({ kind: 'nobody', groups: [] });
  const [scene, setScene] = useState<SceneKind | null>(null);
  const [caption, setCaption] = useState('');
  const close = () => s.set({ groupSheet: null, composeGroup: null });
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const audOk = aud.kind === 'everyone' || aud.groups.length > 0;
  const locOk = loc.kind !== 'groups' || loc.groups.length > 0;
  const place = placeTag(s.scenario);
  const locSummary = loc.kind === 'nobody' ? 'Nobody will see where this was taken.' : loc.kind === 'same' ? `“${place}” is shown to the same people as the post.` : `“${place}” is shown only to ${loc.groups.length ? audienceText(loc, s.groups) : 'the groups you pick'}.`;
  return (
    <Sheet onClose={close} title="New post" label="New post" badge={<MvpBadge />}>
      <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-8">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Pick a photo</span>
          <div className="grid grid-cols-3 gap-2">
            {PHOTOS[s.scenario].map((k) => (
              <button key={k} onClick={() => setScene(k)} aria-label={`${k} photo`} aria-pressed={scene === k} className={cx('relative h-[76px] overflow-hidden rounded-xl', scene === k && 'shadow-[0_0_0_3px_var(--select)]')}>
                <Scene kind={k} />
                {scene === k && <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-on-accent"><Check size={15} /></span>}
              </button>
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Caption</span>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} maxLength={280} placeholder="What’s happening on the water?" className="w-full resize-none rounded-[14px] border-[1.5px] border-line bg-surface px-4 py-3 text-[17px] text-ink outline-none placeholder:text-muted/70 focus:border-ocean" />
        </label>
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold"><Users size={16} className="text-ocean" />Who can see this post</span>
          <Segmented small value={aud.kind} onChange={(k) => setAud({ ...aud, kind: k })} options={[{ value: 'everyone', label: 'Everyone', icon: <Globe size={15} /> }, { value: 'groups', label: 'Selected groups', icon: <Users size={15} /> }]} />
          {aud.kind === 'groups' && <GroupPicker selected={aud.groups} onToggle={(id) => setAud({ ...aud, groups: toggle(aud.groups, id) })} />}
        </div>
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold"><MapPin size={16} className="text-ocean" />Who can see where it was taken</span>
          <Segmented small value={loc.kind} onChange={(k) => setLoc({ ...loc, kind: k })} options={[{ value: 'nobody', label: 'Nobody' }, { value: 'groups', label: 'Groups' }, { value: 'same', label: 'Same as post' }]} />
          {loc.kind === 'groups' && <GroupPicker selected={loc.groups} onToggle={(id) => setLoc({ ...loc, groups: toggle(loc.groups, id) })} />}
          <span className="flex items-start gap-1.5 text-[13px] text-muted">{loc.kind === 'nobody' ? <MapPinOff size={14} className="mt-px shrink-0" /> : <MapPin size={14} className="mt-px shrink-0" />}{locSummary}</span>
        </div>
        {(!audOk || !locOk) && <p className="flex items-center gap-1.5 text-sm text-danger" role="alert"><CircleAlert size={16} className="shrink-0" />Pick at least one group.</p>}
        <Button disabled={!scene || !audOk || !locOk} onClick={() => scene && s.addPost(aud, loc, scene, caption.trim())}>Post</Button>
      </div>
    </Sheet>
  );
}

function AddToGroupSheet() {
  const s = useApp();
  const pid = memberId(s.addToGroupFor!);
  const name = personName(pid);
  const mine = s.groups.filter((g) => g.type === 'private');
  const close = () => s.set({ addToGroupFor: null });
  return (
    <Sheet z={40} onClose={close} title={`Add ${name} to a group`} label={`Add ${name} to a group`} badge={<MvpBadge />}>
      <div className="flex flex-col gap-3 px-5 pb-8">
        <p className="-mt-1 text-muted">Members of your private groups get a teak ring on the map.</p>
        <div className="overflow-hidden rounded-2xl bg-fill">
          {mine.map((g) => {
            const on = g.members.includes(pid);
            return (
              <button key={g.id} role="checkbox" aria-checked={on} onClick={() => s.toggleMember(g.id, pid)} className="flex min-h-16 w-full items-center gap-3 border-b border-line px-3.5 py-3 text-left last:border-b-0">
                <GroupAvatar g={g} size={40} />
                <span className="flex-1"><b className="block font-semibold">{g.name}</b><span className="text-[13px] text-muted">{memberLabel(g)}</span></span>
                <span className={cx('flex h-6 w-6 items-center justify-center rounded-md border-2', on ? 'border-select bg-select text-on-select' : 'border-outline')}>{on && <Check size={16} strokeWidth={3} />}</span>
              </button>
            );
          })}
        </div>
        <Button variant="secondary" size="md" onClick={() => s.set({ addToGroupFor: null, groupSheet: 'create' })}><Plus size={18} />New group</Button>
        <Button onClick={close}>Done</Button>
      </div>
    </Sheet>
  );
}
