import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';

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

  getAccessToken(): string | null {
    return this.storage.get(ACCESS_TOKEN_KEY);
  }

  hasRole(role: UserRole): boolean {
    return this.isAuthenticated() && this.currentUserSignal()?.role === role;
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
