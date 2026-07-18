const jwt = require('jsonwebtoken');

function getBearerToken(header = '') {
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1] : null;
}

function requireAuth(req, res, next) {
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      code: 'AUTH_REQUIRED',
      message: 'Sign in with Steam to continue.',
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(503).json({
      code: 'AUTH_UNAVAILABLE',
      message: 'Authentication is temporarily unavailable.',
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const steamId = String(payload.steamId || '');
    if (!steamId) throw new Error('Missing Steam identifier');
    req.user = { ...payload, steamId };
    return next();
  } catch (_error) {
    return res.status(401).json({
      code: 'SESSION_EXPIRED',
      message: 'Your session is invalid or has expired. Please sign in again.',
    });
  }
}

module.exports = { getBearerToken, requireAuth };
