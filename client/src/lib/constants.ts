export const REGIONS = ['EU', 'NA', 'SA', 'ASIA', 'OCE', 'AF', 'ME'] as const;
export const ROLES = ['IGL', 'Entry', 'AWPer', 'Support', 'Lurker', 'Rifler', 'Anchor'] as const;
export const AVAILABILITY = ['Weekday mornings', 'Weekday afternoons', 'Weekday evenings', 'Late nights', 'Weekends'] as const;
export const PLAY_STYLES = ['Structured', 'Aggressive', 'Methodical', 'Adaptive', 'Supportive'] as const;
export const GOALS = ['Competitive climb', 'Build a five-stack', 'League play', 'Improve fundamentals', 'Play socially'] as const;
export const EMBLEMS = ['vanguard', 'crosshair', 'shield', 'signal'] as const;
export const LANGUAGES = ['English', 'Estonian', 'Finnish', 'French', 'German', 'Polish', 'Portuguese', 'Russian', 'Spanish', 'Swedish', 'Turkish'] as const;

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  IGL: 'Calls the plan and controls the pace.',
  Entry: 'Creates space and takes first contact.',
  AWPer: 'Controls long angles with the AWP.',
  Support: 'Enables teammates with utility and trades.',
  Lurker: 'Applies map pressure away from the pack.',
  Rifler: 'Flexible rifle presence across the map.',
  Anchor: 'Holds sites and delays executes.',
};
