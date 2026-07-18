import { ActionLink, StateView } from '../components/UI';

export default function NotFound() {
  return <div className="section-shell standalone-state"><StateView icon="radar" title="Coordinate not found" message="This route is outside the current operation area." action={<ActionLink to="/">Return to base</ActionLink>}/></div>;
}
