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
    const cert = await prisma.certInfo.findUnique({ where: { targetId: req.params.targetId } });
    res.json({ success: true, data: cert || null });
  } catch (err) { next(err); }
});

export default router;
