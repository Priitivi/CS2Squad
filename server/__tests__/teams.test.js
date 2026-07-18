const request = require('supertest');
const jwt = require('jsonwebtoken');

const mockQuery = jest.fn();
jest.mock('../data/db', () => ({ query: mockQuery, connect: jest.fn() }));
const app = require('../appInstance');

const SECRET = process.env.JWT_SECRET || 'testsecret';
const OWNER_ID = '76561198267589951';
const OTHER_ID = '76561198267589952';
const tokenFor = (steamId = OWNER_ID) => jwt.sign({ steamId, username: 'TestUser' }, SECRET, { expiresIn: '1h' });

const teamRow = {
  id: 7, owner_id: OWNER_ID, name: 'Jest Testers', description: 'Structured tests.',
  region: 'EU', rank_min: 10000, rank_max: 16000, open_roles: ['Support'],
  recruiting: true, emblem: 'vanguard', members: [], member_count: 1,
};

describe('Team routes', () => {
  beforeEach(() => mockQuery.mockReset());

  it('protects team creation', async () => {
    const response = await request(app).post('/team').send({ name: 'No token' });
    expect(response.statusCode).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('creates a validated team for the authenticated owner', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [teamRow] });
    const response = await request(app).post('/team')
      .set('Authorization', `Bearer ${tokenFor()}`)
      .send({ name: teamRow.name, region: 'EU', rankMin: 10000, rankMax: 16000, openRoles: ['Support'] });
    expect(response.statusCode).toBe(201);
    expect(response.body.team).toMatchObject({ id: 7, ownerId: OWNER_ID, name: teamRow.name });
    expect(mockQuery.mock.calls[0][1][1]).toBe(OWNER_ID);
  });

  it('rejects missing names and inverted rank ranges before querying', async () => {
    const noName = await request(app).post('/team').set('Authorization', `Bearer ${tokenFor()}`).send({});
    const inverted = await request(app).post('/team').set('Authorization', `Bearer ${tokenFor()}`).send({ name: 'Wrong Range', rankMin: 20000, rankMax: 10000 });
    expect(noName.statusCode).toBe(400);
    expect(inverted.statusCode).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('blocks legacy team creation for a different Steam ID', async () => {
    const response = await request(app).post(`/team/${OTHER_ID}/create-team`)
      .set('Authorization', `Bearer ${tokenFor()}`).send({ name: 'Spoofed' });
    expect(response.statusCode).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('does not update a team the player does not own', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const response = await request(app).patch('/team/7')
      .set('Authorization', `Bearer ${tokenFor(OTHER_ID)}`).send({ description: 'Hijacked' });
    expect(response.statusCode).toBe(404);
    expect(mockQuery.mock.calls[0][1].at(-1)).toBe(OTHER_ID);
  });

  it('normalizes every team member identifier to a string', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ ...teamRow, members: [12345, OTHER_ID], member_count: 3, owner_name: 'Captain' }] })
      .mockResolvedValueOnce({ rows: [] });
    const response = await request(app).get('/team/7').set('Authorization', `Bearer ${tokenFor()}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.memberIds).toEqual(['12345', OTHER_ID]);
    expect(response.body.viewerRole).toBe('owner');
  });
});
