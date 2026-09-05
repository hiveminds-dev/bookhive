import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-welcome-section',
  standalone: true,
  imports: [],
  templateUrl: './welcome-section.html',
  styleUrl: './welcome-section.scss'
})
export class WelcomeSectionComponent {

  @Input() authorName = 'Author';
  @Input() newReviewCount = 2;
  @Input() readyManuscriptCount = 1;

  @Output() uploadBook = new EventEmitter<void>();

  onUploadBook(): void {
    this.uploadBook.emit();
  }
}
