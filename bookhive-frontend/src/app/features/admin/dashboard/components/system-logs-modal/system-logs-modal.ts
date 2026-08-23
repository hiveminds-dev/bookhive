import { Component, EventEmitter, Output, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { AdminApiService, SystemLogItem } from '../../../../../core/services/admin-api.service';

@Component({
  selector: 'app-system-logs-modal',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './system-logs-modal.html',
  styleUrl: './system-logs-modal.scss',
})
export class SystemLogsModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  private readonly adminApi = inject(AdminApiService);

  readonly logs = signal<SystemLogItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.adminApi.getSystemLogs().subscribe({
      next: (data) => {
        this.logs.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  getLevelClass(level: string): string {
    switch (level.toUpperCase()) {
      case 'SUCCESS': return 'success';
      case 'WARN':
      case 'WARNING': return 'warn';
      case 'ERROR': return 'error';
      default: return 'info';
    }
  }

  dismiss(): void {
    this.close.emit();
  }
}
