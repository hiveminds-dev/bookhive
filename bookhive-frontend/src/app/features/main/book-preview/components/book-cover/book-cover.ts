import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-book-cover',
  standalone: true,
  imports: [],
  templateUrl: './book-cover.html',
  styleUrl: './book-cover.scss'
})
export class BookCoverComponent {

  @Input() title = '';
  @Input() cover = '';
  @Input() badge = 'Premium';

  imageLoadFailed = false;

  onImageError(): void {
    this.imageLoadFailed = true;
  }
}
