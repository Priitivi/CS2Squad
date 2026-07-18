import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { BrandMark } from './components/Brand';
import { useAuth } from './context/AuthContext';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const AuthSuccess = lazy(() => import('./pages/AuthSuccess'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const FindPlayers = lazy(() => import('./pages/FindPlayers'));
const PlayerProfile = lazy(() => import('./pages/PlayerProfile'));
const FindTeams = lazy(() => import('./pages/FindTeams'));
const TeamProfile = lazy(() => import('./pages/TeamProfile'));
const TeamEditor = lazy(() => import('./pages/TeamEditor'));
const Invitations = lazy(() => import('./pages/Invitations'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function LoadingScreen() {
  return <div className="route-loading"><BrandMark size={48}/><span/><p>Establishing secure link</p></div>;
}

function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'checking') return <LoadingScreen/>;
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location.pathname, expired: status === 'expired' }}/>;
  return <Outlet/>;
}

export default function App() {
  return <AppShell><Suspense fallback={<LoadingScreen/>}><Routes>
    <Route path="/" element={<Landing/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/auth-success" element={<AuthSuccess/>}/>
    <Route element={<ProtectedRoute/>}>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="/onboarding" element={<Onboarding/>}/>
      <Route path="/players" element={<FindPlayers/>}/>
      <Route path="/players/:steamId" element={<PlayerProfile/>}/>
      <Route path="/profile" element={<PlayerProfile own/>}/>
      <Route path="/teams" element={<FindTeams/>}/>
      <Route path="/teams/new" element={<TeamEditor/>}/>
      <Route path="/teams/:teamId" element={<TeamProfile/>}/>
      <Route path="/teams/:teamId/manage" element={<TeamEditor manage/>}/>
      <Route path="/invitations" element={<Invitations/>}/>
      <Route path="/settings" element={<Settings/>}/>
    </Route>
    <Route path="*" element={<NotFound/>}/>
  </Routes></Suspense></AppShell>;
}
