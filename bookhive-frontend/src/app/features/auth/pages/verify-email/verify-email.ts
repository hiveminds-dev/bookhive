import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  LucideArrowLeft,
  LucideCheck,
  LucideInfo,
  LucideMail,
  LucideRefreshCw,
} from '@lucide/angular';
import { EmailVerificationService } from '../../services/email-verification';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.html',
  imports: [RouterLink, LucideArrowLeft, LucideCheck, LucideInfo, LucideMail, LucideRefreshCw],
  styleUrl: './verify-email.scss',
})
export class VerifyEmail {
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly emailVerificationService = inject(EmailVerificationService);

  readonly logoPath = 'assets/bookhive-logo.png';
  email = '';
  isResending = false;
  resendMessage: string | null = null;
  resendError: string | null = null;

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
  }

  resendEmail(): void {
    if (!this.email || this.isResending) {
      return;
    }

    this.isResending = true;
    this.resendMessage = null;
    this.resendError = null;

    this.emailVerificationService
      .resendVerification(this.email)
      .pipe(
        finalize(() => {
          this.isResending = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.resendMessage = response.message;
          this.changeDetector.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.resendError =
            error.status === 0
              ? 'Unable to connect to the BookHive server.'
              : 'Unable to resend the verification email. Please try again.';
          this.changeDetector.markForCheck();
        },
      });
  }
}
