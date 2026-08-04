export interface User {
  id: string; email: string; displayName: string; role: 'user' | 'admin'; avatarUrl?: string;
  theme: 'dark' | 'light'; accentColor: string; language: string; timezone: string;
  defaultExport: string; notifications: boolean; lastLogin?: string; createdAt: string;
}

export interface Target {
  id: string; domain: string; displayName?: string; status: 'active' | 'paused' | 'archived';
  tags: string[]; notes?: string; isFavorite: boolean; projectId?: string;
  lastScanned?: string; createdAt: string; updatedAt: string;
  _count?: { subdomains: number; scans: number };
  whoisInfos?: WhoisInfo[]; httpInfos?: HttpInfo[]; project?: { id: string; name: string };
}

export interface Scan {
  id: string; targetId: string; type: 'full' | 'dns' | 'ssl' | 'tech' | 'quick';
  status: 'queued' | 'running' | 'completed' | 'failed'; progress: number;
  error?: string; startedAt?: string; completedAt?: string; createdAt: string;
  target?: { domain: string };
}

export interface WhoisInfo { registrar?: string; creationDate?: string; expirationDate?: string; nameServers: string[]; status?: string; }
export interface DnsRecord { id: string; type: string; name: string; value: string; ttl?: number; priority?: number; }
export interface CertInfo { issuer?: string; subject?: string; notBefore?: string; notAfter?: string; san: string[]; tlsVersion?: string; cipher?: string; isExpired: boolean; daysUntilExpiry?: number; hsts: boolean; }
export interface TechInfo { id: string; category: string; name: string; version?: string; confidence: string; }
export interface HttpInfo { statusCode?: number; server?: string; poweredBy?: string; responseTime?: number; redirectChain?: string[]; }
export interface Subdomain { id: string; name: string; ipAddress?: string; source: string; status: 'new' | 'verified' | 'invalid'; tags: string[]; isFavorite: boolean; createdAt: string; }
export interface DashboardStats {
  targetsScanned: number; subdomainsFound: number; technologiesDetected: number;
  certificates: number; dnsRecords: number; recentScans: Scan[];
  recentTargets: Target[]; scanStatusBreakdown: Record<string, number>;
}
export interface Project { id: string; name: string; description?: string; createdAt: string; }
