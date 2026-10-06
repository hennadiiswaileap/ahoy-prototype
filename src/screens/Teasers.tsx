import { Camera, Trophy, MapPin, Ellipsis, Heart, MessageSquare, Share, Sailboat, ChevronLeft, Phone, Send, Plus, Handshake } from 'lucide-react';
import { useApp } from '../store';
import { POSTS, CHALLENGE, CHATS } from '../demoData';
import { Scene } from '../components/art';
import { Avatar, Badge, Button, ComingSoon, IconButton, MvpBadge, ScreenHeader, chromeBtn, cx } from '../components/ui';
import { useBoatInfos } from '../hooks';
import { memberId, unitMetres } from '../sim';
import { avatarBg } from './MapScreen';
import { PostCard, canSeePost, inGroup } from './Groups';

const useTeaser = () => {
  const toast = useApp((s) => s.showToast);
  return () => toast('Coming in a future version', 'sailboat');
};

function Head({ title, action, badge }: { title: string; action: React.ReactNode; badge?: React.ReactNode }) {
  return <ScreenHeader title={title} badge={badge ?? <ComingSoon />} action={action} />;
}
const HeadButton = ({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) => (
  <button aria-label={label} onClick={onClick} className={cx(chromeBtn, 'w-11')}>{children}</button>
);

function ChallengeCard({ onJoin }: { onJoin: () => void }) {
  return (
    <div className="mx-4 mb-3.5 rounded-2xl bg-accent p-4 text-white">
      <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider opacity-70"><Trophy size={15} />Challenge · {CHALLENGE.month}</div>
      <h3 className="mb-3 mt-1.5 text-xl font-semibold leading-snug">{CHALLENGE.title}</h3>
      <div className="mb-3.5 flex flex-col">
        {CHALLENGE.board.map((r, i) => (
          <div key={r.boat} className="flex items-center gap-3 border-b border-white/20 py-2 text-[15px] last:border-b-0">
            <span className={cx('flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-semibold', i === 0 ? 'bg-sky text-sail' : 'bg-white/20')}>{i + 1}</span>
            <span className="flex-1">{r.boat}<span className="block text-[13px] opacity-80">{r.who}</span></span>
            <span className="font-semibold tabular-nums">{r.time}</span>
          </div>
        ))}
      </div>
      <Button variant="secondary" size="md" onClick={onJoin}>Join the challenge</Button>
    </div>
  );
}

function TeaserPost({ p, onTap }: { p: (typeof POSTS)[number]; onTap: () => void }) {
  return (
    <article className="mx-4 mb-3.5 overflow-hidden rounded-2xl bg-surface">
      <div className="flex items-center gap-3 py-2.5 pl-3.5 pr-3">
        <Avatar initial={p.who[0]} bg={`var(--avatar-${p.bg})`} />
        <span className="min-w-0 flex-1">
          <b className="flex items-center gap-1.5 font-semibold">{p.partner ? p.who : `${p.who} · ${p.boat}`}{p.partner && <Badge tone="partner"><Handshake size={13} />Partner</Badge>}</b>
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
      <Head title="Feed" action={<HeadButton label="New post" onClick={teaser}><Camera size={22} strokeWidth={1.75} /></HeadButton>} />
      <div className="h-3.5" />
      <ChallengeCard onJoin={teaser} />
      {POSTS.map((p, i) => <TeaserPost key={i} p={p} onTap={teaser} />)}
    </div>
  );
}

/** Scope B: posts the user may see, newest first, with All / Nearby / group filters. Partner content stays a teaser. */
function GroupFeed() {
  const s = useApp();
  const teaser = useTeaser();
  const { boats, infos, unit } = useBoatInfos();
  const partner = POSTS.find((p) => p.partner)!;
  const filter = s.feedFilter === 'all' || s.feedFilter === 'nearby' || s.groups.some((g) => g.id === s.feedFilter) ? s.feedFilter : 'all';
  const near = new Set(boats.filter((b) => infos[b.id].dist <= s.radius * unitMetres(unit)).map((b) => memberId(b.id)));
  const posts = s.posts
    .filter((p) => canSeePost(p, s.groups))
    .filter((p) => filter === 'all' || (filter === 'nearby' ? near.has(p.authorId) : inGroup(p, filter)))
    .sort((a, b) => b.at - a.at);
  const partnerTap = () => s.showToast('Partner content is coming soon', 'info');
  const chips = [{ id: 'all', name: 'All' }, { id: 'nearby', name: 'Nearby' }, ...s.groups.map((g) => ({ id: g.id, name: g.name }))];
  return (
    <div className="absolute inset-0 animate-fade-in overflow-y-auto bg-background pb-4">
      <Head title="Feed" badge={<MvpBadge />} action={<HeadButton label="New post" onClick={() => s.set({ groupSheet: 'compose', composeGroup: null })}><Camera size={22} strokeWidth={1.75} /></HeadButton>} />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 pt-3" role="radiogroup" aria-label="Show posts from">
        {chips.map((c) => (
          <button key={c.id} role="radio" aria-checked={filter === c.id} onClick={() => s.set({ feedFilter: c.id })} className={cx('inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold', filter === c.id ? 'bg-select text-on-select' : 'bg-surface text-ink ring-1 ring-inset ring-outline')}>
            {c.id === 'nearby' && <MapPin size={14} />}{c.name}
          </button>
        ))}
      </div>
      {filter === 'all' && <ChallengeCard onJoin={teaser} />}
      {posts.slice(0, 2).map((p) => <PostCard key={p.id} p={p} />)}
      {filter === 'all' && (
        <div className="relative">
          <TeaserPost p={partner} onTap={partnerTap} />
          <span className="pointer-events-none absolute right-7 top-[68px]"><ComingSoon /></span>
        </div>
      )}
      {posts.slice(2).map((p) => <PostCard key={p.id} p={p} />)}
      {posts.length === 0 && <p className="px-8 py-8 text-center text-[15px] text-muted">{filter === 'nearby' ? `No posts from people within ${s.radius} ${unit} right now.` : 'No posts here yet.'}</p>}
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
      <Head title="Chats" action={<HeadButton label="New chat" onClick={teaser}><Plus size={22} strokeWidth={1.75} /></HeadButton>} />
      <div className="flex items-center gap-2 px-5 pb-2 pt-3 text-[13px] text-muted"><Sailboat size={15} />Boats you met on the water</div>
      {CHATS.map((c) => (
        <button key={c.id} onClick={() => s.set({ chatId: c.id })} className="flex min-h-[76px] w-full items-center gap-3 border-b border-line bg-surface px-4 py-3 text-left">
          <Avatar initial={c.first[0]} bg={avatarBg(c.personId)} ring={s.friends[c.personId] ? 'teak' : false} />
          <span className="min-w-0 flex-1">
            <b className="flex justify-between font-semibold">{c.who}<span className="text-[13px] font-normal text-muted">{c.when}</span></b>
            <p className="truncate text-[15px] text-muted">{c.last}</p>
          </span>
          {c.unread > 0 && <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-sky px-1.5 text-xs font-semibold text-sail">{c.unread}</span>}
        </button>
      ))}
      {open && (
        <div className="absolute inset-0 z-[4] flex animate-slide-in flex-col bg-background">
          <div className="flex items-center gap-2.5 bg-chrome px-3 py-2.5 text-on-chrome">
            <IconButton label="Back to chats" onChrome onClick={() => s.set({ chatId: null })}><ChevronLeft size={24} strokeWidth={1.75} /></IconButton>
            <Avatar initial={open.first[0]} bg={avatarBg(open.personId)} size={32} />
            <span className="flex-1"><b className="block font-semibold">{open.who}</b><span className="flex items-center gap-1.5 text-[13px] text-sky"><span className="live-dot h-2 w-2 rounded-full bg-sky" />{open.status}</span></span>
            <IconButton label="Call" onChrome onClick={teaser}><Phone size={22} strokeWidth={1.75} /></IconButton>
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
                <div key={i} className={cx('max-w-[78%] rounded-[18px] px-3.5 py-2.5 leading-snug', m.me ? 'self-end rounded-br-md bg-accent text-on-accent' : 'self-start rounded-bl-md bg-surface')}>
                  {m.text}<time className="mt-0.5 block text-right text-[11px] opacity-60">{m.at}</time>
                </div>
              ),
            )}
          </div>
          <div className="flex items-center gap-2 bg-surface px-3 py-2.5">
            <IconButton label="Attach photo" onClick={teaser}><Camera size={22} strokeWidth={1.75} /></IconButton>
            <button onClick={teaser} className="flex h-11 flex-1 items-center rounded-full bg-fill px-4 text-left text-[15px] text-muted">Message {open.first}…</button>
            <button onClick={teaser} aria-label="Send" className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-on-accent"><Send size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
