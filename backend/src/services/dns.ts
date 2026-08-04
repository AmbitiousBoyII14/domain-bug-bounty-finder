import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);
const resolveCname = promisify(dns.resolveCname);
const resolveTxt = promisify(dns.resolveTxt);
const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);
const resolveSoa = promisify(dns.resolveSoa);
const resolveCaa = promisify(dns.resolveCaa);

export interface DnsResult { type: string; name: string; value: string; ttl?: number; priority?: number; }

export async function scanDns(domain: string): Promise<DnsResult[]> {
  const results: DnsResult[] = [];
  const queries: { type: string; fn: () => Promise<any>; extract: (r: any) => string }[] = [
    { type: 'A', fn: () => resolve4(domain), extract: (r) => r },
    { type: 'AAAA', fn: () => resolve6(domain).catch(() => []), extract: (r) => r },
    { type: 'CNAME', fn: () => resolveCname(domain).catch(() => []), extract: (r) => r },
    { type: 'TXT', fn: () => resolveTxt(domain).catch(() => []), extract: (r) => (Array.isArray(r) ? r.join('') : r) },
    { type: 'MX', fn: () => resolveMx(domain).catch(() => []), extract: (r) => `${r.exchange} (priority: ${r.priority})` },
    { type: 'NS', fn: () => resolveNs(domain).catch(() => []), extract: (r) => r },
    { type: 'SOA', fn: () => resolveSoa(domain).catch(() => null), extract: (r) => r ? `${r.nsname} ${r.hostmaster}` : '' },
    { type: 'CAA', fn: () => resolveCaa(domain).catch(() => []), extract: (r) => `${r.tag} ${r.value} (flags: ${r.flags})` },
  ];
  for (const { type, fn, extract } of queries) {
    try {
      const records = await fn();
      const recordList = Array.isArray(records) ? records : [records].filter(Boolean);
      for (const record of recordList) {
        if (record) {
          results.push({ type, name: type === 'MX' ? (record as any).exchange : (type === 'SOA' ? (record as any).nsname : domain), value: extract(record), priority: type === 'MX' ? (record as any).priority : undefined });
        }
      }
    } catch {}
  }
  return results;
}
