import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PlayerCard } from './Cards';
import type { Player } from '../types';

const player: Player = {
  steamId: '76561198000000001', username: 'SignalOne', avatar: null,
  steamProfile: 'https://steamcommunity.com/profiles/76561198000000001',
  bio: 'Support player with structured comms.', region: 'EU', rank: 18420,
  roles: ['Support', 'Anchor'], language: 'English', availability: ['Weekday evenings'],
  playStyle: 'Structured', goals: 'Competitive climb', profileVisibility: 'public',
  recruitmentStatus: true, profileCompleted: true, currentTeam: null,
};

describe('PlayerCard', () => {
  it('surfaces compatibility details and a working invite action', () => {
    const onInvite = vi.fn();
    render(<MemoryRouter><PlayerCard player={player} onInvite={onInvite}/></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'SignalOne' })).toHaveAttribute('href', '/players/76561198000000001');
    expect(screen.getByText('18,420')).toBeInTheDocument();
    screen.getByRole('button', { name: 'Invite' }).click();
    expect(onInvite).toHaveBeenCalledWith(player);
  });

  it('labels the current player and hides self-invitation', () => {
    render(<MemoryRouter><PlayerCard player={player} ownProfile onInvite={vi.fn()}/></MemoryRouter>);
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Invite' })).not.toBeInTheDocument();
  });
});
