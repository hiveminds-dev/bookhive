import { Component, computed, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../core/services/auth';

import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal';

import {
  LucideLayoutDashboard,
  LucideBook,
  LucideList,
  LucideUsers,
  LucideNetwork,
  LucideBarChart2,
  LucideShieldCheck,
  LucideCircleUser,
  LucideHelpCircle,
  LucideLogOut,
  LucideSearch,
  LucideBell,
  LucideGrid2X2,
} from '@lucide/angular';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastContainerComponent,
    ConfirmationModalComponent,
    LucideLayoutDashboard,
    LucideBook,
    LucideList,
    LucideUsers,
    LucideNetwork,
    LucideBarChart2,
    LucideShieldCheck,
    LucideCircleUser,
    LucideHelpCircle,
    LucideLogOut,
    LucideSearch,
    LucideBell,
    LucideGrid2X2,
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly user = this.auth.currentUser;
  readonly showLogoutConfirmSignal = signal<boolean>(false);
  readonly activeTopbarMenu = signal<'notifications' | 'quick' | 'profile' | null>(null);

  readonly notifications = [
    { title: 'Pending manuscript reviews', meta: 'Books awaiting editorial action' },
    { title: 'Author applications', meta: 'New creator approvals to review' },
    { title: 'Support queue', meta: 'Open admin assistance requests' },
  ];

  readonly quickLinks = [
    { label: 'Dashboard', route: '/admin/dashboard' },
    { label: 'Books', route: '/admin/books' },
    { label: 'Authors', route: '/admin/authors' },
    { label: 'Categories', route: '/admin/categories' },
    { label: 'Statistics', route: '/admin/statistics' },
    { label: 'Support', route: '/admin/support' },
  ];

  readonly displayName = computed(
    () => this.user()?.full_name ?? 'Administrator'
  );

  readonly roleLabel = computed(
    () => this.user()?.role === 'super_admin'
      ? 'Super Admin'
      : 'Administrator'
  );

  readonly isSuperAdmin = computed(
    () => this.user()?.role === 'super_admin'
  );

  toggleTopbarMenu(menu: 'notifications' | 'quick' | 'profile'): void {
    this.activeTopbarMenu.update((current) => current === menu ? null : menu);
  }

  closeTopbarMenu(): void {
    this.activeTopbarMenu.set(null);
  }

  promptLogout(): void {
    this.closeTopbarMenu();
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
