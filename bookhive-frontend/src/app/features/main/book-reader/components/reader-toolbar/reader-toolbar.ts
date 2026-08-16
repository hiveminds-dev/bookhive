import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-reader-toolbar',
  standalone: true,
  imports: [],
  templateUrl: './reader-toolbar.html',
  styleUrl: './reader-toolbar.scss'
})
export class ReaderToolbarComponent {

  @Input() zoomLevel = 100;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() bookmarked = false;

  @Output() zoomIn = new EventEmitter<void>();
  @Output() zoomOut = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() bookmarkChanged = new EventEmitter<boolean>();
  @Output() download = new EventEmitter<void>();
  @Output() fullscreen = new EventEmitter<void>();

  onZoomIn(): void {
    this.zoomIn.emit();
  }

  onZoomOut(): void {
    this.zoomOut.emit();
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.previousPage.emit();
    }
  }

  onNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.nextPage.emit();
    }
  }

  toggleBookmark(): void {
    this.bookmarked = !this.bookmarked;
    this.bookmarkChanged.emit(this.bookmarked);
  }

  onDownload(): void {
    this.download.emit();
  }

  onFullscreen(): void {
    this.fullscreen.emit();
  }
}
