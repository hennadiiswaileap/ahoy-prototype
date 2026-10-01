import { Camera, Trophy, MapPin, Ellipsis, Heart, MessageSquare, Share, Search, Calendar, Utensils, Anchor, Plus, Sailboat, ChevronLeft, Phone, Send } from 'lucide-react';
import { useApp } from '../store';
import { POSTS, CHALLENGE, PORTS, CHATS, AVATAR_BG } from '../demoData';
import { Scene } from '../components/art';
import { Avatar, Badge, Button, ComingSoon, IconButton, cx } from '../components/ui';
import { avatarBg } from './MapScreen';

const useTeaser = () => {
  const toast = useApp((s) => s.showToast);
  return () => toast('Coming in a future version', 'sailboat');
};

function Head({ title, action }: { title: string; action: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-[2] flex items-center justify-between gap-2.5 bg-mist px-5 pb-2.5 pt-[18px]">
      <div className="flex items-center gap-2.5"><h1 className="text-[22px] font-semibold">{title}</h1><ComingSoon /></div>
      {action}
    </div>
  );
}

export function FeedScreen() {
  const teaser = useTeaser();
  return (
    <div className="absolute inset-0 animate-fade-in overflow-y-auto bg-mist pb-4">
      <Head title="Feed" action={<IconButton white label="New post" onClick={teaser}><Camera size={22} strokeWidth={1.75} /></IconButton>} />
      <div className="mx-4 mb-3.5 rounded-2xl bg-navy p-4 text-white">
        <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-sea-light"><Trophy size={15} />Challenge · {CHALLENGE.month}</div>
        <h3 className="mb-3 mt-1.5 text-xl font-semibold leading-snug">{CHALLENGE.title}</h3>
        <div className="mb-3.5 flex flex-col">
          {CHALLENGE.board.map((r, i) => (
            <div key={r.boat} className="flex items-center gap-3 border-b border-sea-light/20 py-2 text-[15px] last:border-b-0">
              <span className={cx('flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-semibold', i === 0 ? 'bg-signal' : 'bg-sea-light/25')}>{i + 1}</span>
              <span className="flex-1">{r.boat}<span className="block text-[13px] text-sea-light">{r.who}</span></span>
              <span className="font-semibold tabular-nums">{r.time}</span>
            </div>
          ))}
        </div>
        <Button size="md" onClick={teaser}>Join the challenge</Button>
      </div>
      {POSTS.map((p, i) => (
        <article key={i} className="mx-4 mb-3.5 overflow-hidden rounded-2xl bg-white">
          <div className="flex items-center gap-3 py-2.5 pl-3.5 pr-3">
            <Avatar initial={p.who[0]} bg={AVATAR_BG[p.bg]} />
            <span className="min-w-0 flex-1">
              <b className="flex items-center gap-1.5 font-semibold">{p.partner ? p.who : `${p.who} · ${p.boat}`}{p.partner && <Badge tone="partner">Partner</Badge>}</b>
              <span className="flex items-center gap-1 text-[13px] text-muted"><MapPin size={13} />{p.where}</span>
            </span>
            <IconButton label="More" onClick={teaser}><Ellipsis size={22} /></IconButton>
          </div>
          <div className="h-60 overflow-hidden"><Scene kind={p.scene} hull={p.hull} /></div>
          <div className="flex items-center gap-1 px-1.5 pt-1.5">
            <button onClick={teaser} aria-label="Like" className="flex h-11 items-center gap-1.5 rounded-[10px] px-2.5 text-[15px] font-semibold"><Heart size={22} strokeWidth={1.75} />{p.likes}</button>
            <button onClick={teaser} aria-label="Comment" className="flex h-11 items-center gap-1.5 rounded-[10px] px-2.5 text-[15px] font-semibold"><MessageSquare size={22} strokeWidth={1.75} />{p.comments}</button>
            <button onClick={teaser} aria-label="Share" className="ml-auto flex h-11 items-center rounded-[10px] px-2.5"><Share size={22} strokeWidth={1.75} /></button>
          </div>
          <p className="px-4 pb-4 pt-0.5 text-[15px] leading-relaxed">{p.boat && <b>{p.boat} </b>}{p.text}</p>
        </article>
      ))}
    </div>
  );
}

export function PortsScreen() {
  const teaser = useTeaser();
  return (
    <div className="absolute inset-0 animate-fade-in overflow-y-auto bg-mist pb-4">
      <Head title="Ports nearby" action={<IconButton white label="Search ports" onClick={teaser}><Search size={22} strokeWidth={1.75} /></IconButton>} />
      {PORTS.map((p) => (
        <article key={p.name} className="mx-4 mb-3.5 overflow-hidden rounded-2xl bg-white">
          <div className="relative h-32 overflow-hidden"><Scene kind={p.scene} hull={p.hull} /><Badge tone="live" className="absolute left-3 top-3 bg-white">{p.berths}</Badge></div>
          <div className="flex flex-col gap-2.5 px-4 pb-4 pt-3.5">
            <div className="flex items-baseline justify-between gap-2"><b className="text-xl font-semibold">{p.name}</b><span className="whitespace-nowrap text-sm text-muted">{p.dist}</span></div>
            <p className="text-[15px] text-muted">{p.desc}</p>
            {p.events.map((e) => (
              <div key={e.title} className="flex items-center gap-3 rounded-xl bg-mist px-3 py-2.5">
                <div className="w-11 shrink-0 text-center leading-tight"><span className="text-[11px] font-semibold uppercase text-signal">{e.dow}</span><b className="block text-lg font-semibold">{e.day}</b></div>
                <div className="flex-1 text-[15px]">{e.title}<span className="block text-[13px] text-muted">{e.when}</span></div>
                <Calendar size={18} className="text-muted" />
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {p.food.map((f) => <span key={f} className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F7FA] py-1.5 pl-2.5 pr-3 text-sm"><Utensils size={15} className="text-sea" />{f}</span>)}
            </div>
            <Button variant="secondary" size="md" onClick={teaser}><Anchor size={18} />Reserve a berth</Button>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ChatsScreen() {
  const teaser = useTeaser();
  const s = useApp();
  const open = CHATS.find((c) => c.id === s.chatId);
  return (
    <div className="absolute inset-0 animate-fade-in overflow-y-auto bg-white">
      <div className="sticky top-0 z-[2] flex items-center justify-between gap-2.5 bg-white px-5 pb-2.5 pt-[18px]">
        <div className="flex items-center gap-2.5"><h1 className="text-[22px] font-semibold">Chats</h1><ComingSoon /></div>
        <IconButton white label="New chat" onClick={teaser}><Plus size={22} strokeWidth={1.75} /></IconButton>
      </div>
      <div className="flex items-center gap-2 px-5 pb-2 pt-3 text-[13px] text-muted"><Sailboat size={15} />Boats you met on the water</div>
      {CHATS.map((c) => (
        <button key={c.id} onClick={() => s.set({ chatId: c.id })} className="flex min-h-[76px] w-full items-center gap-3 border-b border-mist bg-white px-4 py-3 text-left">
          <Avatar initial={c.first[0]} bg={avatarBg(c.personId)} ring={!!s.friends[c.personId]} />
          <span className="min-w-0 flex-1">
            <b className="flex justify-between font-semibold">{c.who}<span className="text-[13px] font-normal text-muted">{c.when}</span></b>
            <p className="truncate text-[15px] text-muted">{c.last}</p>
          </span>
          {c.unread > 0 && <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-signal px-1.5 text-xs font-semibold text-white">{c.unread}</span>}
        </button>
      ))}
      {open && (
        <div className="absolute inset-0 z-[4] flex animate-slide-in flex-col bg-mist">
          <div className="flex items-center gap-2.5 bg-white px-3 py-2.5 shadow-[0_1px_0_#DCE5EE]">
            <IconButton label="Back to chats" onClick={() => s.set({ chatId: null })}><ChevronLeft size={24} strokeWidth={1.75} /></IconButton>
            <Avatar initial={open.first[0]} bg={avatarBg(open.personId)} size={32} ring />
            <span className="flex-1"><b className="block font-semibold">{open.who}</b><span className="flex items-center gap-1.5 text-[13px] text-success"><span className="live-dot h-2 w-2 rounded-full bg-success" />{open.status}</span></span>
            <IconButton label="Call" onClick={teaser}><Phone size={22} strokeWidth={1.75} /></IconButton>
          </div>
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3.5 py-4">
            <span className="my-1 self-center rounded-full bg-white px-2.5 py-1 text-xs text-muted">Today</span>
            {open.messages.map((m, i) =>
              m.photo ? (
                <div key={i} className="w-[250px] self-start rounded-[18px] rounded-bl-md bg-white p-1">
                  <div className="h-[170px] overflow-hidden rounded-[14px]"><Scene kind="race" hull="#F4F1EA" /></div>
                  <p className="px-2.5 pb-0.5 pt-2">{m.text}<time className="mt-0.5 block text-right text-[11px] opacity-60">{m.at}</time></p>
                </div>
              ) : (
                <div key={i} className={cx('max-w-[78%] rounded-[18px] px-3.5 py-2.5 leading-snug', m.me ? 'self-end rounded-br-md bg-navy text-white' : 'self-start rounded-bl-md bg-white')}>
                  {m.text}<time className="mt-0.5 block text-right text-[11px] opacity-60">{m.at}</time>
                </div>
              ),
            )}
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2.5">
            <IconButton label="Attach photo" onClick={teaser}><Camera size={22} strokeWidth={1.75} /></IconButton>
            <button onClick={teaser} className="flex h-11 flex-1 items-center rounded-full bg-mist px-4 text-left text-[15px] text-muted">Message {open.first}…</button>
            <button onClick={teaser} aria-label="Send" className="flex h-11 w-11 items-center justify-center rounded-full bg-sea text-white"><Send size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
