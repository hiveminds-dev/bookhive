import {
  Component
} from '@angular/core';

export interface BookHiveFeature {
  id: number;
  icon: string;
  title: string;
  description: string;
  size: 'large' | 'small';
}

@Component({
  selector: 'app-why-bookhive',
  standalone: true,
  imports: [],
  templateUrl: './why-bookhive.html',
  styleUrl: './why-bookhive.scss'
})
export class WhyBookhive {

  readonly features: BookHiveFeature[] = [
    {
      id: 1,
      icon: '▥',
      title: 'Large Book Collection',
      description:
        'Access over 50,000 titles across every genre imaginable, from classics to modern hits.',
      size: 'large'
    },
    {
      id: 2,
      icon: '♢',
      title: 'Easy Publishing',
      description:
        'Zero-hassle upload and formatting tools for authors.',
      size: 'small'
    },
    {
      id: 3,
      icon: '⌕',
      title: 'Fast Search',
      description:
        'Instant AI-powered discovery system.',
      size: 'small'
    }
  ];
}
