const request = require('supertest');
const jwt = require('jsonwebtoken');

const mockQuery = jest.fn();
jest.mock('../data/db', () => ({ query: mockQuery, connect: jest.fn() }));
const app = require('../appInstance');

const SECRET = process.env.JWT_SECRET || 'testsecret';
const USER_ID = '76561198267589951';
const OTHER_ID = '76561198267589952';
const token = jwt.sign({ steamId: USER_ID, username: 'Owner' }, SECRET, { expiresIn: '1h' });
const userRow = { steam_id: USER_ID, username: 'Owner', avatar: null, bio: 'Support main', region: 'EU', rank: 14000, roles: ['Support'], language: 'English', availability: ['Weekday evenings'], play_style: 'Structured', goals: 'Competitive climb', profile_visibility: 'public', recruitment_status: true, profile_completed: true };

describe('Player routes', () => {
  beforeEach(() => mockQuery.mockReset());

  it('applies discovery filters and returns pagination metadata', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ count: 1 }] }).mockResolvedValueOnce({ rows: [userRow] });
    const response = await request(app).get('/users?region=EU&role=Support&rankMin=10000&rankMax=16000&page=1')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.players[0]).toMatchObject({ steamId: USER_ID, region: 'EU', roles: ['Support'] });
    expect(response.body.pagination.total).toBe(1);
    const selectSql = mockQuery.mock.calls[1][0];
    expect(selectSql).toContain('u.region');
    expect(selectSql).toContain('ANY(u.roles)');
  });

  it('prevents editing another player profile', async () => {
    const response = await request(app).post(`/users/${OTHER_ID}/edit`)
      .set('Authorization', `Bearer ${token}`).send({ bio: 'Not mine' });
    expect(response.statusCode).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('enforces private profile visibility on the server', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ ...userRow, steam_id: OTHER_ID, profile_visibility: 'private' }] });
    const response = await request(app).get(`/users/${OTHER_ID}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(403);
    expect(response.body.code).toBe('PROFILE_PRIVATE');
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('rejects unsupported and invalid profile fields', async () => {
    const response = await request(app).patch('/users/me/profile')
      .set('Authorization', `Bearer ${token}`).send({ rank: 99999, admin: true });
    expect(response.statusCode).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('updates only whitelisted fields on the authenticated profile', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ ...userRow, bio: 'Updated brief' }] });
    const response = await request(app).patch('/users/me/profile')
      .set('Authorization', `Bearer ${token}`).send({ bio: 'Updated brief', region: 'EU' });
    expect(response.statusCode).toBe(200);
    expect(response.body.user.bio).toBe('Updated brief');
    expect(mockQuery.mock.calls[0][0]).not.toContain('admin');
    expect(mockQuery.mock.calls[0][1].at(-1)).toBe(USER_ID);
  });
});
