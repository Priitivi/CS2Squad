import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandMark } from '../components/Brand';
import { useAuth } from '../context/AuthContext';

export default function AuthSuccess() {
  const navigate = useNavigate();
  const { completeLogin } = useAuth();
  const [message, setMessage] = useState('Verifying Steam identity');
  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    window.history.replaceState(null, '', '/auth-success');
    if (!token) { navigate('/login?error=steam_auth_failed', { replace: true }); return; }
    completeLogin(token)
      .then((profile) => navigate(profile.profileCompleted ? '/dashboard' : '/onboarding', { replace: true }))
      .catch(() => { setMessage('Secure link failed'); window.setTimeout(() => navigate('/login?error=server_error', { replace: true }), 900); });
  }, [completeLogin, navigate]);
  return <div className="route-loading route-loading--page"><BrandMark size={56}/><span/><p>{message}</p><small>Do not close this window.</small></div>;
}
