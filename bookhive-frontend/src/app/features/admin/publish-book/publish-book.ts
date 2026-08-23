import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-publish-book',
  standalone: true,
  imports: [],
  templateUrl: './publish-book.html',
  styleUrl: './publish-book.scss',
})
export class PublishBookComponent {
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly pendingBook = {
    title: 'Modern Architecture',
    isbn: '452-1-09-548122-1',
    author: 'Julian Thorne',
    category: 'Art & Design',
    language: 'English',
    submissionDate: 'Oct 24, 2023',
    description: 'A comprehensive study on contemporary architectural movements and sustainable urban designs.',
    cover: 'assets/images/book-covers/quantum-mechanics.jpg'
  };

  approvePublication(): void {
    this.toastService.success(`Book "${this.pendingBook.title}" has been published!`, 'Publication Approved');
    setTimeout(() => {
      this.router.navigate(['/admin/books']);
    }, 1000);
  }

  rejectPublication(): void {
    this.toastService.warning(`Submission for "${this.pendingBook.title}" returned for revisions.`, 'Publication Rejected');
  }
}
