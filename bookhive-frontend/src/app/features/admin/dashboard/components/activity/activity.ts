import { Component, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  readonly showLogsModalSignal = signal<boolean>(false);

  openLogs(): void {
    this.showLogsModalSignal.set(true);
  }

  closeLogs(): void {
    this.showLogsModalSignal.set(false);
  }

  addCategory(): void {
    this.toastService.info('Opening Add Category form...', 'Categories');
  }
}
