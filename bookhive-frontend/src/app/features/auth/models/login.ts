export type UserRole = 'reader' | 'author' | 'admin' | 'super_admin';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: UserRole;
  account_status: string;
  email_verified: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: AuthenticatedUser;
}
