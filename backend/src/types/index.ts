import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ScanType = 'full' | 'dns' | 'ssl' | 'tech' | 'quick';
export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed';
export type TargetStatus = 'active' | 'paused' | 'archived';
export type SubdomainStatus = 'new' | 'verified' | 'invalid';
export type UserRole = 'user' | 'admin';
