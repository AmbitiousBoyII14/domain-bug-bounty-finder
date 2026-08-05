import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuthStore } from '../store/useStore';

function getErrorMessage(err: any): string {
  if (err?.isNetworkError) return 'Cannot reach the server. Is the backend online?';
  if (err?.isHtmlError) return 'Server returned an unexpected response. Check API URL.';
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.response?.status === 404) return 'API not found — check backend deployment';
  if (err?.response?.status >= 500) return 'Server error — try again later';
  if (err?.message) return err.message;
  return 'Something went wrong. Please try again.';
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post('/auth/login', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: { email: string; password: string; displayName?: string }) => {
      const res = await api.post('/auth/register', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Account created!');
      navigate('/dashboard');
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  });
}
