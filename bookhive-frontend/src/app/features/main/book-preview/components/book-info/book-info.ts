import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-book-info',
  standalone: true,
  imports: [],
  templateUrl: './book-info.html',
  styleUrl: './book-info.scss'
})
export class BookInfoComponent {

  @Input() rating = 0;
  @Input() reviews = 0;
  @Input() pages?: number | null = null;
  @Input() readingTime?: string | null = null;
}
