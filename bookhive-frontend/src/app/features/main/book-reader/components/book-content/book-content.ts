import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-book-content',
  standalone: true,
  imports: [],
  templateUrl: './book-content.html',
  styleUrl: './book-content.scss'
})
export class BookContentComponent {

  @Input() chapterNumber = 1;
  @Input() chapterTitle = '';
  @Input() paragraphs: string[] = [];
  @Input() image = '';
  @Input() imageAlt = '';
  @Input() imagePosition = 1;
  @Input() zoomLevel = 100;

  imageLoadFailed = false;

  get zoomScale(): number {
    return this.zoomLevel / 100;
  }

  onImageError(): void {
    this.imageLoadFailed = true;
  }
}
