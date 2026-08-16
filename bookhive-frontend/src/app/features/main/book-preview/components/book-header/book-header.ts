import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-book-header',
  standalone: true,
  imports: [],
  templateUrl: './book-header.html',
  styleUrl: './book-header.scss'
})
export class BookHeaderComponent {

  @Input() category = '';
  @Input() title = '';
  @Input() author = '';
  @Input() language = 'English';
}
