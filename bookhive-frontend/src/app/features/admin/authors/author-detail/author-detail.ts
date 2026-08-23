import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-author-detail',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './author-detail.html',
  styleUrl: './author-detail.scss',
})
export class AuthorDetailComponent {
  private readonly toastService = inject(ToastService);

  readonly author = {
    id: 201,
    fullName: 'Eleanor Vance',
    penName: 'E. V. Sterling',
    email: 'eleanor.v@lumina.com',
    role: 'Verified Author',
    status: 'Approved',
    country: 'United Kingdom',
    appliedDate: 'Oct 12, 2023',
    bio: 'Author of classical and dark philosophy literature focusing on the intersection of ancient reason and modern logic systems.',
    totalBooks: 4,
    totalDownloads: '12.4k',
    rating: '4.9/5',
    avatar: 'assets/images/auth/sign_in_1.png'
  };

  readonly publishedBooks = [
    { title: 'Beyond Good and Evil', category: 'Philosophy', reads: '8.4k', status: 'Published', cover: 'assets/images/book-covers/beyond-good-and-evil.jpg' },
    { title: 'The Silent Grove', category: 'Fiction', reads: '4.0k', status: 'Published', cover: 'assets/images/book-covers/the-silent-grove.jpg' },
  ];

  approveAuthor(): void {
    this.toastService.success(`Approved author credentials for ${this.author.fullName}.`, 'Author Approved');
  }

  suspendAuthor(): void {
    this.toastService.warning(`Suspended author account for ${this.author.fullName}.`, 'Author Suspended');
  }
}
