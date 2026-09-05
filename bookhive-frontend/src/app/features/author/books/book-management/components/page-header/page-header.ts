import {
  Component,
  Input
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

@Component({
  selector: 'app-book-management-page-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss'
})
export class PageHeaderComponent {

  @Input() title = 'Book Management';

  @Input() sectionTitle = 'My Books';

  @Input() description =
    `View, edit, and organize all the books you've uploaded.`;
}
