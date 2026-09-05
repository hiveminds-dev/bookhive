import {
  Component
} from '@angular/core';

export interface ReaderLocation {
  id: number;
  country: string;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-book-performance',
  standalone: true,
  imports: [],
  templateUrl: './book-performance.html',
  styleUrl: './book-performance.scss'
})
export class BookPerformanceComponent {

  readonly readerLocations:
    ReaderLocation[] = [
    {
      id: 1,
      country: 'USA',
      percentage: 42,
      color: '#806900'
    },
    {
      id: 2,
      country: 'UK',
      percentage: 18,
      color: '#d4a91f'
    },
    {
      id: 3,
      country: 'Canada',
      percentage: 12,
      color: '#dfc458'
    }
  ];
}
