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
    const techs = await prisma.techInfo.findMany({ where: { targetId: req.params.targetId }, orderBy: { category: 'asc' } });
    const byCategory: Record<string, typeof techs> = {};
    for (const t of techs) { if (!byCategory[t.category]) byCategory[t.category] = []; byCategory[t.category].push(t); }
    res.json({ success: true, data: { techs, byCategory, total: techs.length } });
  } catch (err) { next(err); }
});

export default router;
