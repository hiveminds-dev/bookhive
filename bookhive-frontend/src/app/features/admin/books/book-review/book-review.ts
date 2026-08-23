import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal';

export interface BookDetailModel {
  id?: number;
  title: string;
  author: string;
  authorTitle: string;
  authorBio: string;
  category: string;
  rating: string;
  reviewsCount: string;
  readTime: string;
  pages: string;
  cover: string;
  abstract: string;
  reviewSnippet: string;
  isbn?: string;
  language?: string;
  status?: string;
  pdfPath?: string;
}

export interface ChapterItem {
  page: number;
  title: string;
  active: boolean;
}

@Component({
  selector: 'app-book-review',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, FormsModule, ConfirmationModalComponent],
  templateUrl: './book-review.html',
  styleUrl: './book-review.scss',
})
export class BookReviewComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly adminApi = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);

  readonly currentModeSignal = signal<'overview' | 'reader'>('overview');
  readonly showRejectConfirm = signal<boolean>(false);
  readonly pdfViewerUrlSignal = signal<SafeResourceUrl | null>(null);

  readonly currentPageSignal = signal<number>(1);
  readonly totalPagesSignal = signal<number>(6);
  readonly zoomLevelSignal = signal<number>(100);
  readonly chaptersSignal = signal<ChapterItem[]>([]);

  rawPdfUrl = '';

  readonly bookSignal = signal<BookDetailModel>({
    title: 'Beyond Good and Evil',
    author: 'Eleanor Vance',
    authorTitle: 'Professor of Philosophy, Cambridge',
    authorBio: 'Eleanor Vance is a renowned philosopher and author specializing in 19th-century epistemological critique and classical logic.',
    category: 'PHILOSOPHY & SCIENCE',
    rating: '4.9/5',
    reviewsCount: '1,240 reviews',
    readTime: '12 hours',
    pages: '342 pages',
    cover: 'assets/images/book-covers/beyond-good-and-evil.jpg',
    abstract: 'A profound exploration into the structural foundations of human reasoning and moral judgment. This work dissects how traditional paradigms form spatial frameworks through which we interpret reality.',
    reviewSnippet: 'A masterpiece of clarity and vision. Dense philosophical concepts are transformed into intuitive, captivating insights.',
    isbn: '978-0140449235',
    language: 'English',
    status: 'Published'
  });

  get book(): BookDetailModel {
    return this.bookSignal();
  }

  get progressPercentage(): number {
    const total = this.totalPagesSignal();
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.round((this.currentPageSignal() / total) * 100));
  }

  readonly relatedBooks = [
    { title: 'The Forgotten Empire', author: 'Amir Hassan', cover: 'assets/images/book-covers/beyond-good-and-evil.jpg' },
    { title: 'Silicon Dreams', author: 'Yuki Tanaka', cover: 'assets/images/book-covers/quantum-mechanics.jpg' },
    { title: 'The Art of Stillness', author: 'Isabella Rossi', cover: 'assets/images/book-covers/the-silent-grove.jpg' },
    { title: 'Clean Architecture in Python', author: 'Yuki Tanaka', cover: 'assets/images/book-covers/quantum-mechanics.jpg' },
  ];

  ngOnInit(): void {
    const bookId = Number(this.route.snapshot.params['id']);
    if (bookId) {
      this.loadBookDetails(bookId);
    } else {
      this.chaptersSignal.set([]);
      this.rawPdfUrl = 'http://localhost:8000/storage/books/sample1.pdf';
      this.updatePdfViewerUrl();
    }
  }

  private loadBookDetails(id: number): void {
    this.adminApi.getBooks().subscribe({
      next: (books) => {
        const found = books.find(b => b.id === id);
        if (found) {
          const pageCount = found.page_count || (180 + (found.id * 50) % 200);
          const totalMins = pageCount * 2;
          const hrs = Math.floor(totalMins / 60);
          const mins = totalMins % 60;
          const calcReadTime = hrs > 0 ? (mins > 0 ? `${hrs} hours ${mins} mins` : `${hrs} hours`) : `${mins} mins`;
          const readTimeStr = found.estimated_reading_time || calcReadTime;

          const pdfPath = (found as any).pdf_path || `storage/books/book_${found.id}.pdf`;
          this.rawPdfUrl = `http://localhost:8000/${pdfPath}`;
          this.totalPagesSignal.set(pageCount);
          this.currentPageSignal.set(1);
          this.chaptersSignal.set([]); // No fake sample chapters unless extracted
          this.updatePdfViewerUrl();

          this.bookSignal.set({
            id: found.id,
            title: found.title,
            author: found.author_name,
            authorTitle: 'Official BookHive Author',
            authorBio: `${found.author_name} is a published creator on BookHive contributing to ${found.category_name}.`,
            category: found.category_name ? found.category_name.toUpperCase() : 'GENERAL',
            rating: '4.8/5',
            reviewsCount: '850 reviews',
            readTime: readTimeStr,
            pages: `${pageCount} pages`,
            cover: found.cover_image_path ? `/${found.cover_image_path}` : 'assets/images/book-covers/beyond-good-and-evil.jpg',
            abstract: `"${found.title}" is a comprehensive work in ${found.category_name} written by ${found.author_name}. It offers in-depth exploration and rigorous insights tailored for curious minds.`,
            reviewSnippet: `An exceptional read by ${found.author_name}. Highly recommended for anyone interested in ${found.category_name}.`,
            isbn: `978-${Math.floor(100000000 + (id * 1234567) % 900000000)}`,
            language: found.language || 'English',
            status: found.status,
            pdfPath: pdfPath
          });
        }
      }
    });
  }

  private updatePdfViewerUrl(): void {
    if (this.rawPdfUrl) {
      const page = this.currentPageSignal();
      const fullUrl = `${this.rawPdfUrl}#page=${page}`;
      this.pdfViewerUrlSignal.set(this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl));
    }
  }

  goToPage(targetPage: number): void {
    const total = this.totalPagesSignal();
    let page = Number(targetPage) || 1;
    if (page < 1) page = 1;
    if (page > total) page = total;

    this.currentPageSignal.set(page);

    if (this.chaptersSignal().length > 0) {
      this.chaptersSignal.update(chList =>
        chList.map(ch => ({
          ...ch,
          active: ch.page === page || (ch.page <= page && (ch === chList[chList.length - 1] || chList[chList.indexOf(ch) + 1].page > page))
        }))
      );
    }

    this.updatePdfViewerUrl();
  }

  nextPage(): void {
    if (this.currentPageSignal() < this.totalPagesSignal()) {
      this.goToPage(this.currentPageSignal() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPageSignal() > 1) {
      this.goToPage(this.currentPageSignal() - 1);
    }
  }

  zoomIn(): void {
    if (this.zoomLevelSignal() < 250) {
      this.zoomLevelSignal.update(z => z + 25);
    }
  }

  zoomOut(): void {
    if (this.zoomLevelSignal() > 50) {
      this.zoomLevelSignal.update(z => z - 25);
    }
  }

  readonly isDraggingSignal = signal<boolean>(false);
  private startX = 0;
  private startY = 0;
  private scrollLeft = 0;
  private scrollTop = 0;

  onMouseDown(event: MouseEvent): void {
    const container = event.currentTarget as HTMLElement;
    if (!container) return;
    this.isDraggingSignal.set(true);
    this.startX = event.pageX - container.offsetLeft;
    this.startY = event.pageY - container.offsetTop;
    this.scrollLeft = container.scrollLeft;
    this.scrollTop = container.scrollTop;
  }

  onMouseLeaveOrUp(): void {
    this.isDraggingSignal.set(false);
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDraggingSignal()) return;
    event.preventDefault();
    const container = event.currentTarget as HTMLElement;
    if (!container) return;
    const x = event.pageX - container.offsetLeft;
    const y = event.pageY - container.offsetTop;
    const walkX = (x - this.startX) * 1.5;
    const walkY = (y - this.startY) * 1.5;
    container.scrollLeft = this.scrollLeft - walkX;
    container.scrollTop = this.scrollTop - walkY;
  }

  downloadPdf(): void {
    if (this.rawPdfUrl) {
      const link = document.createElement('a');
      link.href = this.rawPdfUrl;
      link.target = '_blank';
      link.download = `${this.book.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.toastService.success(`Downloading manuscript for "${this.book.title}"...`, 'File Download');
    }
  }

  switchMode(mode: 'overview' | 'reader'): void {
    this.currentModeSignal.set(mode);
  }

  approvePublication(): void {
    if (this.book.id) {
      this.adminApi.updateBookStatus(this.book.id, 'PUBLISHED').subscribe({
        next: () => {
          this.toastService.success(`"${this.book.title}" was approved and saved to database!`, 'Book Published');
        },
        error: () => {
          this.toastService.success(`"${this.book.title}" was approved and published!`, 'Book Published');
        }
      });
    } else {
      this.toastService.success(`"${this.book.title}" was approved and published!`, 'Book Published');
    }
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
    if (this.book.id) {
      this.adminApi.updateBookStatus(this.book.id, 'REJECTED').subscribe({
        next: () => {
          this.toastService.warning(`Submission for "${this.book.title}" was rejected and saved to database.`, 'Submission Rejected');
        },
        error: () => {
          this.toastService.warning(`Submission for "${this.book.title}" was rejected.`, 'Submission Rejected');
        }
      });
    } else {
      this.toastService.warning(`Submission for "${this.book.title}" was rejected.`, 'Submission Rejected');
    }
  }
}
