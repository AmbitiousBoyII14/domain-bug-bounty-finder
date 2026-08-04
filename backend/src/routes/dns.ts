import { Router, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
router.use(authenticate);

router.get('/:targetId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const target = await prisma.target.findFirst({ where: { id: req.params.targetId, userId: req.user!.userId } });
    if (!target) { res.status(404).json({ success: false, error: 'Target not found' }); return; }
    const type = req.query.type as string;
    const where: any = { targetId: req.params.targetId };
    if (type) where.type = type.toUpperCase();
    const records = await prisma.dnsRecord.findMany({ where, orderBy: [{ type: 'asc' }, { name: 'asc' }] });
    const byType: Record<string, typeof records> = {};
    for (const r of records) { if (!byType[r.type]) byType[r.type] = []; byType[r.type].push(r); }
    res.json({ success: true, data: { records, byType, total: records.length } });
  } catch (err) { next(err); }
});

export default router;
