import { Component, Input } from '@angular/core';

export type StatisticTone =
  'gold' | 'green' | 'red' | 'neutral';

export interface AuthorStatistic {
  id: number;
  label: string;
  value: string;
  icon: string;
  indicator: string;
  tone: StatisticTone;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss'
})
export class StatisticsComponent {

  @Input() statistics: AuthorStatistic[] = [];
}
