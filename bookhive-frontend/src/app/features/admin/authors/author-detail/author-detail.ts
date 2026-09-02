import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminApiService, AuthorDetailAdminResponse } from '../../../../core/services/admin-api.service';

@Component({
  selector: 'app-author-detail',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, DatePipe],
  templateUrl: './author-detail.html',
  styleUrl: './author-detail.scss',
})
export class AuthorDetailComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly adminApi = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);

  readonly author = signal<AuthorDetailAdminResponse | null>(null);
  readonly loading = signal<boolean>(true);
  readonly isProcessing = signal<boolean>(false);
  readonly showConfirmModal = signal<boolean>(false);
  readonly confirmActionType = signal<'suspend' | 'reactivate' | 'reset-password' | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    if (id) {
      this.loadAuthorDetail(id);
    } else {
      this.loading.set(false);
    }
  }

  loadAuthorDetail(id: number): void {
    this.loading.set(true);
    this.adminApi.getAuthorDetail(id).subscribe({
      next: (data) => {
        this.loading.set(false);
        this.isProcessing.set(false);
        this.author.set(data);
      },
      error: (err) => {
        this.loading.set(false);
        this.isProcessing.set(false);
        this.toastService.error(err.error?.detail || 'Failed to load author portfolio.', 'Error');
      },
    });
  }

  get formattedViews(): string {
    const views = this.author()?.total_views || 0;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
    return views.toString();
  }

  get formattedDownloads(): string {
    const dls = this.author()?.total_downloads || 0;
    if (dls >= 1000) return `${(dls / 1000).toFixed(1)}k`;
    return dls.toString();
  }

  approveAuthor(): void {
    const a = this.author();
    if (!a) return;

    this.isProcessing.set(true);
    this.adminApi.approveAuthor(a.id).subscribe({
      next: () => {
        this.toastService.success(`Approved author credentials for ${a.full_name}.`, 'Author Approved');
        this.loadAuthorDetail(a.id);
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.toastService.error(err.error?.detail || 'Failed to approve author credentials.', 'Error');
      }
    });
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
    const a = this.author();
    const action = this.confirmActionType();
    if (!a || !action || this.isProcessing()) return;

    this.isProcessing.set(true);

    if (action === 'suspend' || action === 'reactivate') {
      const newStatus = action === 'suspend' ? 'suspended' : 'approved';
      this.adminApi.updateAuthorStatus(a.id, newStatus).subscribe({
        next: (res) => {
          this.showConfirmModal.set(false);
          this.confirmActionType.set(null);
          this.toastService.success(
            res.message || `Author account successfully ${action === 'suspend' ? 'suspended' : 'reactivated'}.`,
            action === 'suspend' ? 'Account Suspended' : 'Account Reactivated'
          );
          this.loadAuthorDetail(a.id);
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.toastService.error(err.error?.detail || 'Failed to update author account status.', 'Status Error');
        },
      });
    } else if (action === 'reset-password') {
      this.adminApi.resetAuthorPassword(a.id).subscribe({
        next: (res) => {
          this.isProcessing.set(false);
          this.showConfirmModal.set(false);
          this.confirmActionType.set(null);
          this.toastService.success(
            res.message || `Password reset instructions sent to ${a.email}.`,
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
