import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { scanLimiter } from '../middleware/rateLimiter';
import { AuthRequest } from '../types';
import { paginate, buildMeta } from '../utils/helpers';
import { scanQueue } from '../jobs/queue';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const where: any = { userId: req.user!.userId };
    if (req.query.status) where.status = req.query.status;
    const [total, scans] = await Promise.all([
      prisma.scan.count({ where }),
      prisma.scan.findMany({ where, orderBy: { createdAt: 'desc' }, ...paginate(page, limit), include: { target: { select: { domain: true } } } }),
    ]);
    res.json({ success: true, data: scans, meta: buildMeta(page, limit, total) });
  } catch (err) { next(err); }
});

router.get('/queue', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const scans = await prisma.scan.findMany({ where: { userId: req.user!.userId, status: { in: ['queued', 'running'] } }, orderBy: { createdAt: 'asc' }, include: { target: { select: { domain: true } } } });
    res.json({ success: true, data: scans });
  } catch (err) { next(err); }
});

router.post('/', scanLimiter, validate(z.object({ targetId: z.string().uuid(), type: z.enum(['full', 'dns', 'ssl', 'tech', 'quick']).default('full') })), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const target = await prisma.target.findFirst({ where: { id: req.body.targetId, userId: req.user!.userId } });
    if (!target) { res.status(404).json({ success: false, error: 'Target not found' }); return; }
    const scan = await prisma.scan.create({ data: { targetId: req.body.targetId, userId: req.user!.userId, type: req.body.type, status: 'queued' } });
    await scanQueue.add('domain-scan', { scanId: scan.id, targetId: target.id, domain: target.domain, scanType: req.body.type, userId: req.user!.userId });
    res.status(201).json({ success: true, data: scan });
  } catch (err) { next(err); }
});

router.post('/:id/retry', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const scan = await prisma.scan.findFirst({ where: { id: req.params.id, userId: req.user!.userId }, include: { target: { select: { domain: true } } } });
    if (!scan) { res.status(404).json({ success: false, error: 'Scan not found' }); return; }
    const newScan = await prisma.scan.create({ data: { targetId: scan.targetId, userId: req.user!.userId, type: scan.type, status: 'queued' } });
    await scanQueue.add('domain-scan', { scanId: newScan.id, targetId: scan.targetId, domain: scan.target.domain, scanType: scan.type, userId: req.user!.userId });
    res.json({ success: true, data: newScan });
  } catch (err) { next(err); }
});

router.post('/:id/cancel', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const scan = await prisma.scan.findFirst({ where: { id: req.params.id, userId: req.user!.userId, status: { in: ['queued', 'running'] } } });
    if (!scan) { res.status(404).json({ success: false, error: 'Active scan not found' }); return; }
    await prisma.scan.update({ where: { id: scan.id }, data: { status: 'failed', error: 'Cancelled by user' } });
    res.json({ success: true, message: 'Scan cancelled' });
  } catch (err) { next(err); }
});

export default router;
