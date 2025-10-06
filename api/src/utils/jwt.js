import jwt from 'jsonwebtoken';

// Sign JWT on user login with expiration
export function signJwt(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '2h' });
}

// Sets Auth Cookie for session management
export function setAuthCookie(res, token) {
  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 2 // 2h
  });
}