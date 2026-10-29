import { apiClient } from '@/lib/api-client';
import {
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@/types/auth.types';

export const authService = {
  async register(data: RegisterRequest): Promise<string> {
    const response = await apiClient.post<string>('/api/auth/register', data);
    return response.data;
  },

  async verifyOtp(data: VerifyEmailRequest): Promise<string> {
    const response = await apiClient.post<string>('/api/auth/verify-otp', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<string> {
    const response = await apiClient.post<string>('/api/auth/login', data);
    return response.data;
  },

  async sendOtp(username: string): Promise<string> {
    const response = await apiClient.post<string>('/api/auth/send-otp', null, {
      params: { username },
    });
    return response.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<string> {
    const response = await apiClient.put<string>('/api/auth/verify-otp', data);
    return response.data;
  },
};
