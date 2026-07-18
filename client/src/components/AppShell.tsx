import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cx } from '../lib/utils';
import { Avatar, buttonClass } from './UI';
import { Brand } from './Brand';
import { Icon, type IconName } from './Icon';

const authenticatedLinks: Array<{ to: string; label: string; icon: IconName }> = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/players', label: 'Find Players', icon: 'players' },
  { to: '/teams', label: 'Find Teams', icon: 'radar' },
  { to: '/invitations', label: 'Invitations', icon: 'invite' },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const links = user ? authenticatedLinks : [
    { to: '/players', label: 'Players', icon: 'players' as IconName },
    { to: '/teams', label: 'Teams', icon: 'radar' as IconName },
  ];
  return <>{links.map((link) => <NavLink key={link.to} to={link.to} onClick={onNavigate} className={({ isActive }) => cx('nav-link', isActive && 'is-active')}><Icon name={link.icon} size={17}/><span>{link.label}</span>{link.to === '/invitations' && Boolean(user?.pendingInvitationCount) && <b>{user?.pendingInvitationCount}</b>}</NavLink>)}</>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, status, loginUrl, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return <div className="site-shell">
    <header className="topbar">
      <div className="topbar__inner">
        <Brand/>
        <nav className="desktop-nav" aria-label="Primary navigation"><NavItems/></nav>
        <div className="topbar__actions">
          {status === 'checking' ? <span className="session-check">Checking link…</span> : user ? <>
            {user.currentTeam && <NavLink className="team-chip" to={`/teams/${user.currentTeam.id}`}><span>Current team</span><strong>{user.currentTeam.name}</strong></NavLink>}
            <NavLink className="user-chip" to="/profile"><Avatar src={user.avatar} name={user.username} size="sm" status/><span><small>Signed in</small><strong>{user.username}</strong></span></NavLink>
            <button className="icon-button desktop-only" onClick={() => logout()} aria-label="Sign out"><Icon name="logout"/></button>
          </> : <a className={cx(buttonClass('primary', 'sm'), 'desktop-only')} href={loginUrl}><Icon name="steam" size={18}/><span>Sign in</span></a>}
          <button className="icon-button menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={menuOpen}><Icon name={menuOpen ? 'close' : 'menu'}/></button>
        </div>
      </div>
    </header>
    {menuOpen && <div className="mobile-drawer"><nav aria-label="Mobile navigation"><NavItems onNavigate={() => setMenuOpen(false)}/>{user && <><NavLink className="nav-link" to="/profile"><Icon name="user" size={17}/>Profile</NavLink><NavLink className="nav-link" to="/settings"><Icon name="gear" size={17}/>Settings</NavLink><button className="nav-link" onClick={() => logout()}><Icon name="logout" size={17}/>Sign out</button></>}{!user && <a className={buttonClass('primary')} href={loginUrl}><Icon name="steam"/>Sign in with Steam</a>}</nav></div>}
    <main id="main-content" className="site-main">{children}</main>
  </div>;
}
