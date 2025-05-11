import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FindPlayers from '../components/FindPlayers';
import '@testing-library/jest-dom';

global.fetch = jest.fn((url) => {
  if (url.includes('/profile')) {
    return Promise.resolve({
      json: () => Promise.resolve({
        steamId: '12345',
        username: 'TestUser',
        teams: [{ name: 'Test Team' }],
      }),
    });
  }
  if (url.includes('/users')) {
    return Promise.resolve({
      json: () => Promise.resolve([
        {
          steamId: '67890',
          username: 'PlayerTwo',
          avatar: 'avatar.jpg',
          region: 'EU',
          rank: '10000',
        },
      ]),
    });
  }
});

test('renders player cards', async () => {
  render(<FindPlayers />);
  const playerCard = await screen.findByText(/PlayerTwo/i);
  expect(playerCard).toBeInTheDocument();
});
