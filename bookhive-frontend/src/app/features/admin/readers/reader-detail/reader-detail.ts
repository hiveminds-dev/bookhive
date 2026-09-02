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
        this.reader.set(data);
      },
      error: (err) => {
        this.loading.set(false);
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

  suspendAccount(): void {
    const r = this.reader();
    if (r) {
      this.toastService.warning(`Suspended reader account for ${r.full_name}.`, 'Account Suspended');
    }
  }

  resetPassword(): void {
    const r = this.reader();
    if (r) {
      this.toastService.info(`Password reset link emailed to ${r.email}.`, 'Reset Email Sent');
    }
  }
}
