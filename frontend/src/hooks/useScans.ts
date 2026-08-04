import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/client';

export function useScans(params?: { page?: number; status?: string; targetId?: string }) {
  return useQuery({ queryKey: ['scans', params], queryFn: async () => { const res = await api.get('/scans', { params }); return res.data; }, refetchInterval: 5000 });
}

export function useScanQueue() {
  return useQuery({ queryKey: ['scan-queue'], queryFn: async () => { const res = await api.get('/scans/queue'); return res.data.data; }, refetchInterval: 3000 });
}

export function useStartScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { targetId: string; type: string }) => { const res = await api.post('/scans', data); return res.data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['scans'] }); qc.invalidateQueries({ queryKey: ['scan-queue'] }); toast.success('Scan queued'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to start scan'),
  });
}

export function useRetryScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (scanId: string) => { const res = await api.post(`/scans/${scanId}/retry`); return res.data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['scans'] }); qc.invalidateQueries({ queryKey: ['scan-queue'] }); toast.success('Scan retry queued'); },
    onError: () => toast.error('Failed to retry scan'),
  });
}

export function useCancelScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (scanId: string) => { await api.post(`/scans/${scanId}/cancel`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['scans'] }); qc.invalidateQueries({ queryKey: ['scan-queue'] }); toast.success('Scan cancelled'); },
    onError: () => toast.error('Failed to cancel scan'),
  });
}
