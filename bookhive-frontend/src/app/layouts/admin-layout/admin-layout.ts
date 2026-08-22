import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../core/services/auth';

import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly user = this.auth.currentUser;

  readonly displayName = computed(
    () => this.user()?.full_name ?? 'Administrator'
  );

  readonly roleLabel = computed(
    () => this.user()?.role === 'super_admin'
      ? 'Super Admin'
      : 'Administrator'
  );

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
