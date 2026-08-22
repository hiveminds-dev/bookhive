import { Component, computed, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../core/services/auth';

import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [NgIf, RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent, ConfirmationModalComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly user = this.auth.currentUser;
  readonly showLogoutConfirmSignal = signal<boolean>(false);

  readonly displayName = computed(
    () => this.user()?.full_name ?? 'Administrator'
  );

  readonly roleLabel = computed(
    () => this.user()?.role === 'super_admin'
      ? 'Super Admin'
      : 'Administrator'
  );

  promptLogout(): void {
    this.showLogoutConfirmSignal.set(true);
  }

  cancelLogout(): void {
    this.showLogoutConfirmSignal.set(false);
  }

  confirmLogout(): void {
    this.showLogoutConfirmSignal.set(false);
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
