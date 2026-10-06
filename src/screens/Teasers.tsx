import { Camera, Trophy, MapPin, Ellipsis, Heart, MessageSquare, Share, Sailboat, ChevronLeft, Phone, Send, Plus } from 'lucide-react';
import { useApp } from '../store';
import { POSTS, CHALLENGE, CHATS } from '../demoData';
import { Scene } from '../components/art';
import { Avatar, Badge, Button, ComingSoon, IconButton, MvpBadge, cx } from '../components/ui';
import { avatarBg } from './MapScreen';
import { PostCard } from './Groups';

const useTeaser = () => {
  const toast = useApp((s) => s.showToast);
  return () => toast('Coming in a future version', 'sailboat');
};

function Head({ title, action, badge }: { title: string; action: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-[2] flex items-center justify-between gap-2.5 bg-background px-5 pb-2.5 pt-[18px]">
      <div className="flex items-center gap-2.5"><h1 className="text-[22px] font-semibold">{title}</h1>{badge ?? <ComingSoon />}</div>
      {action}
    </div>
  );
}

function ChallengeCard({ onJoin }: { onJoin: () => void }) {
  return (
    <div className="mx-4 mb-3.5 rounded-2xl bg-ink p-4 text-on-ink">
      <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider opacity-70"><Trophy size={15} />Challenge · {CHALLENGE.month}</div>
      <h3 className="mb-3 mt-1.5 text-xl font-semibold leading-snug">{CHALLENGE.title}</h3>
      <div className="mb-3.5 flex flex-col">
        {CHALLENGE.board.map((r, i) => (
          <div key={r.boat} className="flex items-center gap-3 border-b border-on-ink/15 py-2 text-[15px] last:border-b-0">
            <span className={cx('flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-semibold', i === 0 ? 'bg-dehler-red text-on-accent' : 'bg-on-ink/15')}>{i + 1}</span>
            <span className="flex-1">{r.boat}<span className="block text-[13px] opacity-70">{r.who}</span></span>
            <span className="font-semibold tabular-nums">{r.time}</span>
          </div>
        ))}
      </div>
      <Button size="md" onClick={onJoin}>Join the challenge</Button>
    </div>
  );
}

function TeaserPost({ p, onTap }: { p: (typeof POSTS)[number]; onTap: () => void }) {
  return (
    <article className="mx-4 mb-3.5 overflow-hidden rounded-2xl bg-surface">
      <div className="flex items-center gap-3 py-2.5 pl-3.5 pr-3">
        <Avatar initial={p.who[0]} bg={`var(--avatar-${p.bg})`} />
        <span className="min-w-0 flex-1">
          <b className="flex items-center gap-1.5 font-semibold">{p.partner ? p.who : `${p.who} · ${p.boat}`}{p.partner && <Badge tone="partner">Partner</Badge>}</b>
          <span className="flex items-center gap-1 text-[13px] text-muted"><MapPin size={13} />{p.where}</span>
        </span>
        <IconButton label="More" onClick={onTap}><Ellipsis size={22} /></IconButton>
      </div>
      <div className="h-60 overflow-hidden"><Scene kind={p.scene} hull={p.hull} /></div>
      <div className="flex items-center gap-1 px-1.5 pt-1.5">
        <button onClick={onTap} aria-label="Like" className="flex h-11 items-center gap-1.5 rounded-[10px] px-2.5 text-[15px] font-semibold"><Heart size={22} strokeWidth={1.75} />{p.likes}</button>
        <button onClick={onTap} aria-label="Comment" className="flex h-11 items-center gap-1.5 rounded-[10px] px-2.5 text-[15px] font-semibold"><MessageSquare size={22} strokeWidth={1.75} />{p.comments}</button>
        <button onClick={onTap} aria-label="Share" className="ml-auto flex h-11 items-center rounded-[10px] px-2.5"><Share size={22} strokeWidth={1.75} /></button>
      </div>
      <p className="px-4 pb-4 pt-0.5 text-[15px] leading-relaxed">{p.boat && <b>{p.boat} </b>}{p.text}</p>
    </article>
  );
}

export function FeedScreen() {
  const scope = useApp((s) => s.scope);
  return scope === 'b' ? <GroupFeed /> : <TeaserFeed />;
}

/** Scope A: the feed stays a teaser. */
function TeaserFeed() {
  const teaser = useTeaser();
  return (
    <div className="absolute inset-0 animate-fade-in overflow-y-auto bg-background pb-4">
      <Head title="Feed" action={<IconButton white label="New post" onClick={teaser}><Camera size={22} strokeWidth={1.75} /></IconButton>} />
      <ChallengeCard onJoin={teaser} />
      {POSTS.map((p, i) => <TeaserPost key={i} p={p} onTap={teaser} />)}
    </div>
  );
}

/** Scope B: posts from all the user's groups, newest first. Partner content stays a teaser. */
function GroupFeed() {
  const s = useApp();
  const teaser = useTeaser();
  const partner = POSTS.find((p) => p.partner)!;
  const posts = s.posts.filter((p) => s.groups.some((g) => g.id === p.groupId)).sort((a, b) => b.at - a.at);
  const partnerTap = () => s.showToast('Partner content is coming soon', 'info');
  return (
    <div className="absolute inset-0 animate-fade-in overflow-y-auto bg-background pb-4">
      <Head title="Feed" badge={<MvpBadge />} action={<IconButton white label="New post" onClick={() => s.set({ groupSheet: 'compose', composeGroup: null })}><Camera size={22} strokeWidth={1.75} /></IconButton>} />
      <ChallengeCard onJoin={teaser} />
      {posts.slice(0, 2).map((p) => <PostCard key={p.id} p={p} showGroup />)}
      <div className="relative">
        <TeaserPost p={partner} onTap={partnerTap} />
        <span className="pointer-events-none absolute right-7 top-[68px]"><ComingSoon /></span>
      </div>
      {posts.slice(2).map((p) => <PostCard key={p.id} p={p} showGroup />)}
    </div>
  );
}

/** Scope A: chats stay a teaser. In Scope B the Groups tab replaces them. */
export function ChatsScreen() {
  const teaser = useTeaser();
  const s = useApp();
  const open = CHATS.find((c) => c.id === s.chatId);
  return (
    <div className="absolute inset-0 animate-fade-in overflow-y-auto bg-surface">
      <div className="sticky top-0 z-[2] flex items-center justify-between gap-2.5 bg-surface px-5 pb-2.5 pt-[18px]">
        <div className="flex items-center gap-2.5"><h1 className="text-[22px] font-semibold">Chats</h1><ComingSoon /></div>
        <IconButton white label="New chat" onClick={teaser}><Plus size={22} strokeWidth={1.75} /></IconButton>
      </div>
      <div className="flex items-center gap-2 px-5 pb-2 pt-3 text-[13px] text-muted"><Sailboat size={15} />Boats you met on the water</div>
      {CHATS.map((c) => (
        <button key={c.id} onClick={() => s.set({ chatId: c.id })} className="flex min-h-[76px] w-full items-center gap-3 border-b border-line bg-surface px-4 py-3 text-left">
          <Avatar initial={c.first[0]} bg={avatarBg(c.personId)} ring={s.friends[c.personId] ? 'ocean' : false} />
          <span className="min-w-0 flex-1">
            <b className="flex justify-between font-semibold">{c.who}<span className="text-[13px] font-normal text-muted">{c.when}</span></b>
            <p className="truncate text-[15px] text-muted">{c.last}</p>
          </span>
          {c.unread > 0 && <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-dehler-red px-1.5 text-xs font-semibold text-on-accent">{c.unread}</span>}
        </button>
      ))}
      {open && (
        <div className="absolute inset-0 z-[4] flex animate-slide-in flex-col bg-background">
          <div className="flex items-center gap-2.5 bg-surface px-3 py-2.5 shadow-[0_1px_0_var(--line)]">
            <IconButton label="Back to chats" onClick={() => s.set({ chatId: null })}><ChevronLeft size={24} strokeWidth={1.75} /></IconButton>
            <Avatar initial={open.first[0]} bg={avatarBg(open.personId)} size={32} ring="ocean" />
            <span className="flex-1"><b className="block font-semibold">{open.who}</b><span className="flex items-center gap-1.5 text-[13px] text-success"><span className="live-dot h-2 w-2 rounded-full bg-success" />{open.status}</span></span>
            <IconButton label="Call" onClick={teaser}><Phone size={22} strokeWidth={1.75} /></IconButton>
          </div>
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3.5 py-4">
            <span className="my-1 self-center rounded-full bg-surface px-2.5 py-1 text-xs text-muted">Today</span>
            {open.messages.map((m, i) =>
              m.photo ? (
                <div key={i} className="w-[250px] self-start rounded-[18px] rounded-bl-md bg-surface p-1">
                  <div className="h-[170px] overflow-hidden rounded-[14px]"><Scene kind="race" hull="#F4F1EA" /></div>
                  <p className="px-2.5 pb-0.5 pt-2">{m.text}<time className="mt-0.5 block text-right text-[11px] opacity-60">{m.at}</time></p>
                </div>
              ) : (
                <div key={i} className={cx('max-w-[78%] rounded-[18px] px-3.5 py-2.5 leading-snug', m.me ? 'self-end rounded-br-md bg-ink text-on-ink' : 'self-start rounded-bl-md bg-surface')}>
                  {m.text}<time className="mt-0.5 block text-right text-[11px] opacity-60">{m.at}</time>
                </div>
              ),
            )}
          </div>
          <div className="flex items-center gap-2 bg-surface px-3 py-2.5">
            <IconButton label="Attach photo" onClick={teaser}><Camera size={22} strokeWidth={1.75} /></IconButton>
            <button onClick={teaser} className="flex h-11 flex-1 items-center rounded-full bg-fill px-4 text-left text-[15px] text-muted">Message {open.first}…</button>
            <button onClick={teaser} aria-label="Send" className="flex h-11 w-11 items-center justify-center rounded-full bg-dehler-red text-on-accent"><Send size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
