import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verification-success',
  standalone: true,
  templateUrl: './verification-success.html',
  styleUrl: './verification-success.scss'
})
export class VerificationSuccess {

  private readonly router = inject(Router);

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
