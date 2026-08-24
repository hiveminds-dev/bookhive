import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, of, tap } from 'rxjs';

import {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
  UserRole,
} from '../../features/auth/models/login';
import { Storage } from './storage';

const ACCESS_TOKEN_KEY = 'bookhive_access_token';
const AUTH_USER_KEY = 'bookhive_auth_user';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(Storage);
  private readonly currentUserSignal = signal<AuthenticatedUser | null>(
    this.readStoredUser(),
  );

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(
    () => !!this.currentUserSignal() && !!this.getAccessToken(),
  );

  login(request: LoginRequest, rememberMe: boolean): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', request).pipe(
      tap((response) => this.storeSession(response, rememberMe)),
    );
  }

  getProfile(): Observable<AuthenticatedUser> {
    return this.http.get<AuthenticatedUser>('/api/auth/me').pipe(
      tap((user) => {
        this.currentUserSignal.set(user);
        const persistent = localStorage.getItem(ACCESS_TOKEN_KEY) !== null;
        this.storage.set(AUTH_USER_KEY, JSON.stringify(user), persistent);
      }),
    );
  }

  updateProfile(fullName: string, email: string): Observable<AuthenticatedUser> {
    return this.http.put<AuthenticatedUser>('/api/auth/me', { full_name: fullName, email }).pipe(
      tap((user) => {
        this.currentUserSignal.set(user);
        const persistent = localStorage.getItem(ACCESS_TOKEN_KEY) !== null;
        this.storage.set(AUTH_USER_KEY, JSON.stringify(user), persistent);
      }),
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  requestPasswordOTP(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/auth/request-password-otp', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  verifyPasswordOTP(otpCode: string, currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/auth/verify-password-otp', {
      otp_code: otpCode,
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  initializeSession(): Observable<AuthenticatedUser | null> {
    if (!this.getAccessToken()) {
      this.clearSession();
      return of(null);
    }

    return this.getProfile().pipe(
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  getAccessToken(): string | null {
    return this.storage.get(ACCESS_TOKEN_KEY);
  }

  hasRole(role: UserRole): boolean {
    return this.isAuthenticated() && this.currentUserSignal()?.role === role;
  }

  getLandingRouteForRole(role: UserRole): string {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return '/admin/dashboard';
      case 'author':
        return '/author/dashboard';
      case 'reader':
      default:
        return '/home';
    }
  }

  getCurrentUserLandingRoute(): string {
    const user = this.currentUserSignal();

    return user
      ? this.getLandingRouteForRole(user.role)
      : '/login';
  }

  logout(): Observable<void> {
    if (!this.getAccessToken()) {
      this.clearSession();
      return of(undefined);
    }

    return this.http.post<void>('/api/auth/logout', {}).pipe(
      finalize(() => this.clearSession()),
    );
  }

  private clearSession(): void {
    this.storage.remove(ACCESS_TOKEN_KEY);
    this.storage.remove(AUTH_USER_KEY);
    this.currentUserSignal.set(null);
  }

  private storeSession(response: LoginResponse, persistent: boolean): void {
    this.storage.set(ACCESS_TOKEN_KEY, response.access_token, persistent);
    this.storage.set(AUTH_USER_KEY, JSON.stringify(response.user), persistent);
    this.currentUserSignal.set(response.user);
  }

  private readStoredUser(): AuthenticatedUser | null {
    const stored = this.storage.get(AUTH_USER_KEY);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthenticatedUser;
    } catch {
      this.storage.remove(AUTH_USER_KEY);
      return null;
    }
  }
}
