import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-book-review',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, ConfirmationModalComponent],
  templateUrl: './book-review.html',
  styleUrl: './book-review.scss',
})
export class BookReviewComponent {
  private readonly toastService = inject(ToastService);

  readonly currentModeSignal = signal<'overview' | 'reader'>('overview');
  readonly showRejectConfirm = signal<boolean>(false);

  readonly book = {
    title: 'The Architecture of Logic',
    author: 'Jonathan Sterling',
    authorTitle: 'Professor of Logic, Cambridge',
    authorBio: 'Jonathan Sterling is a world-renowned epistemologist specializing in the intersection of philosophy and digital structures.',
    category: 'PHILOSOPHY & SCIENCE',
    rating: '4.9/5',
    reviewsCount: '1,240 reviews',
    readTime: '12 hours',
    pages: '342 pages',
    cover: 'assets/images/book-covers/beyond-good-and-evil.jpg',
    abstract: '"The Architecture of Logic" is a profound exploration into the structural foundations of human reasoning. Jonathan Sterling dissects how logic is not merely a cognitive tool, but a spatial framework through which we construct our understanding of reality.',
    reviewSnippet: 'A masterpiece of clarity. Sterling takes incredibly dense concepts and makes them feel intuitive. The chapter on paradoxes changed my perspective on problem-solving entirely.',
  };

  readonly relatedBooks = [
    { title: 'Cognitive Structures', author: 'Lydia Thorne', cover: 'assets/images/book-covers/quantum-mechanics.jpg' },
    { title: 'The Ethics of AI', author: 'Marcus Vane', cover: 'assets/images/book-covers/the-silent-grove.jpg' },
    { title: 'Infinite Syntax', author: 'Jonathan Sterling', cover: 'assets/images/book-covers/beyond-good-and-evil.jpg' },
    { title: 'Logic & Form', author: 'Sarah P. Chen', cover: 'assets/images/book-covers/quantum-mechanics.jpg' },
  ];

  readonly chapterList = [
    { title: 'Page 1: Introduction', active: false },
    { title: 'Page 2: The Prism Effect', active: false },
    { title: 'Page 3: Vertical Voids', active: false },
    { title: 'Page 4: Shadow Mapping', active: true },
    { title: 'Page 5: Glass Facades', active: false },
    { title: 'Page 6: Natural Cycles', active: false },
  ];

  switchMode(mode: 'overview' | 'reader'): void {
    this.currentModeSignal.set(mode);
  }

  approvePublication(): void {
    this.toastService.success(`" ${this.book.title} " was approved and published!`, 'Book Published');
  }

  requestChanges(): void {
    this.toastService.info(`Revision request sent to ${this.book.author}.`, 'Changes Requested');
  }

  promptReject(): void {
    this.showRejectConfirm.set(true);
  }

  cancelReject(): void {
    this.showRejectConfirm.set(false);
  }

  confirmReject(): void {
    this.showRejectConfirm.set(false);
    this.toastService.warning(`Submission for "${this.book.title}" was rejected.`, 'Submission Rejected');
  }
}
