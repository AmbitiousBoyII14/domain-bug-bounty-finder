import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AuthRequest } from '../types';
import { paginate, buildMeta } from '../utils/helpers';

const router = Router();
router.use(authenticate);

router.get('/:targetId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const target = await prisma.target.findFirst({ where: { id: req.params.targetId, userId: req.user!.userId } });
    if (!target) { res.status(404).json({ success: false, error: 'Target not found' }); return; }
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string) || 50));
    const search = (req.query.search as string) || '';
    const where: any = { targetId: req.params.targetId };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const [total, subdomains] = await Promise.all([prisma.subdomain.count({ where }), prisma.subdomain.findMany({ where, orderBy: { name: 'asc' }, ...paginate(page, limit) })]);
    res.json({ success: true, data: subdomains, meta: buildMeta(page, limit, total) });
  } catch (err) { next(err); }
});

router.post('/import', validate(z.object({ targetId: z.string().uuid(), subdomains: z.array(z.object({ name: z.string().min(1).max(253), ipAddress: z.string().optional(), source: z.string().optional() })).min(1).max(1000) })), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const target = await prisma.target.findFirst({ where: { id: req.body.targetId, userId: req.user!.userId } });
    if (!target) { res.status(404).json({ success: false, error: 'Target not found' }); return; }
    let created = 0, skipped = 0;
    for (const sub of req.body.subdomains) {
      try { await prisma.subdomain.create({ data: { targetId: req.body.targetId, name: sub.name.toLowerCase().trim(), ipAddress: sub.ipAddress, source: sub.source || 'imported' } }); created++; } catch { skipped++; }
    }
    res.status(201).json({ success: true, data: { created, skipped, total: req.body.subdomains.length } });
  } catch (err) { next(err); }
});

router.get('/:targetId/export', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const target = await prisma.target.findFirst({ where: { id: req.params.targetId, userId: req.user!.userId } });
    if (!target) { res.status(404).json({ success: false, error: 'Target not found' }); return; }
    const subdomains = await prisma.subdomain.findMany({ where: { targetId: req.params.targetId }, orderBy: { name: 'asc' } });
    const format = (req.query.format as string) || 'json';
    if (format === 'csv') {
      const csv = ['name,ipAddress,status,source'].concat(subdomains.map(s => `${s.name},${s.ipAddress || ''},${s.status},${s.source}`)).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${target.domain}-subdomains.csv`);
      res.send(csv);
      return;
    }
    if (format === 'txt') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename=${target.domain}-subdomains.txt`);
      res.send(subdomains.map(s => s.name).join('\n'));
      return;
    }
    res.json({ success: true, data: subdomains });
  } catch (err) { next(err); }
});

export default router;
