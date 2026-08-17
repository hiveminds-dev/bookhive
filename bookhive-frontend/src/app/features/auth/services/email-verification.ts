import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  EmailVerificationResponse,
  MessageResponse,
} from '../models/email-verification';

@Injectable({ providedIn: 'root' })
export class EmailVerificationService {
  private readonly http = inject(HttpClient);

  verifyEmail(token: string): Observable<EmailVerificationResponse> {
    const params = new HttpParams().set('token', token);
    return this.http.get<EmailVerificationResponse>('/api/auth/verify-email', { params });
  }

  resendVerification(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>('/api/auth/resend-verification', { email });
  }
}
