import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ReaderChapter {
  page: number;
  title: string;
}

@Component({
  selector: 'app-reader-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './reader-sidebar.html',
  styleUrl: './reader-sidebar.scss'
})
export class ReaderSidebarComponent {

  @Input() bookTitle = '';
  @Input() cover = '';
  @Input() totalPages = 0;
  @Input() rating = 0;
  @Input() currentPage = 1;
  @Input() chapters: ReaderChapter[] = [];

  @Output() chapterSelected = new EventEmitter<ReaderChapter>();

  imageLoadFailed = false;

  onImageError(): void {
    this.imageLoadFailed = true;
  }

  selectChapter(chapter: ReaderChapter): void {
    this.chapterSelected.emit(chapter);
  }
}
