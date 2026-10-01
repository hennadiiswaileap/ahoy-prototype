import { type ButtonHTMLAttributes, type ReactNode, type InputHTMLAttributes, forwardRef } from 'react';
import { X } from 'lucide-react';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

type Variant = 'primary' | 'dark' | 'secondary' | 'ghost' | 'danger';
export function Button({ variant = 'primary', size = 'lg', className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'lg' | 'md' }) {
  const v: Record<Variant, string> = {
    primary: 'bg-signal text-white',
    dark: 'bg-navy text-white',
    secondary: 'bg-white text-navy ring-[1.5px] ring-inset ring-sea-light',
    ghost: 'text-sea',
    danger: 'bg-white text-[#B3261E] ring-[1.5px] ring-inset ring-[#E7C3BF]',
  };
  return (
    <button
      {...p}
      className={cx(
        'flex w-full items-center justify-center gap-2.5 rounded-full font-semibold transition active:scale-[.98] disabled:opacity-40 disabled:active:scale-100',
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
      className={cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-navy', white && 'bg-white shadow-[0_2px_10px_rgba(11,37,69,.14)]', className)}
    />
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return (
    <input
      ref={ref}
      {...p}
      className={cx('h-[52px] w-full rounded-[14px] border-[1.5px] border-line bg-white px-4 text-[17px] text-navy outline-none placeholder:text-[#9AA7B5] focus:border-sea', className)}
    />
  );
});

export function Switch({ on, onToggle, label, sub }: { on: boolean; onToggle: () => void; label: string; sub?: string }) {
  return (
    <button role="switch" aria-checked={on} onClick={onToggle} className="flex min-h-16 w-full items-center gap-3.5 text-left">
      <span className="flex-1">
        <b className="block font-semibold">{label}</b>
        {sub && <span className="text-sm text-muted">{sub}</span>}
      </span>
      <span className={cx('relative h-8 w-[52px] shrink-0 rounded-full transition-colors', on ? 'bg-success' : 'bg-[#C9D6E3]')}>
        <span className={cx('absolute left-[3px] top-[3px] h-[26px] w-[26px] rounded-full bg-white shadow transition-transform', on && 'translate-x-5')} />
      </span>
    </button>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string; icon?: ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 rounded-[14px] border-[1.5px] border-line bg-white p-1" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx('flex h-[42px] flex-1 items-center justify-center gap-1.5 rounded-[10px] text-[15px] font-semibold', value === o.value ? 'bg-navy text-white' : 'text-muted')}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Badge({ tone = 'friend', children, className }: { tone?: 'soon' | 'friend' | 'partner' | 'live'; children: ReactNode; className?: string }) {
  const t = { soon: 'bg-[#FFE6DA] text-[#A33A0F]', friend: 'bg-[#DCE9F5] text-sea', partner: 'bg-navy text-white', live: 'bg-[#DDF1E7] text-[#1E6E48]' }[tone];
  return <span className={cx('inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold', t, className)}>{children}</span>;
}

export function Avatar({ initial, bg, size = 44, ring, children, className }: { initial?: string; bg: string; size?: number; ring?: boolean; children?: ReactNode; className?: string }) {
  return (
    <span
      className={cx('relative flex shrink-0 items-center justify-center rounded-full font-semibold text-navy', ring && 'shadow-[0_0_0_2px_#fff,0_0_0_4px_var(--color-sea)]', className)}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
    >
      {children ?? initial}
    </span>
  );
}

export function Sheet({ onClose, children, title, z = 30, label }: { onClose: () => void; children: ReactNode; title?: string; z?: number; label: string }) {
  return (
    <>
      <div className="absolute inset-0 animate-fade-in bg-navy/40" style={{ zIndex: z }} onClick={onClose} />
      <div role="dialog" aria-label={label} className="absolute inset-x-0 bottom-0 flex max-h-[92%] animate-slide-up flex-col overflow-hidden rounded-t-3xl bg-white" style={{ zIndex: z + 1 }}>
        {title && (
          <div className="flex items-center justify-between py-2 pl-5 pr-3">
            <span className="text-[22px] font-semibold">{title}</span>
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
