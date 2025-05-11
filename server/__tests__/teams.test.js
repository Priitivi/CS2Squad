const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../appInstance');

jest.mock('../data/db', () => ({
  query: jest.fn((text, params) => {
    if (text.startsWith('INSERT INTO teams')) {
      return Promise.resolve({ rowCount: 1 });
    }
    return Promise.resolve({ rows: [] });
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

describe('Team routes', () => {
  it('should create a new team', async () => {
    const token = generateTestJWT();
    const res = await request(app)
      .post('/team/76561198267589951/create-team')
      .send({ name: 'Jest Testers' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('Team created');
  });

  it('should fail if no name is provided', async () => {
    const token = generateTestJWT();
    const res = await request(app)
      .post('/team/76561198267589951/create-team')
      .send({})
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Missing required fields');

  });
});
