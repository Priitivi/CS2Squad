import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckboxPill, Button, Field, Input, PageHeader, Panel, Select } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, ApiError } from '../lib/api';
import { AVAILABILITY, GOALS, LANGUAGES, PLAY_STYLES, REGIONS, ROLE_DESCRIPTIONS, ROLES } from '../lib/constants';
import type { ProfileInput } from '../types';

export default function Onboarding() {
  const { user, refresh } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ProfileInput>({
    username: user?.username || '', bio: user?.bio || '', region: user?.region || '', rank: user?.rank || 0,
    roles: user?.roles || [], language: user?.language || '', availability: user?.availability || [],
    playStyle: user?.playStyle || '', goals: user?.goals || '', profileVisibility: user?.profileVisibility || 'public',
    recruitmentStatus: user?.recruitmentStatus ?? true,
  });

  if (!user) return null;
  const toggle = (key: 'roles' | 'availability', value: string, checked: boolean, max = 5) => setForm((current) => {
    const existing = current[key] || [];
    const next = checked ? [...new Set([...existing, value])].slice(0, max) : existing.filter((item) => item !== value);
    return { ...current, [key]: next };
  });
  const validateStep = () => {
    if (step === 1 && (!form.username?.trim() || !form.region || form.rank === undefined)) return 'Add a display name, region, and Premier rank.';
    if (step === 2 && (!form.roles?.length || !form.language || !form.availability?.length)) return 'Choose at least one role, a main language, and one availability window.';
    if (step === 3 && (!form.playStyle || !form.goals)) return 'Select a play style and competitive goal.';
    return '';
  };
  const next = () => { const issue = validateStep(); if (issue) { setError(issue); return; } setError(''); setStep((value) => Math.min(3, value + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const issue = validateStep(); if (issue) { setError(issue); return; }
    setSaving(true); setError('');
    try { await api.updateProfile(form); await refresh(); notify('Player brief synchronized.'); navigate('/dashboard'); }
    catch (reason) { setError(reason instanceof ApiError ? reason.message : 'Profile could not be saved.'); }
    finally { setSaving(false); }
  };

  return <div className="page section-shell onboarding-page">
    <PageHeader eyebrow="Player calibration" title={user.profileCompleted ? 'Update your player brief.' : 'Give the network a clear signal.'} description="Accurate details create better matches. You can revise every field later from settings."/>
    <div className="onboarding-layout"><aside className="onboarding-progress"><div className="eyebrow">Calibration sequence</div><ol>{['Identity & rank', 'Role & schedule', 'Intent & visibility'].map((label, index) => <li className={step === index + 1 ? 'is-current' : step > index + 1 ? 'is-complete' : ''} key={label}><span>{step > index + 1 ? '✓' : `0${index + 1}`}</span><div><strong>{label}</strong><small>{index === 0 ? 'Core coordinates' : index === 1 ? 'Compatibility signal' : 'Recruitment control'}</small></div></li>)}</ol><div className="progress-note"><strong>{Math.round((step / 3) * 100)}%</strong><span>Sequence progress</span></div></aside>
      <Panel className="onboarding-form"><form onSubmit={submit}>
        {step === 1 && <div className="form-step"><div className="form-step__heading"><span>01</span><div><h2>Identity and rank</h2><p>Steam provides your avatar. You control the player-facing brief.</p></div></div><div className="form-grid"><Field label="Display name" hint="2–48 characters"><Input value={form.username} maxLength={48} onChange={(event) => setForm({ ...form, username: event.target.value })}/></Field><Field label="Primary region"><Select value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })}><option value="">Select region</option>{REGIONS.map((region) => <option key={region}>{region}</option>)}</Select></Field><Field label="Premier rating" hint="Manual entry, 0–35,000" className="field--full"><div className="rank-input"><Input type="range" min="0" max="35000" step="100" value={form.rank} onChange={(event) => setForm({ ...form, rank: Number(event.target.value) })}/><Input className="rank-input__number" type="number" min="0" max="35000" value={form.rank} onChange={(event) => setForm({ ...form, rank: Number(event.target.value) })}/></div></Field><Field label="Field note" hint={`${form.bio?.length || 0}/400 · Keep it specific.`} className="field--full"><textarea className="input textarea" maxLength={400} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="What kind of teammate are you, and what should a captain know?"/></Field></div></div>}
        {step === 2 && <div className="form-step"><div className="form-step__heading"><span>02</span><div><h2>Role and schedule</h2><p>Choose up to four roles and every window you can reliably make.</p></div></div><Field label="Preferred roles" hint={`${form.roles?.length || 0}/4 selected`}><div className="choice-grid">{ROLES.map((role) => <CheckboxPill key={role} checked={form.roles?.includes(role) || false} label={role} description={ROLE_DESCRIPTIONS[role]} onChange={(checked) => toggle('roles', role, checked, 4)}/>)}</div></Field><div className="form-grid"><Field label="Main comms language"><Select value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value })}><option value="">Select language</option>{LANGUAGES.map((language) => <option key={language}>{language}</option>)}</Select></Field></div><Field label="Availability" hint="Select all reliable windows"><div className="choice-grid choice-grid--compact">{AVAILABILITY.map((window) => <CheckboxPill key={window} checked={form.availability?.includes(window) || false} label={window} onChange={(checked) => toggle('availability', window, checked)}/>)}</div></Field></div>}
        {step === 3 && <div className="form-step"><div className="form-step__heading"><span>03</span><div><h2>Intent and visibility</h2><p>Make your competitive direction and discovery preference explicit.</p></div></div><div className="form-grid"><Field label="Play style"><Select value={form.playStyle} onChange={(event) => setForm({ ...form, playStyle: event.target.value })}><option value="">Select style</option>{PLAY_STYLES.map((style) => <option key={style}>{style}</option>)}</Select></Field><Field label="Competitive goal"><Select value={form.goals} onChange={(event) => setForm({ ...form, goals: event.target.value })}><option value="">Select goal</option>{GOALS.map((goal) => <option key={goal}>{goal}</option>)}</Select></Field><Field label="Profile visibility"><Select value={form.profileVisibility} onChange={(event) => setForm({ ...form, profileVisibility: event.target.value as ProfileInput['profileVisibility'] })}><option value="public">Public to signed-in players</option><option value="members">Members only</option><option value="private">Private</option></Select></Field><Field label="Recruitment signal"><label className="toggle-row"><input type="checkbox" checked={form.recruitmentStatus} onChange={(event) => setForm({ ...form, recruitmentStatus: event.target.checked })}/><span/><div><strong>{form.recruitmentStatus ? 'Open to team invitations' : 'Not recruiting'}</strong><small>Captains see this signal in discovery.</small></div></label></Field></div></div>}
        {error && <div className="inline-alert inline-alert--error" role="alert">{error}</div>}
        <div className="form-actions">{step > 1 ? <Button type="button" tone="ghost" onClick={() => { setError(''); setStep((value) => value - 1); }}>Back</Button> : <span/>}{step < 3 ? <Button type="button" onClick={next}>Continue</Button> : <Button type="submit" disabled={saving}>{saving ? 'Synchronizing…' : 'Save player brief'}</Button>}</div>
      </form></Panel>
    </div>
  </div>;
}
