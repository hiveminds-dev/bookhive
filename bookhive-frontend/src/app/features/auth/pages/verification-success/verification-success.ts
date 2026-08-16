import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideCheck, LucideSparkles } from '@lucide/angular';

@Component({
  selector: 'app-verification-success',
  standalone: true,
  imports: [RouterLink, LucideArrowRight, LucideCheck, LucideSparkles],
  templateUrl: './verification-success.html',
  styleUrl: './verification-success.scss',
})
export class VerificationSuccess {
  private readonly router = inject(Router);
  readonly logoPath = 'assets/bookhive-logo.png';

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
