import { SignJWT, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import type { JWTPayload } from '@/types';

const COOKIE_NAME = 'session';
const MAX_AGE = 8 * 60 * 60; // 8 hours in seconds

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Signs a JWT token with the given payload and 8h expiration.
 */
export async function signToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>
): Promise<string> {
  const secret = getJwtSecret();

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret);

  return token;
}

/**
 * Verifies and decodes a JWT token. Returns the payload or null if invalid/expired.
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    return {
      id: payload.id as string,
      usuario: payload.usuario as string,
      cargo: payload.cargo as JWTPayload['cargo'],
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}

/**
 * Sets the session cookie on a NextResponse with HTTP-only, Secure (in production),
 * SameSite=Lax, and maxAge of 8 hours.
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

/**
 * Clears the session cookie by setting it to empty with maxAge 0.
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Extracts and verifies the JWT from the session cookie.
 * Works with Next.js cookies() API (ReadonlyRequestCookies).
 */
export async function getSessionFromCookie(
  cookies: { get: (name: string) => { value: string } | undefined }
): Promise<JWTPayload | null> {
  const cookie = cookies.get(COOKIE_NAME);
  if (!cookie?.value) {
    return null;
  }
  return verifyToken(cookie.value);
}

/**
 * Hashes a password using bcryptjs with 12 salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compares a plaintext password against a bcrypt hash.
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export { COOKIE_NAME, MAX_AGE };
