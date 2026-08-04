import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AuthRequest } from '../types';

const router = Router();
router.use(authenticate);

router.get('/settings', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { theme: true, accentColor: true, language: true, timezone: true, defaultExport: true, notifications: true, displayName: true, email: true } });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.patch('/settings', validate(z.object({ theme: z.enum(['dark', 'light']).optional(), accentColor: z.string().optional(), language: z.string().optional(), timezone: z.string().optional(), defaultExport: z.enum(['json', 'csv', 'txt', 'pdf']).optional(), notifications: z.boolean().optional(), displayName: z.string().min(2).max(50).optional() })), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.update({ where: { id: req.user!.userId }, data: req.body, select: { theme: true, accentColor: true, language: true, timezone: true, defaultExport: true, notifications: true, displayName: true } });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const [targets, scans, subdomains, techs, certs, dnsRecords, recentScans, recentTargets, scanHistory] = await Promise.all([
      prisma.target.count({ where: { userId } }),
      prisma.scan.count({ where: { userId } }),
      prisma.subdomain.count({ where: { target: { userId } } }),
      prisma.techInfo.count({ where: { target: { userId } } }),
      prisma.certInfo.count({ where: { target: { userId } } }),
      prisma.dnsRecord.count({ where: { target: { userId } } }),
      prisma.scan.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10, include: { target: { select: { domain: true } } } }),
      prisma.target.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' }, take: 5 }),
      prisma.scan.groupBy({ by: ['status'], where: { userId }, _count: true }),
    ]);
    const statusCounts: Record<string, number> = {};
    for (const s of scanHistory) statusCounts[s.status] = s._count;
    res.json({ success: true, data: { targetsScanned: targets, subdomainsFound: subdomains, technologiesDetected: techs, certificates: certs, dnsRecords, recentScans, recentTargets, scanStatusBreakdown: statusCounts } });
  } catch (err) { next(err); }
});

export default router;
