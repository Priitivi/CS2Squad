import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandMark, TeamEmblem } from '../components/Brand';
import { Icon } from '../components/Icon';
import { ActionLink, Avatar, Badge, RankBadge, buttonClass } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface Stats { players: number; teams: number; recruitingTeams: number }

export default function Landing() {
  const { user, loginUrl } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    api.stats(controller.signal).then(setStats).catch(() => undefined);
    return () => controller.abort();
  }, []);

  return <div className="landing">
    <section className="hero section-shell">
      <div className="hero__copy">
        <div className="eyebrow"><span className="status-light"/> Squad intelligence network</div>
        <h1>Find the teammates<br/><em>your rank deserves.</em></h1>
        <p>Stop gambling on random queues. Build a reliable five around rank, region, roles, language, and the hours you actually play.</p>
        <div className="hero__actions">{user ? <ActionLink to="/dashboard" size="lg" icon="dashboard">Open dashboard</ActionLink> : <a className={buttonClass('primary', 'lg')} href={loginUrl}><Icon name="steam"/><span>Continue with Steam</span></a>}<ActionLink to={user ? '/players' : '/login'} tone="secondary" size="lg" icon="radar">Scan players</ActionLink></div>
        <div className="security-note"><Icon name="shield" size={17}/><span>Steam verifies identity. CS2Squad never sees your Steam password.</span></div>
      </div>
      <div className="hero-console" aria-label="Preview of the CS2Squad matching interface">
        <div className="hero-console__grid"/><div className="radar-scope"><span/><span/><span/><i/></div>
        <div className="console-label"><small>Live compatibility scan</small><strong>EU WEST / PREMIER</strong></div>
        <article className="preview-player preview-player--one"><div><Avatar name="Rifler" size="md" status/><span><small>ROLE MATCH 94%</small><strong>ENTRY · RIFLER</strong></span></div><RankBadge rank={18420}/><div className="compat-line"><i style={{ width: '94%' }}/></div></article>
        <article className="preview-player preview-player--two"><div><Avatar name="Support" size="md" status/><span><small>SCHEDULE MATCH 89%</small><strong>SUPPORT · ANCHOR</strong></span></div><RankBadge rank={17280}/><div className="compat-line"><i style={{ width: '89%' }}/></div></article>
        <div className="preview-team"><TeamEmblem variant="signal" size={44}/><div><small>OPEN TEAM SIGNAL</small><strong>4 / 5 · AWP NEEDED</strong></div><Badge tone="success" dot>Recruiting</Badge></div>
      </div>
    </section>

    <section className="live-strip" aria-label="Platform statistics"><div className="section-shell live-strip__inner"><div><span>{stats ? stats.players.toLocaleString() : '—'}</span><small>Verified players</small></div><i/><div><span>{stats ? stats.teams.toLocaleString() : '—'}</span><small>Player-built teams</small></div><i/><div><span>{stats ? stats.recruitingTeams.toLocaleString() : '—'}</span><small>Teams recruiting now</small></div><i/><div><span>7 days</span><small>Secure session window</small></div></div></section>

    <section className="section-shell landing-section">
      <div className="section-heading"><div><div className="eyebrow">Built for deliberate queues</div><h2>Compatibility before chemistry.</h2></div><p>Every useful signal is visible before you send an invitation—no generic LFG wall, no guesswork.</p></div>
      <div className="feature-grid">
        {[
          ['crosshair', 'Rank without tunnel vision', 'Match within a Premier range, then inspect roles, region, and intent.'],
          ['radar', 'A schedule that overlaps', 'Filter by the windows players actually commit to, not vague “active” labels.'],
          ['team', 'Teams with a real brief', 'See line-up size, rank target, open roles, and recruitment status at a glance.'],
          ['shield', 'Invitations, not intrusions', 'Joining a roster always requires a pending invitation and player acceptance.'],
        ].map(([icon, title, text], index) => <article className="feature-panel" key={title}><span>0{index + 1}</span><Icon name={icon as 'crosshair'} size={25}/><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </section>

    <section className="landing-section landing-section--split section-shell">
      <div className="how-copy"><div className="eyebrow">Three rounds. One roster.</div><h2>From solo queue to a dependable five.</h2><p>Keep your profile honest, scan for complementary players, and build the line-up together.</p><ActionLink to={user ? '/onboarding' : '/login'} tone="secondary" icon="arrow">Build your player brief</ActionLink></div>
      <ol className="steps"><li><span>01</span><div><h3>Calibrate your profile</h3><p>Set rank, region, roles, language, schedule, style, and competitive goal.</p></div></li><li><span>02</span><div><h3>Read the signals</h3><p>Filter the directory and inspect player or team dossiers before acting.</p></div></li><li><span>03</span><div><h3>Confirm the line-up</h3><p>Captains invite. Players accept. The roster updates only after consent.</p></div></li></ol>
    </section>

    <section className="rank-section"><div className="section-shell"><div className="section-heading"><div><div className="eyebrow">Premier spectrum</div><h2>Every climb needs the right comms.</h2></div><p>Rank is a starting coordinate, not the whole player.</p></div><div className="rank-spectrum"><span>Field</span><span>Cadet</span><span>Operator</span><span>Vanguard</span><span>Elite</span><span>Master</span><span>World</span></div></div></section>

    <section className="section-shell dual-recruitment"><article><span className="dual-recruitment__index">P / 01</span><Icon name="user" size={30}/><h2>Looking for a squad?</h2><p>Publish the role you play, when you queue, and what you are building toward. Let captains find a useful fit.</p><ActionLink to={user ? '/players' : '/login'} tone="secondary">Enter player network</ActionLink></article><article><span className="dual-recruitment__index">T / 02</span><Icon name="team" size={30}/><h2>Building a line-up?</h2><p>Open a team room, define the rank window and missing roles, then send tracked invitations.</p><ActionLink to={user ? '/teams/new' : '/login'} tone="secondary">Create team room</ActionLink></article></section>

    <section className="final-cta section-shell"><BrandMark size={56}/><div><div className="eyebrow">Ready check</div><h2>Your next reliable teammate is not in a random queue.</h2></div>{user ? <ActionLink to="/dashboard" size="lg" icon="arrow">Return to command</ActionLink> : <a className={buttonClass('primary', 'lg')} href={loginUrl}><Icon name="steam"/><span>Find your five</span></a>}</section>
    <footer className="footer section-shell"><div><BrandMark size={28}/><strong>CS2Squad</strong><span>Independent team-finding platform for Counter-Strike players.</span></div><nav aria-label="Footer"><Link to="/login">Steam sign-in</Link><a href="https://store.steampowered.com/privacy_agreement/" target="_blank" rel="noreferrer">Steam privacy</a></nav><small>CS2Squad is not affiliated with Valve Corporation.</small></footer>
  </div>;
}
