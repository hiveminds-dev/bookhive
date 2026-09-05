export interface EmailVerificationResponse {
  message: string;
  role: 'reader' | 'author' | 'admin' | 'super_admin';
  account_status: string;
}

export interface MessageResponse {
  message: string;
}
