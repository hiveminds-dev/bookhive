import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class AdminProfile implements OnInit {
  private readonly auth = inject(Auth);
  private readonly toastService = inject(ToastService);

  readonly user = this.auth.currentUser;

  fullName = '';
  email = '';

  isEditingProfile = signal(false);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  showOTPModal = signal(false);
  otpCode = '';

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: (u) => {
        this.fullName = u.full_name;
        this.email = u.email;
      },
      error: () => {
        this.fullName = this.user()?.full_name ?? 'Administrator';
        this.email = this.user()?.email ?? 'admin@bookhive.com';
      }
    });
  }

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

  enableEditMode(): void {
    this.isEditingProfile.set(true);
  }

  cancelEditMode(): void {
    this.isEditingProfile.set(false);
    this.fullName = this.user()?.full_name ?? this.fullName;
  }

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword.update(v => !v);
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }

  closeOTPModal(): void {
    this.showOTPModal.set(false);
    this.otpCode = '';
  }

  saveProfile(): void {
    if (!this.fullName.trim()) {
      this.toastService.error('Full Name is required.', 'Validation Error');
      return;
    }

    this.auth.updateProfile(this.fullName.trim(), this.email.trim()).subscribe({
      next: (updatedUser) => {
        this.fullName = updatedUser.full_name;
        this.email = updatedUser.email;
        this.isEditingProfile.set(false);
        this.toastService.success('Profile details updated successfully in database!', 'Profile Updated');
      },
      error: (err) => {
        const msg = err.error?.detail || 'Failed to update profile details.';
        this.toastService.error(msg, 'Update Error');
      }
    });
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
    if (this.newPassword.length < 6) {
      this.toastService.error('New password must be at least 6 characters.', 'Validation Error');
      return;
    }

    this.auth.requestPasswordOTP(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.otpCode = '';
        this.showOTPModal.set(true);
        this.toastService.success(`Verification code dispatched to ${this.email}.`, 'Code Sent');
      },
      error: (err) => {
        const msg = err.error?.detail || 'Failed to request password verification code.';
        this.toastService.error(msg, 'Verification Error');
      }
    });
  }

  confirmPasswordChangeWithOTP(): void {
    if (!this.otpCode.trim() || this.otpCode.trim().length !== 6) {
      this.toastService.error('Please enter the valid 6-digit verification code.', 'Validation Error');
      return;
    }

    this.auth.verifyPasswordOTP(this.otpCode.trim(), this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.toastService.success('Password updated successfully in database!', 'Security');
        this.showOTPModal.set(false);
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.otpCode = '';
        this.showCurrentPassword.set(false);
        this.showNewPassword.set(false);
        this.showConfirmPassword.set(false);
      },
      error: (err) => {
        const msg = err.error?.detail || 'Invalid or expired verification code.';
        this.toastService.error(msg, 'Verification Error');
      }
    });
  }
}
