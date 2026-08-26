import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Response } from 'express';
import { env } from '../config/env.js';
import { UserRole } from '../models/user.model.js';

export interface JwtAccessPayload {
  userId: string;
  role: UserRole;
}

export interface JwtRefreshPayload {
  userId: string;
  tokenVersion?: number;
}

/**
 * Hash raw password using bcrypt with cost factor 12
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare plain text password against bcrypt hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate short-lived JWT access token (e.g. 15 minutes)
 */
export function generateAccessToken(payload: JwtAccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Generate longer-lived JWT refresh token (e.g. 7 days)
 */
export function generateRefreshToken(payload: JwtRefreshPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    jwtid: crypto.randomUUID(),
  });
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JwtAccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JwtRefreshPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
}

/**
 * Generate cryptographically random hex token (for email verification & password reset)
 */
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Set HTTP-only, secure, SameSite refresh token cookie
 */
export function setRefreshTokenCookie(res: Response, token: string): void {
  const isProduction = env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Clear refresh token cookie
 */
export function clearRefreshTokenCookie(res: Response): void {
  const isProduction = env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  });
}
