export type AccountRole = 'reader' | 'author';

export interface ReaderRegistrationRequest {
  full_name: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthorRegistrationRequest {
  full_name: string;
  username: string;
  email: string;
  password: string;
  pen_name: string;
  country: string;
  preferred_language: string;
  short_bio: string;
}

export interface ReaderRegistrationResponse {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: 'reader';
  account_status: 'inactive';
  email_verified: false;
  created_at: string;
}

export interface AuthorRegistrationResponse {
  id: number;
  author_profile_id: number;
  full_name: string;
  username: string;
  email: string;
  role: 'author';
  account_status: 'pending';
  email_verified: false;
  pen_name: string;
  country: string;
  preferred_language: string;
  short_bio: string;
  profile_image_path: string | null;
  created_at: string;
}

export interface AuthorRegistrationResult {
  message: string;
  data: AuthorRegistrationResponse;
}
