import https from 'https';

export interface HttpResult {
  statusCode: number; statusText: string; headers: Record<string, string | string[] | undefined>;
  server: string; poweredBy: string; contentType: string; compression: string;
  cacheControl: string; contentLength: number; finalUrl: string;
  responseTime: number; redirectChain: string[];
}

export function scanHttp(domain: string): Promise<HttpResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const redirectChain: string[] = [];
    const maxRedirects = 5;
    function makeRequest(url: string, redirectsLeft: number) {
      const req = https.get(url, { headers: { 'User-Agent': 'DomainBugBountyFinder/1.0' }, timeout: 10000 }, (res) => {
        const responseTime = Date.now() - startTime;
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
          redirectChain.push(res.headers.location);
          res.resume();
          makeRequest(new URL(res.headers.location, url).toString(), redirectsLeft - 1);
          return;
        }
        let body = '';
        res.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0, statusText: res.statusMessage || '',
            headers: res.headers, server: (res.headers.server as string) || '',
            poweredBy: (res.headers['x-powered-by'] as string) || '',
            contentType: (res.headers['content-type'] as string) || '',
            compression: (res.headers['content-encoding'] as string) || '',
            cacheControl: (res.headers['cache-control'] as string) || '',
            contentLength: parseInt((res.headers['content-length'] as string) || '0', 10),
            finalUrl: url, responseTime, redirectChain,
          });
        });
      });
      req.on('error', (err) => resolve({ statusCode: 0, statusText: err.message, headers: {}, server: '', poweredBy: '', contentType: '', compression: '', cacheControl: '', contentLength: 0, finalUrl: url, responseTime: Date.now() - startTime, redirectChain }));
      req.on('timeout', () => { req.destroy(); resolve({ statusCode: 0, statusText: 'Timeout', headers: {}, server: '', poweredBy: '', contentType: '', compression: '', cacheControl: '', contentLength: 0, finalUrl: url, responseTime: Date.now() - startTime, redirectChain }); });
    }
    makeRequest(`https://${domain}`, maxRedirects);
  });
}
