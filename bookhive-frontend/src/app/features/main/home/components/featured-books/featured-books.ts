import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideArrowRight,
  LucideBookOpen,
  LucideLibrary,
  LucideRotateCw,
} from '@lucide/angular';
import { CatalogueBook } from '../../../../../core/services/book.service';

@Component({
  selector: 'app-featured-books',
  standalone: true,
  imports: [
    RouterLink,
    LucideBookOpen,
    LucideArrowRight,
    LucideAlertCircle,
    LucideRotateCw,
    LucideLibrary,
  ],
  templateUrl: './featured-books.html',
  styleUrl: './featured-books.scss',
})
export class FeaturedBooksComponent {
  private readonly changeDetector = inject(ChangeDetectorRef);

  @Input() books: CatalogueBook[] = [];
  @Input() isLoading = false;
  @Input() hasError = false;

  @Output() bookSelected = new EventEmitter<number>();
  @Output() retryClick = new EventEmitter<void>();
  @Output() exploreAllClick = new EventEmitter<void>();

  readonly skeletonCount = [1, 2, 3, 4, 5, 6, 7, 8];
  readonly failedCovers = new Set<number>();

  hasCover(book: CatalogueBook): boolean {
    return Boolean(book.cover_url && !this.failedCovers.has(book.id));
  }

  onCoverError(bookId: number): void {
    if (!this.failedCovers.has(bookId)) {
      this.failedCovers.add(bookId);
      this.changeDetector.markForCheck();
    }
  }

  onSelectBook(bookId: number): void {
    this.bookSelected.emit(bookId);
  }

  onRetry(): void {
    this.retryClick.emit();
  }

  onExploreAll(): void {
    this.exploreAllClick.emit();
  }
}
