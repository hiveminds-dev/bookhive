import { Component, EventEmitter, Output } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-system-logs-modal',
  standalone: true,
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

  dismiss(): void {
    this.close.emit();
  }
}
