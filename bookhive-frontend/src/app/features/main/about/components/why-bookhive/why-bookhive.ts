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
      icon: 'collection',
      title: 'Large Book Collection',
      description:
        'Explore a curated catalogue of verified manuscripts across literature, technology, science, and the arts.',
      size: 'large'
    },
    {
      id: 2,
      icon: 'publishing',
      title: 'Easy Publishing',
      description:
        'Zero-hassle upload and formatting tools for authors.',
      size: 'small'
    },
    {
      id: 3,
      icon: 'search',
      title: 'Fast Search',
      description:
        'Find books by title, author, category, language, and reader rating.',
      size: 'small'
    }
  ];
}
