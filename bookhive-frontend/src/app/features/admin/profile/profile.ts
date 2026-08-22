import { Component, computed, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class AdminProfile {
  private readonly auth = inject(Auth);
  private readonly toastService = inject(ToastService);

  readonly user = this.auth.currentUser;

  fullName = this.user()?.full_name ?? 'Administrator';
  email = this.user()?.email ?? 'admin@bookhive.com';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  readonly displayName = computed(
    () => this.user()?.full_name ?? 'Administrator'
  );

  readonly roleLabel = computed(
    () => this.user()?.role === 'super_admin'
      ? 'Super Admin'
      : 'Administrator'
  );

  readonly status = computed(
    () => this.user()?.account_status ?? 'active'
  );

  saveProfile(): void {
    this.toastService.success('Profile details updated successfully!', 'Profile Updated');
  }

  updatePassword(): void {
    if (!this.currentPassword) {
      this.toastService.error('Please enter your current password.', 'Validation Error');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastService.error('New password and confirmation do not match.', 'Password Mismatch');
      return;
    }

    this.toastService.success('Password changed successfully!', 'Security');
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
}
