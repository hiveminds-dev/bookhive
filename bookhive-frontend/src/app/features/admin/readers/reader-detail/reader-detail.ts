import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-reader-detail',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './reader-detail.html',
  styleUrl: './reader-detail.scss',
})
export class ReaderDetailComponent {
  private readonly toastService = inject(ToastService);

  readonly reader = {
    id: 101,
    name: 'Marcus Wright',
    email: 'marcus.w@lumina.org',
    role: 'Reader',
    status: 'Active',
    joined: 'Jan 15, 2024',
    location: 'United States',
    totalReadTime: '48 hours',
    completedBooksCount: 14,
    savedBooksCount: 28,
  };

  readonly readingHistory = [
    { title: 'Beyond Good and Evil', author: 'F. Nietzsche', progress: '100%', status: 'Completed', cover: 'assets/images/book-covers/beyond-good-and-evil.jpg' },
    { title: 'Quantum Mechanics', author: 'Dr. Sarah Chen', progress: '65%', status: 'In Progress', cover: 'assets/images/book-covers/quantum-mechanics.jpg' },
  ];

  suspendAccount(): void {
    this.toastService.warning(`Suspended reader account for ${this.reader.name}.`, 'Account Suspended');
  }

  resetPassword(): void {
    this.toastService.info(`Password reset link emailed to ${this.reader.email}.`, 'Reset Email Sent');
  }
}
