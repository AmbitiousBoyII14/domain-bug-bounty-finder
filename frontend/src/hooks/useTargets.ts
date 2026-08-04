import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/client';
import type { Target, DashboardStats } from '../types';

export function useTargets(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  return useQuery({ queryKey: ['targets', params], queryFn: async () => { const res = await api.get('/targets', { params }); return res.data; } });
}

export function useTarget(id: string) {
  return useQuery({ queryKey: ['target', id], queryFn: async () => { const res = await api.get(`/targets/${id}`); return res.data.data as Target; }, enabled: !!id });
}

export function useDashboardStats() {
  return useQuery({ queryKey: ['dashboard'], queryFn: async () => { const res = await api.get('/users/dashboard'); return res.data.data as DashboardStats; }, refetchInterval: 30000 });
}

export function useCreateTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { domain: string; projectId?: string; tags?: string[] }) => { const res = await api.post('/targets', data); return res.data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['targets'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Target added'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to add target'),
  });
}

export function useBulkImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { domains: string[]; projectId?: string; tags?: string[] }) => { const res = await api.post('/targets/bulk', data); return res.data.data; },
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['targets'] }); toast.success(`${data.filter((d: any) => d.status === 'created').length} targets imported`); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Import failed'),
  });
}

export function useDeleteTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/targets/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['targets'] }); toast.success('Target deleted'); },
    onError: () => toast.error('Failed to delete target'),
  });
}
