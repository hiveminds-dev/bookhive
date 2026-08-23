import { Component, Input, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast.service';
import { SystemLogsModalComponent } from '../system-logs-modal/system-logs-modal';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [NgIf, RouterLink, SystemLogsModalComponent],
  templateUrl: './activity.html',
  styleUrl: './activity.scss',
})
export class Activity {
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  @Input() isSuperAdmin = false;

  readonly showLogsModalSignal = signal<boolean>(false);

  openLogs(): void {
    this.showLogsModalSignal.set(true);
  }

  closeLogs(): void {
    this.showLogsModalSignal.set(false);
  }

  addCategory(): void {
    this.router.navigate(['/admin/categories']);
  }

  manageAdmins(): void {
    this.router.navigate(['/admin/admins']);
  }
}
