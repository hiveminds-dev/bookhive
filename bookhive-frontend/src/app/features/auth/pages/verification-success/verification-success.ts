import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideCheck, LucideSparkles } from '@lucide/angular';
import { EmailVerificationService } from '../../services/email-verification';

@Component({
  selector: 'app-verification-success',
  standalone: true,
  imports: [RouterLink, LucideArrowRight, LucideCheck, LucideSparkles],
  templateUrl: './verification-success.html',
  styleUrl: './verification-success.scss',
})
export class VerificationSuccess implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly emailVerificationService = inject(EmailVerificationService);
  readonly logoPath = 'assets/bookhive-logo.png';

  isVerifying = true;
  verificationSucceeded = false;
  message = 'Verifying your email address…';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.showVerificationError('The verification link is missing or invalid.');
      return;
    }

    this.emailVerificationService.verifyEmail(token).subscribe({
      next: (response) => {
        this.isVerifying = false;
        this.verificationSucceeded = true;
        this.message =
          response.role === 'author'
            ? 'Your email is verified. Your author account is still waiting for admin approval.'
            : 'Your email address has been confirmed and your BookHive account is ready to use.';
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        const detail = error.error?.detail;
        this.showVerificationError(
          typeof detail === 'string'
            ? detail
            : 'This verification link is invalid or has expired.',
        );
      },
    });
  }

  private showVerificationError(message: string): void {
    this.isVerifying = false;
    this.verificationSucceeded = false;
    this.message = message;
    this.changeDetector.markForCheck();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
