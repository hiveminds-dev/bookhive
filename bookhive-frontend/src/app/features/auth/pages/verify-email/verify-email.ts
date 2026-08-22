import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
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
export class VerifyEmail implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly emailVerificationService = inject(EmailVerificationService);

  readonly logoPath = 'assets/bookhive-logo.png';
  email = '';
  isResending = false;
  resendMessage: string | null = null;
  resendError: string | null = null;
  resendCooldownSeconds = 0;
  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
  }

  resendEmail(): void {
    if (!this.email || this.isResending || this.resendCooldownSeconds > 0) {
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
          this.startCooldown(60);
          this.changeDetector.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          const retryAfter = Number(error.headers.get('Retry-After'));
          if (error.status === 429 && Number.isFinite(retryAfter)) {
            this.startCooldown(retryAfter);
          }
          this.resendError =
            error.status === 0
              ? 'Unable to connect to the BookHive server.'
              : error.status === 429
                ? 'Please wait before requesting another verification email.'
                : 'Unable to resend the verification email. Please try again.';
          this.changeDetector.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    if (this.cooldownTimer !== null) {
      clearInterval(this.cooldownTimer);
    }
  }

  private startCooldown(seconds: number): void {
    this.resendCooldownSeconds = Math.max(1, Math.ceil(seconds));
    if (this.cooldownTimer !== null) {
      clearInterval(this.cooldownTimer);
    }

    this.cooldownTimer = setInterval(() => {
      this.resendCooldownSeconds = Math.max(0, this.resendCooldownSeconds - 1);
      if (this.resendCooldownSeconds === 0 && this.cooldownTimer !== null) {
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = null;
      }
      this.changeDetector.markForCheck();
    }, 1000);
  }
}
