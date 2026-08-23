import {
  Component
} from '@angular/core';

export interface AboutStatistic {
  id: number;
  value: string;
  label: string;
}

@Component({
  selector: 'app-about-statistics',
  standalone: true,
  imports: [],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss'
})
export class Statistics {

  readonly statistics: AboutStatistic[] = [
    {
      id: 1,
      value: '12,800+',
      label: 'Books'
    },
    {
      id: 2,
      value: '2,560+',
      label: 'Authors'
    },
    {
      id: 3,
      value: '25,600+',
      label: 'Readers'
    },
    {
      id: 4,
      value: '128,000+',
      label: 'Downloads'
    }
  ];
}
