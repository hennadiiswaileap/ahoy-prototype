import { type ButtonHTMLAttributes, type ReactNode, type InputHTMLAttributes, forwardRef } from 'react';
import { X, Clock } from 'lucide-react';
import { useApp } from '../store';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/** primary: Ocean (the CTA colour). danger: Red, destructive actions only. dark: inverse, used sparingly. */
type Variant = 'primary' | 'dark' | 'secondary' | 'ghost' | 'danger';
/** `fit` sizes the button to its label instead of the full width. */
export function Button({ variant = 'primary', size = 'lg', fit, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'lg' | 'md'; fit?: boolean }) {
  const v: Record<Variant, string> = {
    primary: 'bg-accent text-on-accent',
    dark: 'bg-ink text-on-ink',
    secondary: 'bg-surface text-ink ring-[1.5px] ring-inset ring-outline',
    ghost: 'text-ocean',
    danger: 'bg-red text-white',
  };
  return (
    <button
      {...p}
      className={cx(
        'flex items-center justify-center gap-2.5 rounded-full font-semibold transition active:scale-[.98] disabled:opacity-40 disabled:active:scale-100',
        fit ? 'shrink-0 px-4' : 'w-full',
        size === 'lg' ? 'h-[52px] text-base' : 'h-11 text-[15px]',
        v[variant],
        className,
      )}
    />
  );
}

/** `onChrome` is for the near-black header bar (white icon). */
export function IconButton({ label, className, white, onChrome, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; white?: boolean; onChrome?: boolean }) {
  return (
    <button
      aria-label={label}
      {...p}
      className={cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-full', onChrome ? 'text-on-chrome' : 'text-ink', white && 'bg-surface shadow-[0_2px_10px_var(--shadow-sm)]', className)}
    />
  );
}

/** Round button on the near-black header bar. */
export const chromeBtn = 'flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-white/12 text-on-chrome';

/** Near-black header bar for app screens (the spec's "dark chrome"). */
export function ScreenHeader({ title, badge, action, back }: { title: string; badge?: ReactNode; action?: ReactNode; back?: () => void }) {
  return (
    <div className="sticky top-0 z-[2] flex min-h-[64px] items-center justify-between gap-2.5 bg-chrome px-4 py-2.5 text-on-chrome">
      <div className="flex min-w-0 items-center gap-2">
        {back && <button aria-label="Back" onClick={back} className={cx(chromeBtn, '-ml-1 w-11 bg-transparent')}><ChevronBack /></button>}
        <h1 className="truncate pl-1 text-[22px] font-semibold">{title}</h1>
        {badge}
      </div>
      {action}
    </div>
  );
}
const ChevronBack = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>;

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return (
    <input
      ref={ref}
      {...p}
      className={cx('h-[52px] w-full rounded-[14px] border-[1.5px] border-line bg-surface px-4 text-[17px] text-ink outline-none placeholder:text-muted/70 focus:border-ocean', className)}
    />
  );
});

export function Switch({ on, onToggle, label, sub, disabled }: { on: boolean; onToggle: () => void; label: string; sub?: string; disabled?: boolean }) {
  return (
    <button role="switch" aria-checked={on} disabled={disabled} onClick={onToggle} className="flex min-h-16 w-full items-center gap-3.5 text-left disabled:opacity-45">
      <span className="flex-1">
        <b className="block font-semibold">{label}</b>
        {sub && <span className="text-sm text-muted">{sub}</span>}
      </span>
      <SwitchTrack on={on} />
    </button>
  );
}

/** The track and knob; the knob position (not only colour) shows the state. */
export function SwitchTrack({ on, small }: { on: boolean; small?: boolean }) {
  return (
    <span className={cx('relative shrink-0 rounded-full transition-colors', small ? 'h-6 w-10' : 'h-8 w-[52px]', on ? 'bg-accent' : 'bg-outline')}>
      <span className={cx('absolute left-[3px] top-[3px] rounded-full bg-white shadow transition-transform', small ? 'h-[18px] w-[18px]' : 'h-[26px] w-[26px]', on && (small ? 'translate-x-4' : 'translate-x-5'))} />
    </span>
  );
}

export function Segmented<T extends string>({ options, value, onChange, small }: { options: { value: T; label: string; icon?: ReactNode }[]; value: T; onChange: (v: T) => void; small?: boolean }) {
  return (
    <div className="flex gap-1 rounded-[14px] border-[1.5px] border-line bg-surface p-1" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx('flex flex-1 items-center justify-center gap-1.5 rounded-[10px] font-semibold', small ? 'h-9 text-sm' : 'h-[42px] text-[15px]', value === o.value ? 'bg-select text-on-select' : 'text-muted')}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Every tone carries text (and often an icon), so meaning never rests on colour alone. */
type Tone = 'soon' | 'friend' | 'group' | 'partner' | 'live' | 'ok' | 'info';
export function Badge({ tone = 'friend', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const t: Record<Tone, string> = {
    soon: 'bg-boat text-sail ring-1 ring-inset ring-sail/15',
    friend: 'bg-ocean/15 text-ink',
    group: 'bg-teak/25 text-ink ring-1 ring-inset ring-teak',
    partner: 'bg-teak text-sail',
    live: 'bg-sky text-sail',
    ok: 'bg-ocean/15 text-ink',
    info: 'bg-fill text-muted',
  };
  return <span className={cx('inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold', t[tone], className)}>{children}</span>;
}

/** Marks every Scope B (MVP+) screen and entry point. Hidden in focus-group mode (?badges=off). */
export function MvpBadge({ className }: { className?: string }) {
  const show = useApp((s) => s.badges);
  if (!show) return null;
  return <span className={cx('inline-flex h-[18px] shrink-0 items-center rounded-[5px] bg-sky px-1.5 text-[10px] font-bold leading-none tracking-wide text-sail', className)}>MVP+</span>;
}

export function ComingSoon() {
  const show = useApp((s) => s.badges);
  if (!show) return null;
  return <Badge tone="soon"><Clock size={12} strokeWidth={2.2} />Coming soon</Badge>;
}

export function Avatar({ initial, bg, size = 44, ring, children, className }: { initial?: string; bg: string; size?: number; ring?: 'ocean' | 'teak' | false; children?: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'relative flex shrink-0 items-center justify-center rounded-full font-semibold text-ink',
        ring === 'ocean' && 'shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--ocean)]',
        ring === 'teak' && 'shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--teak)]',
        className,
      )}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
    >
      {children ?? initial}
    </span>
  );
}

export function Sheet({ onClose, children, title, z = 30, label, badge }: { onClose: () => void; children: ReactNode; title?: string; z?: number; label: string; badge?: ReactNode }) {
  return (
    <>
      <div className="absolute inset-0 animate-fade-in bg-[var(--scrim)]" style={{ zIndex: z }} onClick={onClose} />
      <div role="dialog" aria-label={label} className="absolute inset-x-0 bottom-0 flex max-h-[92%] animate-slide-up flex-col overflow-hidden rounded-t-3xl bg-surface text-ink" style={{ zIndex: z + 1 }}>
        {title && (
          <div className="flex items-center justify-between gap-2 py-2 pl-5 pr-3">
            <span className="flex min-w-0 items-center gap-2"><span className="truncate text-[22px] font-semibold">{title}</span>{badge}</span>
            <IconButton label="Close" onClick={onClose}><X size={22} strokeWidth={1.75} /></IconButton>
          </div>
        )}
        {children}
      </div>
    </>
  );
}

export { cx };
