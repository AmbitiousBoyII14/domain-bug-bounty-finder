export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
}

export function sanitizeDomain(domain: string): string {
  return domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '').toLowerCase().trim();
}

export function isValidDomain(domain: string): boolean {
  const pattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return pattern.test(sanitizeDomain(domain));
}

export function generateCacheKey(prefix: string, ...parts: string[]): string {
  return `df:${prefix}:${parts.join(':')}`;
}

export function paginate(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit };
}

export function buildMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
