import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AuthRequest } from '../types';
import { sanitizeDomain, isValidDomain, paginate, buildMeta } from '../utils/helpers';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || '';
    const status = req.query.status as string;
    const where: any = { userId: req.user!.userId };
    if (search) where.domain = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    const [total, targets] = await Promise.all([
      prisma.target.count({ where }),
      prisma.target.findMany({ where, orderBy: { createdAt: 'desc' }, ...paginate(page, limit), include: { _count: { select: { subdomains: true, scans: true } } } }),
    ]);
    res.json({ success: true, data: targets, meta: buildMeta(page, limit, total) });
  } catch (err) { next(err); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const target = await prisma.target.findFirst({ where: { id: req.params.id, userId: req.user!.userId }, include: { whoisInfos: true, httpInfos: true, _count: { select: { dnsRecords: true, certs: true, techs: true, subdomains: true, scans: true } }, project: { select: { id: true, name: true } } } });
    if (!target) { res.status(404).json({ success: false, error: 'Target not found' }); return; }
    res.json({ success: true, data: target });
  } catch (err) { next(err); }
});

router.post('/', validate(z.object({ domain: z.string().min(3).max(253), projectId: z.string().uuid().optional(), tags: z.array(z.string()).optional() })), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const domain = sanitizeDomain(req.body.domain);
    if (!isValidDomain(domain)) { res.status(400).json({ success: false, error: 'Invalid domain' }); return; }
    const existing = await prisma.target.findUnique({ where: { domain } });
    if (existing) { res.status(409).json({ success: false, error: 'Target already exists' }); return; }
    const target = await prisma.target.create({ data: { domain, displayName: req.body.displayName || domain, userId: req.user!.userId, projectId: req.body.projectId || null, tags: req.body.tags || [] } });
    res.status(201).json({ success: true, data: target });
  } catch (err) { next(err); }
});

router.post('/bulk', validate(z.object({ domains: z.array(z.string().min(3).max(253)).min(1).max(100), projectId: z.string().uuid().optional(), tags: z.array(z.string()).optional() })), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const results: any[] = [];
    for (const d of req.body.domains) {
      const domain = sanitizeDomain(d);
      if (!isValidDomain(domain)) { results.push({ domain: d, status: 'invalid' }); continue; }
      const existing = await prisma.target.findUnique({ where: { domain } });
      if (existing) { results.push({ domain, status: 'exists', id: existing.id }); continue; }
      const target = await prisma.target.create({ data: { domain, displayName: domain, userId: req.user!.userId, projectId: req.body.projectId || null, tags: req.body.tags || [] } });
      results.push({ domain, status: 'created', id: target.id });
    }
    res.status(201).json({ success: true, data: results });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const target = await prisma.target.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
    if (!target) { res.status(404).json({ success: false, error: 'Target not found' }); return; }
    const updated = await prisma.target.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const target = await prisma.target.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
    if (!target) { res.status(404).json({ success: false, error: 'Target not found' }); return; }
    await prisma.target.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Target deleted' });
  } catch (err) { next(err); }
});

export default router;
