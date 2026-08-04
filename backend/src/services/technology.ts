import https from 'https';

interface TechPattern { name: string; category: string; patterns: { type: 'header' | 'body' | 'cookie'; key?: string; value: RegExp }[]; }

const TECH_PATTERNS: TechPattern[] = [
  { name: 'Cloudflare', category: 'cdn', patterns: [{ type: 'header', key: 'server', value: /cloudflare/i }, { type: 'header', key: 'cf-ray', value: /.*/ }] },
  { name: 'Fastly', category: 'cdn', patterns: [{ type: 'header', key: 'x-served-by', value: /fastly/i }] },
  { name: 'AWS CloudFront', category: 'cdn', patterns: [{ type: 'header', key: 'x-cache', value: /cloudfront/i }] },
  { name: 'Akamai', category: 'cdn', patterns: [{ type: 'header', key: 'x-akamai-transformed', value: /.*/ }] },
  { name: 'Nginx', category: 'server', patterns: [{ type: 'header', key: 'server', value: /nginx/i }] },
  { name: 'Apache', category: 'server', patterns: [{ type: 'header', key: 'server', value: /apache/i }] },
  { name: 'LiteSpeed', category: 'server', patterns: [{ type: 'header', key: 'server', value: /litespeed/i }] },
  { name: 'Microsoft IIS', category: 'server', patterns: [{ type: 'header', key: 'server', value: /microsoft-iis/i }] },
  { name: 'Vercel', category: 'hosting', patterns: [{ type: 'header', key: 'x-vercel-id', value: /.*/ }] },
  { name: 'Netlify', category: 'hosting', patterns: [{ type: 'header', key: 'server', value: /netlify/i }] },
  { name: 'GitHub Pages', category: 'hosting', patterns: [{ type: 'header', key: 'server', value: /github\.com/i }] },
  { name: 'Node.js', category: 'framework', patterns: [{ type: 'header', key: 'x-powered-by', value: /express|node/i }] },
  { name: 'PHP', category: 'framework', patterns: [{ type: 'header', key: 'x-powered-by', value: /php/i }] },
  { name: 'ASP.NET', category: 'framework', patterns: [{ type: 'header', key: 'x-powered-by', value: /asp\.net/i }] },
  { name: 'Laravel', category: 'framework', patterns: [{ type: 'cookie', key: 'laravel_session', value: /.*/ }] },
  { name: 'WordPress', category: 'cms', patterns: [{ type: 'header', key: 'x-powered-by', value: /wordpress/i }] },
  { name: 'Drupal', category: 'cms', patterns: [{ type: 'cookie', key: 'drupal', value: /.*/ }] },
  { name: 'Next.js', category: 'js_library', patterns: [{ type: 'header', key: 'x-powered-by', value: /next\.js/i }] },
  { name: 'React', category: 'js_library', patterns: [{ type: 'body', value: /react@[\d.]+/ }] },
  { name: 'Vue.js', category: 'js_library', patterns: [{ type: 'body', value: /vue@[\d.]+/ }] },
  { name: 'Angular', category: 'js_library', patterns: [{ type: 'body', value: /ng-version="[\d.]+"/ }] },
  { name: 'jQuery', category: 'js_library', patterns: [{ type: 'body', value: /jquery@[\d.]+|jquery[\d.]+/i }] },
  { name: 'Bootstrap', category: 'js_library', patterns: [{ type: 'body', value: /bootstrap@[\d.]+/ }] },
];

export interface TechResult { name: string; category: string; version?: string; confidence: string; }

export async function detectTechnologies(domain: string): Promise<TechResult[]> {
  return new Promise((resolve) => {
    const results: TechResult[] = [];
    const detected = new Set<string>();
    https.get(`https://${domain}`, { headers: { 'User-Agent': 'DomainBugBountyFinder/1.0' }, timeout: 10000 }, (res) => {
      const headers = res.headers;
      const cookies = res.headers['set-cookie']?.join('; ') || '';
      let body = '';
      res.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      res.on('end', () => {
        for (const tech of TECH_PATTERNS) {
          if (detected.has(tech.name)) continue;
          for (const pattern of tech.patterns) {
            let matched = false; let version: string | undefined;
            if (pattern.type === 'header' && pattern.key && headers[pattern.key.toLowerCase()]) {
              const match = String(headers[pattern.key.toLowerCase()]).match(pattern.value);
              if (match) { matched = true; version = match[1]; }
            } else if (pattern.type === 'cookie' && pattern.key && cookies.includes(pattern.key)) {
              matched = true;
            } else if (pattern.type === 'body') {
              const match = body.match(pattern.value);
              if (match) { matched = true; version = match[1]; }
            }
            if (matched) { detected.add(tech.name); results.push({ name: tech.name, category: tech.category, version, confidence: 'high' }); break; }
          }
        }
        resolve(results);
      });
    }).on('error', () => resolve(results)).on('timeout', function(this: any) { this.destroy(); resolve(results); });
  });
}
