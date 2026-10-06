import { type ButtonHTMLAttributes, type ReactNode, type InputHTMLAttributes, forwardRef } from 'react';
import { X } from 'lucide-react';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

type Variant = 'primary' | 'dark' | 'secondary' | 'ghost' | 'danger';
/** `fit` sizes the button to its label instead of the full width. */
export function Button({ variant = 'primary', size = 'lg', fit, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'lg' | 'md'; fit?: boolean }) {
  const v: Record<Variant, string> = {
    primary: 'bg-dehler-red text-on-accent',
    dark: 'bg-ink text-on-ink',
    secondary: 'bg-surface text-ink ring-[1.5px] ring-inset ring-sky',
    ghost: 'text-ocean',
    danger: 'bg-surface text-danger ring-[1.5px] ring-inset ring-danger/40',
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

export function IconButton({ label, className, white, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; white?: boolean }) {
  return (
    <button
      aria-label={label}
      {...p}
      className={cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink', white && 'bg-surface shadow-[0_2px_10px_var(--shadow-sm)]', className)}
    />
  );
}

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
      <span className={cx('relative h-8 w-[52px] shrink-0 rounded-full transition-colors', on ? 'bg-success' : 'bg-sky')}>
        <span className={cx('absolute left-[3px] top-[3px] h-[26px] w-[26px] rounded-full bg-white shadow transition-transform', on && 'translate-x-5')} />
      </span>
    </button>
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
          className={cx('flex flex-1 items-center justify-center gap-1.5 rounded-[10px] font-semibold', small ? 'h-9 text-sm' : 'h-[42px] text-[15px]', value === o.value ? 'bg-ink text-on-ink' : 'text-muted')}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

type Tone = 'soon' | 'friend' | 'group' | 'partner' | 'live' | 'ok';
export function Badge({ tone = 'friend', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const t: Record<Tone, string> = {
    soon: 'bg-teak/15 text-ink',
    friend: 'bg-ocean/12 text-ink',
    group: 'bg-teak/15 text-ink ring-1 ring-inset ring-teak/45',
    partner: 'bg-ink text-on-ink',
    live: 'bg-dehler-red text-on-accent',
    ok: 'bg-success/15 text-ink',
  };
  return <span className={cx('inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold', t[tone], className)}>{children}</span>;
}

/** Marks every Scope B (MVP+) screen and entry point. */
export function MvpBadge({ className }: { className?: string }) {
  return <span className={cx('inline-flex h-[18px] shrink-0 items-center rounded-full bg-teak/15 px-1.5 text-[10px] font-bold leading-none tracking-wide text-ink ring-1 ring-inset ring-teak/60', className)}>MVP+</span>;
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

export function ComingSoon() {
  return <Badge tone="soon">Coming soon</Badge>;
}

export { cx };
