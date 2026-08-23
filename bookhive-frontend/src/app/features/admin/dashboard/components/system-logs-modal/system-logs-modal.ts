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
=======
  imports: [NgFor],
  templateUrl: './system-logs-modal.html',
  styleUrl: './system-logs-modal.scss',
})
export class SystemLogsModalComponent {
  @Output() close = new EventEmitter<void>();

  readonly logs = [
    { timestamp: '2026-08-22 12:44:01', level: 'INFO', module: 'AuthService', message: 'User session verified successfully.' },
    { timestamp: '2026-08-22 12:40:15', level: 'SUCCESS', module: 'BookRepository', message: 'Book "Beyond Good and Evil" published.' },
    { timestamp: '2026-08-22 12:35:50', level: 'WARN', module: 'StorageService', message: 'Cache utilization reached 64% threshold.' },
    { timestamp: '2026-08-22 12:28:10', level: 'INFO', module: 'CommunityService', message: 'New discussion topic created by Elena J.' },
    { timestamp: '2026-08-22 12:15:33', level: 'INFO', module: 'AnalyticsService', message: 'Daily metrics aggregated successfully.' },
  ];
>>>>>>> origin/develop

  dismiss(): void {
    this.close.emit();
  }
}
