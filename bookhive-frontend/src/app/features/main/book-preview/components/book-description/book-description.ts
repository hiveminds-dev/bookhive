import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-book-description',
  standalone: true,
  imports: [],
  templateUrl: './book-description.html',
  styleUrl: './book-description.scss'
})
export class BookDescriptionComponent {

  @Input() title = 'Abstract';
  @Input() paragraphs: string[] = [];
}
