import { useLocation, useSearchParams } from 'react-router-dom';
import { BrandMark } from '../components/Brand';
import { Icon } from '../components/Icon';
import { ActionLink, buttonClass } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const errors: Record<string, string> = {
  steam_auth_failed: 'Steam could not verify this sign-in. No account changes were made.',
  server_misconfigured: 'Authentication is temporarily unavailable. The service configuration needs attention.',
  server_error: 'The sign-in callback could not be completed. Please try again.',
};

export default function Login() {
  const { loginUrl, status } = useAuth();
  const [params] = useSearchParams();
  const location = useLocation();
  const authError = params.get('error');
  const expired = status === 'expired' || Boolean((location.state as { expired?: boolean } | null)?.expired);
  return <div className="auth-page section-shell"><section className="auth-card panel"><div className="auth-card__mark"><BrandMark size={54}/><span>Secure Steam link</span></div><div className="eyebrow">Identity checkpoint</div><h1>{expired ? 'Your session expired.' : 'Enter the squad network.'}</h1><p>{expired ? 'For your security, seven-day sessions require a fresh Steam verification.' : 'CS2Squad uses Steam OpenID to confirm that every player profile belongs to a real Steam account.'}</p>{authError && <div className="inline-alert inline-alert--error"><Icon name="shield"/><span>{errors[authError] || 'Authentication failed. Please try again.'}</span></div>}<a className={buttonClass('primary', 'lg')} href={loginUrl}><Icon name="steam"/><span>Continue with Steam</span></a><ul className="security-list"><li><Icon name="check"/>Your password stays with Steam</li><li><Icon name="check"/>Only your public Steam identity is imported</li><li><Icon name="check"/>You can sign out locally at any time</li></ul><ActionLink to="/" tone="ghost" size="sm">Back to overview</ActionLink></section><aside className="auth-aside"><div className="radar-scope radar-scope--large"><span/><span/><span/><i/></div><blockquote>“Reliable comms start with reliable identities.”</blockquote><p>Steam verification limits impersonation while keeping sign-in fast.</p></aside></div>;
}
