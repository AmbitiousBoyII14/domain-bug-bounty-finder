import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';
import { AuthRequest } from '../types';

const router = Router();

const registerSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(128), displayName: z.string().min(2).max(50).optional() });
const loginSchema = z.object({ email: z.string().email(), password: z.string() });

function generateTokens(payload: { userId: string; email: string; role: string }) {
  return {
    accessToken: jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions),
    refreshToken: jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions),
  };
}

router.post('/register', authLimiter, validate(registerSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password, displayName } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ success: false, error: 'Email already registered' }); return; }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, password: hashedPassword, displayName: displayName || email.split('@')[0] } });
    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken, lastLogin: new Date() } });
    res.status(201).json({ success: true, data: { user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role, avatarUrl: user.avatarUrl }, ...tokens } });
  } catch (err) { next(err); }
});

router.post('/login', authLimiter, validate(loginSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) { res.status(401).json({ success: false, error: 'Invalid credentials' }); return; }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) { res.status(401).json({ success: false, error: 'Invalid credentials' }); return; }
    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken, lastLogin: new Date() } });
    res.json({ success: true, data: { user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role, avatarUrl: user.avatarUrl, theme: user.theme, accentColor: user.accentColor }, ...tokens } });
  } catch (err) { next(err); }
});

router.post('/refresh', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) { res.status(400).json({ success: false, error: 'Refresh token required' }); return; }
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string; email: string; role: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.refreshToken !== refreshToken) { res.status(401).json({ success: false, error: 'Invalid refresh token' }); return; }
    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });
    res.json({ success: true, data: tokens });
  } catch { res.status(401).json({ success: false, error: 'Invalid refresh token' }); }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { id: true, email: true, displayName: true, role: true, avatarUrl: true, theme: true, accentColor: true, language: true, timezone: true, defaultExport: true, notifications: true, lastLogin: true, createdAt: true } });
    if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.post('/logout', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.user.update({ where: { id: req.user!.userId }, data: { refreshToken: null } });
    res.json({ success: true, message: 'Logged out' });
  } catch (err) { next(err); }
});

export default router;
