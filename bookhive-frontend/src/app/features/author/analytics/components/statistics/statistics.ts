import {
  Component
} from '@angular/core';

export interface AnalyticsStatistic {
  id: number;
  icon: string;
  title: string;
  value: string;
  secondaryValue?: string;
  badge?: string;
  badgeType: 'positive' | 'neutral';
  iconType: 'gold' | 'gray' | 'yellow';
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss'
})
export class StatisticsComponent {

  readonly statistics: AnalyticsStatistic[] = [
    {
      id: 1,
      icon: 'views',
      title: 'Total Views',
      value: '0',
      badge: 'Not tracked',
      badgeType: 'neutral',
      iconType: 'gold'
    },
    {
      id: 2,
      icon: 'downloads',
      title: 'Total Downloads',
      value: '0',
      badge: 'Not tracked',
      badgeType: 'neutral',
      iconType: 'gold'
    },
    {
      id: 3,
      icon: 'books',
      title: 'Books Published',
      value: '0',
      badge: 'Lifetime',
      badgeType: 'neutral',
      iconType: 'gray'
    },
    {
      id: 4,
      icon: 'rating',
      title: 'Average Rating',
      value: '0.0',
      secondaryValue: '/ 5.0',
      badge: 'User Sentiment',
      badgeType: 'neutral',
      iconType: 'yellow'
    }
  ];
}
