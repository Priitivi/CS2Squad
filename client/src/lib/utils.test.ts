import { describe, expect, it } from 'vitest';
import { formatRank, profileCompletion, rankTier, withQuery } from './utils';

describe('player presentation utilities', () => {
  it('assigns stable rank tiers at boundaries', () => {
    expect(rankTier(null).label).toBe('Unrated');
    expect(rankTier(4999).label).toBe('Field');
    expect(rankTier(5000).label).toBe('Cadet');
    expect(rankTier(30000).label).toBe('World');
    expect(formatRank(18420)).toBe('18,420');
  });

  it('computes profile completion from meaningful compatibility fields', () => {
    expect(profileCompletion({ region: 'EU', rank: 12000, roles: ['Support'], language: 'English', bio: 'Available evenings.' })).toBe(100);
    expect(profileCompletion({ region: 'EU', rank: null, roles: [], language: '', bio: '' })).toBe(20);
  });

  it('omits empty filter values from request URLs', () => {
    expect(withQuery('/users', { search: '', region: 'EU', recruiting: true, page: 2 })).toBe('/users?region=EU&recruiting=true&page=2');
  });
});
