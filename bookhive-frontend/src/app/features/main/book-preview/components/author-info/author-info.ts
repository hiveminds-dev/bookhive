import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-author-info',
  standalone: true,
  imports: [],
  templateUrl: './author-info.html',
  styleUrl: './author-info.scss'
})
export class AuthorInfoComponent {

  @Input() name = '';
  @Input() role = 'Author';
  @Input() image = '';
  @Input() biography = '';

  imageLoadFailed = false;

  onImageError(): void {
    this.imageLoadFailed = true;
  }
}
