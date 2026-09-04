import { Component, Input, inject, OnInit, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import { AdminApiService, DashboardStats } from '../../../../../core/services/admin-api.service';
import {
  LucideBook,
  LucideUsers,
  LucidePenLine,
  LucideInbox,
  LucideShieldCheck,
  LucideUserCog,
} from '@lucide/angular';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [NgFor, LucideBook, LucideUsers, LucidePenLine, LucideInbox, LucideShieldCheck, LucideUserCog],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss',
})
export class Statistics implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  @Input() isSuperAdmin = false;

  readonly stats = signal<DashboardStats>({
    total_books: 0,
    total_readers: 0,
    total_authors: 0,
    total_admins: 0,
    book_requests: 0,
    author_requests: 0,
  });

  ngOnInit(): void {
    this.adminApi.getDashboardStats().subscribe({
      next: (data) => {
        if (data) {
          this.stats.set(data);
        }
      },
      error: () => {
        // Fallback to initial signals if offline
      }
    });
  }

  get cards() {
    const s = this.stats();
    const base = [
      { iconName: 'lucideBook', label: 'Total Books', value: s.total_books.toLocaleString() },
      { iconName: 'lucideUsers', label: 'Total Readers', value: s.total_readers.toLocaleString() },
      { iconName: 'lucidePenLine', label: 'Total Authors', value: s.total_authors.toLocaleString() },
      { iconName: 'lucideInbox', label: 'Book Requests', value: s.book_requests.toString() },
      { iconName: 'lucideShieldCheck', label: 'Author Requests', value: s.author_requests.toString() },
    ];

    if (this.isSuperAdmin) {
      base.push({
        iconName: 'lucideUserCog',
        label: 'Total Admins',
        value: s.total_admins.toLocaleString(),
      });
    }

    return base;
  }
}
