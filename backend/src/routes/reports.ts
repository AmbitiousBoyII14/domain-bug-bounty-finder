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
    const [whois, dns, certs, techs, httpInfo, subdomains, scans] = await Promise.all([
      prisma.whoisInfo.findUnique({ where: { targetId: target.id } }),
      prisma.dnsRecord.findMany({ where: { targetId: target.id }, orderBy: { type: 'asc' } }),
      prisma.certInfo.findUnique({ where: { targetId: target.id } }),
      prisma.techInfo.findMany({ where: { targetId: target.id } }),
      prisma.httpInfo.findUnique({ where: { targetId: target.id } }),
      prisma.subdomain.count({ where: { targetId: target.id } }),
      prisma.scan.findMany({ where: { targetId: target.id }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);
    const byType: Record<string, number> = {};
    for (const r of dns) byType[r.type] = (byType[r.type] || 0) + 1;
    const report = { target: { id: target.id, domain: target.domain, displayName: target.displayName, status: target.status, tags: target.tags }, whois, dns: { records: dns, byType }, ssl: certs, technologies: techs, http: httpInfo, subdomainsCount: subdomains, recentScans: scans, generatedAt: new Date().toISOString() };
    const format = (req.query.format as string) || 'json';
    if (format === 'csv') {
      const lines = ['Section,Key,Value'];
      if (whois) { lines.push(`WHOIS,Registrar,${whois.registrar || ''}`); lines.push(`WHOIS,Expiration,${whois.expirationDate || ''}`); }
      for (const r of dns) lines.push(`DNS,${r.type} ${r.name},${r.value}`);
      for (const t of techs) lines.push(`Technology,${t.category},${t.name} ${t.version || ''}`);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${target.domain}-report.csv`);
      res.send(lines.join('\n'));
      return;
    }
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
});

export default router;
