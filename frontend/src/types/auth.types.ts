export type UserRole = 'USER' | 'ORGANISER';

export interface RegisterRequest {
  name: string;
  username: string; // email format
  password: string; // 8-15 characters
  mobile: string;   // 10 digits starting with 6-9
  role: UserRole;
}

export interface VerifyEmailRequest {
  username: string;
  otp: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ResetPasswordRequest {
  username: string;
  otp: string;
  newPassword: string;
}

export interface JwtClaims {
  sub: string;
  role: UserRole;
  exp: number;
  iat?: number;
}

export interface AuthUser {
  username: string;
  role: UserRole;
  token: string;
}
