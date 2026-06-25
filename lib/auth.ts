import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET ?? '';
const COOKIE_NAME = 'arcana_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30日

export interface JwtPayload {
  userId: string;
  email: string;
}

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};

export const setCookieHeader = (token: string): string =>
  serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

export const clearCookieHeader = (): string =>
  serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

export const getTokenFromRequest = (cookieHeader: string | undefined): string | null => {
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  return cookies[COOKIE_NAME] ?? null;
};
