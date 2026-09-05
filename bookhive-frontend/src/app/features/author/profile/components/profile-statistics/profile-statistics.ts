import {
  Component
} from '@angular/core';

export interface ProfileStatistic {
  id: number;
  label: string;
  value: string;
}

@Component({
  selector: 'app-profile-statistics',
  standalone: true,
  imports: [],
  templateUrl: './profile-statistics.html',
  styleUrl: './profile-statistics.scss'
})
export class ProfileStatistics {

  readonly statistics: ProfileStatistic[] = [
    {
      id: 1,
      label: 'Published Books',
      value: '0'
    },
    {
      id: 2,
      label: 'Followers',
      value: 'Not tracked'
    },
    {
      id: 3,
      label: 'Downloads',
      value: 'Not tracked'
    },
    {
      id: 4,
      label: 'Joined Date',
      value: 'Current account'
    }
  ];
}
