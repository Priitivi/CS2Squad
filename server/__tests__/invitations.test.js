const request = require('supertest');
const jwt = require('jsonwebtoken');

const mockQuery = jest.fn();
const mockConnect = jest.fn();
jest.mock('../data/db', () => ({ query: mockQuery, connect: mockConnect }));
const app = require('../appInstance');

const SECRET = process.env.JWT_SECRET || 'testsecret';
const OWNER_ID = '76561198267589951';
const PLAYER_ID = '76561198267589952';
const tokenFor = (steamId) => jwt.sign({ steamId, username: 'Player' }, SECRET, { expiresIn: '1h' });
const team = { id: 9, owner_id: OWNER_ID, name: 'Northline', members: [], recruiting: true };

describe('Invitation workflow', () => {
  beforeEach(() => { mockQuery.mockReset(); mockConnect.mockReset(); });

  it('rejects self-invitations without touching the database', async () => {
    const response = await request(app).post('/team/9/invitations')
      .set('Authorization', `Bearer ${tokenFor(OWNER_ID)}`).send({ recipientId: OWNER_ID });
    expect(response.statusCode).toBe(400);
    expect(response.body.code).toBe('SELF_INVITE');
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('creates a pending invitation without adding a team member', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [team] })
      .mockResolvedValueOnce({ rows: [{ steam_id: PLAYER_ID }] })
      .mockResolvedValueOnce({ rows: [{ id: 12, status: 'pending', created_at: new Date().toISOString() }] });
    const response = await request(app).post('/team/9/invitations')
      .set('Authorization', `Bearer ${tokenFor(OWNER_ID)}`).send({ recipientId: PLAYER_ID });
    expect(response.statusCode).toBe(201);
    expect(response.body.invitation).toMatchObject({ id: 12, status: 'pending', recipientId: PLAYER_ID });
    expect(mockQuery.mock.calls.some(([sql]) => sql.includes('UPDATE teams'))).toBe(false);
  });

  it('maps the pending unique constraint to a duplicate invitation conflict', async () => {
    const duplicate = Object.assign(new Error('duplicate'), { code: '23505' });
    mockQuery
      .mockResolvedValueOnce({ rows: [team] })
      .mockResolvedValueOnce({ rows: [{ steam_id: PLAYER_ID }] })
      .mockRejectedValueOnce(duplicate);
    const response = await request(app).post('/team/9/invitations')
      .set('Authorization', `Bearer ${tokenFor(OWNER_ID)}`).send({ recipientId: PLAYER_ID });
    expect(response.statusCode).toBe(409);
    expect(response.body.code).toBe('DUPLICATE_INVITATION');
  });

  it('accepts only the addressed invitation inside a transaction', async () => {
    const client = { query: jest.fn(), release: jest.fn() };
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 12, team_id: 9, owner_id: OWNER_ID, recipient_id: PLAYER_ID, status: 'pending', members: [] }] })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 0 })
      .mockResolvedValueOnce({});
    mockConnect.mockResolvedValueOnce(client);
    const response = await request(app).post('/invitations/12/accept')
      .set('Authorization', `Bearer ${tokenFor(PLAYER_ID)}`);
    expect(response.statusCode).toBe(200);
    const memberUpdate = client.query.mock.calls.find(([sql]) => sql.includes('array_append'));
    expect(memberUpdate[1][0]).toBe(PLAYER_ID);
    expect(typeof memberUpdate[1][0]).toBe('string');
    expect(client.query).toHaveBeenCalledWith('COMMIT');
    expect(client.release).toHaveBeenCalled();
  });

  it('does not let another player accept the invitation', async () => {
    const client = { query: jest.fn(), release: jest.fn() };
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 12, team_id: 9, owner_id: OWNER_ID, recipient_id: PLAYER_ID, status: 'pending', members: [] }] })
      .mockResolvedValueOnce({});
    mockConnect.mockResolvedValueOnce(client);
    const response = await request(app).post('/invitations/12/accept')
      .set('Authorization', `Bearer ${tokenFor('76561198267589953')}`);
    expect(response.statusCode).toBe(404);
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  });

  it('declines only pending invitations addressed to the current player', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 12 }] });
    const response = await request(app).post('/invitations/12/decline')
      .set('Authorization', `Bearer ${tokenFor(PLAYER_ID)}`);
    expect(response.statusCode).toBe(200);
    expect(mockQuery.mock.calls[0][1]).toEqual([12, PLAYER_ID]);
  });
});
