import {
  Component
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

@Component({
  selector: 'app-author-request-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './request-header.html',
  styleUrl: './request-header.scss'
})
export class RequestHeaderComponent {}
