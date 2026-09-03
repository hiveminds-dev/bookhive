import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AuthorRegistrationRequest,
  AuthorRegistrationResult,
  ReaderRegistrationRequest,
  ReaderRegistrationResponse,
} from '../models/registration';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private readonly http = inject(HttpClient);

  registerReader(
    request: ReaderRegistrationRequest,
  ): Observable<ReaderRegistrationResponse> {
    return this.http.post<ReaderRegistrationResponse>('/api/users/register', request);
  }

  registerAuthor(
    request: AuthorRegistrationRequest,
  ): Observable<AuthorRegistrationResult> {
    return this.http.post<AuthorRegistrationResult>('/api/authors/register', request);
  }

  checkEmailAvailability(
    email: string,
  ): Observable<{ available: boolean; message?: string }> {
    return this.http.get<{ available: boolean; message?: string }>(
      '/api/auth/check-email',
      { params: { email: email.trim() } },
    );
  }
}
