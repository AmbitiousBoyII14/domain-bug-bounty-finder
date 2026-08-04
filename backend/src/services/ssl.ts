import tls from 'tls';

export interface SslResult {
  issuer: string; subject: string; serialNumber: string; notBefore: string; notAfter: string;
  san: string[]; fingerprint: string; publicKeyAlgo: string; signatureAlgo: string;
  tlsVersion: string; cipher: string; isExpired: boolean; daysUntilExpiry: number;
}

export async function scanSsl(domain: string): Promise<SslResult | null> {
  return new Promise((resolve) => {
    const socket = tls.connect({ host: domain, port: 443, servername: domain, rejectUnauthorized: false, timeout: 10000 }, () => {
      const cert = socket.getPeerCertificate(true);
      const cipher = socket.getCipher();
      if (!cert || Object.keys(cert).length === 0) { socket.destroy(); resolve(null); return; }
      const notAfter = new Date(cert.valid_to);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const result: SslResult = {
        issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
        subject: cert.subject?.CN || domain,
        serialNumber: cert.serialNumber || '',
        notBefore: cert.valid_from, notAfter: cert.valid_to,
        san: cert.subjectaltname?.replace(/DNS:/g, '').split(', ') || [],
        fingerprint: cert.fingerprint256?.replace(/:/g, '') || '',
        publicKeyAlgo: cert.bits ? `RSA ${cert.bits}` : 'EC',
        signatureAlgo: cert.sigalg || '',
        tlsVersion: cipher.version || '', cipher: cipher.name || '',
        isExpired: daysUntilExpiry < 0, daysUntilExpiry,
      };
      socket.destroy();
      resolve(result);
    });
    socket.on('error', () => { socket.destroy(); resolve(null); });
    socket.on('timeout', () => { socket.destroy(); resolve(null); });
    setTimeout(() => { socket.destroy(); resolve(null); }, 12000);
  });
}
