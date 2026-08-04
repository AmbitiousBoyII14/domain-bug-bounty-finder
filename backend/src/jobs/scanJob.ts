import { prisma } from '../config/database';
import { scanDns } from '../services/dns';
import { scanSsl } from '../services/ssl';
import { scanHttp } from '../services/http';
import { detectTechnologies } from '../services/technology';
import { cacheSet } from '../config/redis';
import logger from '../utils/logger';

export interface ScanJobData {
  scanId: string;
  targetId: string;
  domain: string;
  scanType: 'full' | 'dns' | 'ssl' | 'tech' | 'quick';
  userId: string;
}

export async function processScanJob(data: ScanJobData): Promise<void> {
  const { scanId, targetId, domain, scanType } = data;
  try {
    await prisma.scan.update({ where: { id: scanId }, data: { status: 'running', startedAt: new Date(), progress: 10 } });
    const shouldRun = (type: string) => scanType === 'full' || scanType === type;

    if (shouldRun('dns') || scanType === 'quick') {
      await prisma.scan.update({ where: { id: scanId }, data: { progress: 20 } });
      try {
        const dnsResults = await scanDns(domain);
        await prisma.dnsRecord.deleteMany({ where: { targetId } });
        if (dnsResults.length > 0) {
          await prisma.dnsRecord.createMany({ data: dnsResults.map(r => ({ targetId, type: r.type, name: r.name, value: r.value, priority: r.priority })) });
        }
        logger.info(`DNS scan complete for ${domain}: ${dnsResults.length} records`);
      } catch (err) { logger.error(`DNS scan failed for ${domain}:`, err); }
    }

    if (shouldRun('ssl') || scanType === 'quick') {
      await prisma.scan.update({ where: { id: scanId }, data: { progress: 40 } });
      try {
        const sslResult = await scanSsl(domain);
        if (sslResult) {
          await prisma.certInfo.upsert({
            where: { targetId },
            create: { targetId, issuer: sslResult.issuer, subject: sslResult.subject, serialNumber: sslResult.serialNumber, notBefore: sslResult.notBefore, notAfter: sslResult.notAfter, san: sslResult.san, fingerprint: sslResult.fingerprint, publicKeyAlgo: sslResult.publicKeyAlgo, signatureAlgo: sslResult.signatureAlgo, tlsVersion: sslResult.tlsVersion, cipher: sslResult.cipher, isExpired: sslResult.isExpired, daysUntilExpiry: sslResult.daysUntilExpiry },
            update: { issuer: sslResult.issuer, notAfter: sslResult.notAfter, isExpired: sslResult.isExpired, daysUntilExpiry: sslResult.daysUntilExpiry, cipher: sslResult.cipher, tlsVersion: sslResult.tlsVersion },
          });
        }
      } catch (err) { logger.error(`SSL scan failed for ${domain}:`, err); }
    }

    if (shouldRun('tech') || scanType === 'quick' || scanType === 'full') {
      await prisma.scan.update({ where: { id: scanId }, data: { progress: 60 } });
      try {
        const httpResult = await scanHttp(domain);
        await prisma.httpInfo.upsert({
          where: { targetId },
          create: { targetId, statusCode: httpResult.statusCode, statusText: httpResult.statusText, headers: httpResult.headers as any, redirectChain: httpResult.redirectChain as any, compression: httpResult.compression, cacheControl: httpResult.cacheControl, contentType: httpResult.contentType, server: httpResult.server, poweredBy: httpResult.poweredBy, responseTime: httpResult.responseTime, contentLength: httpResult.contentLength, finalUrl: httpResult.finalUrl },
          update: { statusCode: httpResult.statusCode, headers: httpResult.headers as any, server: httpResult.server, responseTime: httpResult.responseTime },
        });
        if (shouldRun('tech') || scanType === 'full') {
          const techs = await detectTechnologies(domain);
          if (techs.length > 0) {
            await prisma.techInfo.deleteMany({ where: { targetId } });
            await prisma.techInfo.createMany({ data: techs.map(t => ({ targetId, category: t.category, name: t.name, version: t.version, confidence: t.confidence })) });
          }
        }
      } catch (err) { logger.error(`HTTP scan failed for ${domain}:`, err); }
    }

    await prisma.scan.update({ where: { id: scanId }, data: { status: 'completed', progress: 100, completedAt: new Date() } });
    await prisma.target.update({ where: { id: targetId }, data: { lastScanned: new Date() } });
    await cacheSet(`scan:${targetId}:latest`, { completedAt: new Date().toISOString() }, 300);
    logger.info(`Scan ${scanId} completed for ${domain}`);
  } catch (err: any) {
    logger.error(`Scan ${scanId} failed for ${domain}:`, err);
    await prisma.scan.update({ where: { id: scanId }, data: { status: 'failed', error: err.message || 'Unknown error', completedAt: new Date() } });
    throw err;
  }
}
