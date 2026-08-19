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
      icon: '◉',
      title: 'Total Views',
      value: '128.4K',
      badge: '↗ 12%',
      badgeType: 'positive',
      iconType: 'gold'
    },
    {
      id: 2,
      icon: '⇩',
      title: 'Total Downloads',
      value: '42.2K',
      badge: '↗ 5%',
      badgeType: 'positive',
      iconType: 'gold'
    },
    {
      id: 3,
      icon: '▣',
      title: 'Books Published',
      value: '24',
      badge: 'Lifetime',
      badgeType: 'neutral',
      iconType: 'gray'
    },
    {
      id: 4,
      icon: '★',
      title: 'Average Rating',
      value: '4.8',
      secondaryValue: '/ 5.0',
      badge: 'User Sentiment',
      badgeType: 'neutral',
      iconType: 'yellow'
    }
  ];
}
