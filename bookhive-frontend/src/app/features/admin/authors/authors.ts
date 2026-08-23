import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [NgFor],
  templateUrl: './authors.html',
  styleUrl: './authors.scss',
})
export class AuthorsComponent {
  private readonly toastService = inject(ToastService);

  readonly authors = [
    {
      id: 1,
      fullName: 'Eleanor Vance',
      penName: 'E. V. Sterling',
      email: 'eleanor.v@lumina.com',
      country: 'United Kingdom',
      appliedDate: 'Oct 24, 2023',
      avatar: 'assets/images/auth/sign_in_1.png'
    },
    {
      id: 2,
      fullName: 'Julian Thorne',
      penName: 'J. Thistle',
      email: 'j.thorne@writes.org',
      country: 'Canada',
      appliedDate: 'Oct 23, 2023',
      avatar: 'assets/images/auth/sign_in_1.png'
    }
  ];

  approveAuthor(author: any): void {
    this.toastService.success(`Approved ${author.fullName} as an official Author!`, 'Request Approved');
  }

  rejectAuthor(author: any): void {
    this.toastService.warning(`Rejected application for ${author.fullName}.`, 'Request Rejected');
  }

  createCommunity(): void {
    this.toastService.info('Opening Create Community dialogue...', 'Community');
  }
}
