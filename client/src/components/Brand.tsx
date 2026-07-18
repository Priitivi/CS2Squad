import { Link } from 'react-router-dom';
import { cx } from '../lib/utils';

export function BrandMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg className={cx('brand-mark', className)} aria-hidden="true" width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M5 4h30v10l-7 6 7 6v10H5V26l7-6-7-6V4Z" fill="currentColor" opacity=".2"/>
      <path d="M8 7h24v6l-8 7 8 7v6H8v-6l8-7-8-7V7Z" stroke="currentColor" strokeWidth="2"/>
      <path d="m13 12 7 5 7-5M13 28l7-5 7 5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="20" cy="20" r="2" fill="currentColor"/>
    </svg>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" to="/" aria-label="CS2Squad home">
      <BrandMark />
      {!compact && <span className="brand__word">CS2<span>Squad</span></span>}
    </Link>
  );
}

export function TeamEmblem({ variant = 'vanguard', size = 52 }: { variant?: string; size?: number }) {
  const glyph = variant === 'crosshair' ? '⊕' : variant === 'shield' ? '◇' : variant === 'signal' ? '⌁' : 'V';
  return <span className={`team-emblem team-emblem--${variant}`} style={{ width: size, height: size }} aria-hidden="true">{glyph}</span>;
}
