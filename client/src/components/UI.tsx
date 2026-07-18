import { useEffect, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { cx, formatRank, initials, rankTier } from '../lib/utils';
import { Icon, type IconName } from './Icon';

type Tone = 'primary' | 'secondary' | 'ghost' | 'danger';
export function buttonClass(tone: Tone = 'primary', size: 'sm' | 'md' | 'lg' = 'md') {
  return `button button--${tone} button--${size}`;
}

export function Button({ tone = 'primary', size = 'md', icon, children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: 'sm' | 'md' | 'lg'; icon?: IconName }) {
  return <button className={cx(buttonClass(tone, size), className)} {...props}>{icon && <Icon name={icon} size={17}/>}<span>{children}</span></button>;
}

export function ActionLink({ to, children, tone = 'primary', size = 'md', icon, className }: { to: string; children: ReactNode; tone?: Tone; size?: 'sm' | 'md' | 'lg'; icon?: IconName; className?: string }) {
  return <Link className={cx(buttonClass(tone, size), className)} to={to}>{icon && <Icon name={icon} size={17}/>}<span>{children}</span></Link>;
}

export function Panel({ children, className, as: Element = 'section' }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'article' }) {
  return <Element className={cx('panel', className)}>{children}</Element>;
}

export function Badge({ children, tone = 'neutral', dot = false }: { children: ReactNode; tone?: string; dot?: boolean }) {
  return <span className={`badge badge--${tone}`}>{dot && <span className="badge__dot"/>}{children}</span>;
}

export function RankBadge({ rank, compact = false }: { rank?: number | null; compact?: boolean }) {
  const tier = rankTier(rank);
  return <span className={`rank-badge rank-badge--${tier.tone}`}><span className="rank-badge__pip"/>{!compact && <small>{tier.label}</small>}<strong>{formatRank(rank)}</strong></span>;
}

export function Avatar({ src, name, size = 'md', status }: { src?: string | null; name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; status?: boolean }) {
  return <span className={`avatar avatar--${size}`}>{src ? <img src={src} alt={`${name} avatar`}/> : <span>{initials(name)}</span>}{status !== undefined && <i className={status ? 'is-online' : ''}/>}</span>;
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="page-header"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="page-header__actions">{actions}</div>}</header>;
}

export function StateView({ icon = 'radar', title, message, action, tone = 'default' }: { icon?: IconName; title: string; message: string; action?: ReactNode; tone?: 'default' | 'error' }) {
  return <div className={cx('state-view', tone === 'error' && 'state-view--error')}><span className="state-view__icon"><Icon name={icon} size={28}/></span><h2>{title}</h2><p>{message}</p>{action}</div>;
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return <div className="card-grid" aria-label="Loading results">{Array.from({ length: count }, (_, index) => <div className="panel skeleton-card" key={index}><span/><span/><span/><span/></div>)}</div>;
}

export function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return <label className={cx('field', className)}><span className="field__label">{label}</span>{children}{error ? <span className="field__error">{error}</span> : hint && <span className="field__hint">{hint}</span>}</label>;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx('input', className)} {...props}/>;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx('input select', className)} {...props}>{children}</select>;
}

export function CheckboxPill({ checked, label, onChange, description }: { checked: boolean; label: string; onChange: (checked: boolean) => void; description?: string }) {
  return <label className={cx('choice-pill', checked && 'is-selected')}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)}/><span><strong>{label}</strong>{description && <small>{description}</small>}</span><Icon name="check" size={16}/></label>;
}

export function Dialog({ open, title, description, children, onClose, danger = false }: { open: boolean; title: string; description?: string; children: ReactNode; onClose: () => void; danger?: boolean }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('has-dialog');
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('has-dialog'); };
  }, [onClose, open]);
  if (!open) return null;
  return <div className="dialog-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><section className={cx('dialog', danger && 'dialog--danger')} role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button className="icon-button dialog__close" ref={closeRef} onClick={onClose} aria-label="Close dialog"><Icon name="close"/></button><div className="eyebrow">{danger ? 'Confirmation required' : 'Command panel'}</div><h2 id="dialog-title">{title}</h2>{description && <p className="dialog__description">{description}</p>}<div className="dialog__body">{children}</div></section></div>;
}

export function PaginationNav({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages <= 1) return null;
  return <nav className="pagination" aria-label="Results pages"><Button tone="ghost" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button><span>Page <strong>{page}</strong> of {pages}</span><Button tone="ghost" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</Button></nav>;
}
