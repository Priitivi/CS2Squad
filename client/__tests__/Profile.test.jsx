import React from 'react';
import { render, screen } from '@testing-library/react';
import Profile from '../components/Profile';
import '@testing-library/jest-dom';

// ✅ MOCK fetch if needed
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      steamId: '12345',
      username: 'TestUser',
      region: 'EU',
      rank: '10000',
    }),
  })
);

test('renders profile page header', async () => {
  render(<Profile />);
  const header = await screen.findByText(/Your Profile/i);
  expect(header).toBeInTheDocument();
});
