import {
  Component
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

@Component({
  selector: 'app-about-cta',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './cta.html',
  styleUrl: './cta.scss'
})
export class Cta {
}
