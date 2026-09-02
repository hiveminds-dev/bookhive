import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminApiService, ReaderDetailAdminResponse } from '../../../../core/services/admin-api.service';

@Component({
  selector: 'app-reader-detail',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, DatePipe],
  templateUrl: './reader-detail.html',
  styleUrl: './reader-detail.scss',
})
export class ReaderDetailComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly adminApi = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);

  readonly reader = signal<ReaderDetailAdminResponse | null>(null);
  readonly loading = signal<boolean>(true);
  readonly isProcessing = signal<boolean>(false);
  readonly showConfirmModal = signal<boolean>(false);
  readonly confirmActionType = signal<'suspend' | 'reactivate' | 'reset-password' | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    if (id) {
      this.loadReaderDetail(id);
    } else {
      this.loading.set(false);
    }
  }

  loadReaderDetail(id: number): void {
    this.loading.set(true);
    this.adminApi.getReaderDetail(id).subscribe({
      next: (data) => {
        this.loading.set(false);
        this.isProcessing.set(false);
        this.reader.set(data);
      },
      error: (err) => {
        this.loading.set(false);
        this.isProcessing.set(false);
        this.toastService.error(err.error?.detail || 'Failed to load reader profile.', 'Error');
      },
    });
  }

  getInitials(name: string): string {
    if (!name) return 'RD';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  promptSuspend(): void {
    this.confirmActionType.set('suspend');
    this.showConfirmModal.set(true);
  }

  promptReactivate(): void {
    this.confirmActionType.set('reactivate');
    this.showConfirmModal.set(true);
  }

  promptResetPassword(): void {
    this.confirmActionType.set('reset-password');
    this.showConfirmModal.set(true);
  }

  cancelConfirm(): void {
    if (this.isProcessing()) return;
    this.showConfirmModal.set(false);
    this.confirmActionType.set(null);
  }

  confirmAction(): void {
    const r = this.reader();
    const action = this.confirmActionType();
    if (!r || !action || this.isProcessing()) return;

    this.isProcessing.set(true);

    if (action === 'suspend' || action === 'reactivate') {
      const newStatus = action === 'suspend' ? 'suspended' : 'active';
      this.adminApi.updateReaderStatus(r.id, newStatus).subscribe({
        next: (res) => {
          this.showConfirmModal.set(false);
          this.confirmActionType.set(null);
          this.toastService.success(
            res.message || `Reader account successfully ${action === 'suspend' ? 'suspended' : 'reactivated'}.`,
            action === 'suspend' ? 'Account Suspended' : 'Account Reactivated'
          );
          this.loadReaderDetail(r.id);
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.toastService.error(err.error?.detail || 'Failed to update reader account status.', 'Status Error');
        },
      });
    } else if (action === 'reset-password') {
      this.adminApi.resetReaderPassword(r.id).subscribe({
        next: (res) => {
          this.isProcessing.set(false);
          this.showConfirmModal.set(false);
          this.confirmActionType.set(null);
          this.toastService.success(
            res.message || `Password reset instructions sent to ${r.email}.`,
            'Reset Email Sent'
          );
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.toastService.error(err.error?.detail || 'Failed to send password reset email.', 'Reset Failed');
        },
      });
    }
  }
}
