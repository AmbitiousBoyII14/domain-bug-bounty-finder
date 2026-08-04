import { Router, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, requireAdmin } from '../middleware/auth';
import { AuthRequest } from '../types';
import { cacheFlush } from '../config/redis';

const router = Router();
router.use(authenticate);
router.use(requireAdmin);

router.get('/stats', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [users, targets, scans, subdomains] = await Promise.all([prisma.user.count(), prisma.target.count(), prisma.scan.count(), prisma.subdomain.count()]);
    res.json({ success: true, data: { users, targets, scans, subdomains } });
  } catch (err) { next(err); }
});

router.get('/users', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, displayName: true, role: true, lastLogin: true, createdAt: true, _count: { select: { targets: true } } } }),
    ]);
    res.json({ success: true, data: users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

router.post('/cache/clear', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try { await cacheFlush(); res.json({ success: true, message: 'Cache cleared' }); } catch (err) { next(err); }
});

router.get('/logs', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const [total, logs] = await Promise.all([prisma.auditLog.count(), prisma.auditLog.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } })]);
    res.json({ success: true, data: logs, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

export default router;
