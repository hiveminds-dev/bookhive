import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-statistics',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss',
})
export class AdminStatisticsComponent {
  private readonly toastService = inject(ToastService);

  readonly monthlyUploads = [
    { month: 'JAN', dark: 40, light: 30 },
    { month: 'FEB', dark: 60, light: 20 },
    { month: 'MAR', dark: 30, light: 45 },
    { month: 'APR', dark: 80, light: 15 },
    { month: 'MAY', dark: 45, light: 35 },
    { month: 'JUN', dark: 70, light: 25 },
  ];

  readonly monthlyRegs = [
    { month: 'JAN', val: 55 },
    { month: 'FEB', val: 70 },
    { month: 'MAR', val: 48 },
    { month: 'APR', val: 82 },
    { month: 'MAY', val: 65 },
    { month: 'JUN', val: 92 },
  ];

  readonly topCategories = [
    { name: 'Philosophy & Logic', pct: 42 },
    { name: 'Classic Literature', pct: 28 },
    { name: 'Science & Nature', pct: 18 },
    { name: 'Art & Design', pct: 12 },
  ];

  readonly mostReadBooks = [
    {
      title: 'Meditations',
      author: 'Marcus Aurelius',
      category: 'Philosophy',
      totalReads: '12,402',
      rating: '4.9',
      trend: '+5.2%',
      cover: 'assets/images/book-covers/beyond-good-and-evil.jpg'
    },
    {
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      category: 'Fiction',
      totalReads: '10,115',
      rating: '4.8',
      trend: '+12.4%',
      cover: 'assets/images/book-covers/the-silent-grove.jpg'
    },
    {
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      category: 'History',
      totalReads: '9,842',
      rating: '4.7',
      trend: '-1.8%',
      cover: 'assets/images/book-covers/quantum-mechanics.jpg'
    }
  ];

  readonly activeAuthors = [
    {
      name: 'Dr. Elena Rostova',
      booksCount: 12,
      score: '98.4',
      avatar: 'assets/images/auth/sign_in_1.png'
    },
    {
      name: 'Julian Vane',
      booksCount: 8,
      score: '92.1',
      avatar: 'assets/images/auth/sign_in_1.png'
    },
    {
      name: 'Sarah Jenkins',
      booksCount: 15,
      score: '89.8',
      avatar: 'assets/images/auth/sign_in_1.png'
    }
  ];

  readonly activeReaders = [
    {
      name: 'John Doe',
      joined: 'Joined Jan 2024',
      totalReads: 342,
      initials: 'JD'
    },
    {
      name: 'Emily Chen',
      joined: 'Joined March 2024',
      totalReads: 289,
      initials: 'EC'
    },
    {
      name: 'Michael K.',
      joined: 'Joined Feb 2024',
      totalReads: 256,
      initials: 'MK'
    }
  ];

  exportPDF(): void {
    this.toastService.success('Generating performance overview PDF export...', 'Export PDF');
  }

  filterDateRange(): void {
    this.toastService.info('Filtering analytics for Last 30 Days.', 'Filter Date');
  }
}
