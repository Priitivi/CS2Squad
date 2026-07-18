import type { SVGProps } from 'react';

export type IconName = 'arrow' | 'check' | 'chevron' | 'close' | 'crosshair' | 'dashboard' | 'external' | 'filter' | 'gear' | 'invite' | 'logout' | 'menu' | 'players' | 'plus' | 'radar' | 'search' | 'shield' | 'steam' | 'team' | 'trash' | 'user';

const paths: Record<IconName, React.ReactNode> = {
  arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
  crosshair: <><circle cx="12" cy="12" r="7"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/><circle cx="12" cy="12" r="1"/></>,
  dashboard: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></>,
  external: <><path d="M14 4h6v6"/><path d="m10 14 10-10"/><path d="M20 14v6H4V4h6"/></>,
  filter: <><path d="M4 6h16M7 12h10M10 18h4"/></>,
  gear: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  invite: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6m-3-3h6"/></>,
  logout: <><path d="M10 4H4v16h6"/><path d="M14 8l4 4-4 4m4-4H8"/></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  players: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M17 11a4 4 0 0 0 0-8m6 18v-2a4 4 0 0 0-3-3.87"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  radar: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 12 18 6M3 12h18M12 3v18"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  shield: <path d="M12 3 4 6v5c0 5 3.4 8.3 8 10 4.6-1.7 8-5 8-10V6z"/>,
  steam: <><circle cx="8" cy="16" r="3"/><circle cx="17" cy="7" r="4"/><path d="m10.5 14.5 3.3-4.4M4 14l-2-1m8.5 4.5 3.6 1.5a3 3 0 0 0 3.7-1.5l2-4.6"/></>,
  team: <><path d="M4 4h16l-2 16H6z"/><path d="m8 9 4-3 4 3-1.5 6h-5z"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
};

export function Icon({ name, size = 20, ...props }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" {...props}>{paths[name]}</svg>;
}
