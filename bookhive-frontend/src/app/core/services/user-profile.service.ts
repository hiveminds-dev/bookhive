import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UserRole } from '../../features/auth/models/login';

export interface UserProfile {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: UserRole;
  account_status: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  country: string | null;
  preferred_language: string | null;
  short_bio: string | null;
  profile_image_path: string | null;
  profile_image_url: string | null;
}

export interface UserProfileUpdate {
  full_name?: string;
  username?: string;
  country?: string | null;
  preferred_language?: string | null;
  short_bio?: string | null;
}

export interface ProfileImageResponse {
  message: string;
  profile_image_path: string;
  profile_image_url: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private readonly http = inject(HttpClient);

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>('/api/users/me');
  }

  updateMyProfile(data: UserProfileUpdate): Observable<UserProfile> {
    return this.http.patch<UserProfile>('/api/users/me', data);
  }

  uploadProfileImage(file: File): Observable<ProfileImageResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ProfileImageResponse>('/api/users/me/profile-image', formData);
  }

  deleteProfileImage(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>('/api/users/me/profile-image');
  }
}
