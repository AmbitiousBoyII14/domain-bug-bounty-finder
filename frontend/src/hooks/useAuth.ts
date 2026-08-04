import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuthStore } from '../store/useStore';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => { const res = await api.post('/auth/login', data); return res.data.data; },
    onSuccess: (data) => { setAuth(data.user, data.accessToken, data.refreshToken); toast.success('Welcome back!'); navigate('/dashboard'); },
    onError: () => toast.error('Invalid credentials'),
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: { email: string; password: string; displayName?: string }) => { const res = await api.post('/auth/register', data); return res.data.data; },
    onSuccess: (data) => { setAuth(data.user, data.accessToken, data.refreshToken); toast.success('Account created!'); navigate('/dashboard'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Registration failed'),
  });
}
