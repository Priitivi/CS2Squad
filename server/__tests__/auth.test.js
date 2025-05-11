const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = require('../appInstance');

// Mock db and override its query method
jest.mock('../data/db', () => ({
  query: jest.fn((text, params) => {
    if (text.includes('SELECT * FROM users')) {
      return Promise.resolve({
        rows: [{
          steam_id: params[0],
          username: 'TestUser',
          avatar: 'https://test.com/avatar.jpg',
          region: 'EU',
          rank: '14100',
          roles: [],
          availability: [],
        }],
      });
    }
    if (text.includes('SELECT id, name, members')) {
      return Promise.resolve({ rows: [] });
    }
    return Promise.resolve({ rows: [{ now: new Date().toISOString() }] });
  }),
}));

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtstringhere';

function generateTestJWT() {
  return jwt.sign(
    { steamId: '76561198267589951', username: 'TestUser' },
    TEST_JWT_SECRET,
    { expiresIn: '1h' }
  );
}

describe('Auth routes', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/profile');
    expect(res.statusCode).toBe(401);
  });

  it('should return user data with valid token', async () => {
    const token = generateTestJWT();
    const res = await request(app)
      .get('/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('steamId');
    expect(res.body).toHaveProperty('username');
  });
});
