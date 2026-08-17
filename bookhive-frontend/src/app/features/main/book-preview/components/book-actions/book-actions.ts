import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-book-actions',
  standalone: true,
  imports: [],
  templateUrl: './book-actions.html',
  styleUrl: './book-actions.scss'
})
export class BookActionsComponent {

  @Input() canDownload = true;

  @Output() readBook = new EventEmitter<void>();
  @Output() downloadBook = new EventEmitter<void>();

  onReadBook(): void {
    this.readBook.emit();
  }

  onDownloadBook(): void {
    if (!this.canDownload) {
      return;
    }

    this.downloadBook.emit();
  }
}
