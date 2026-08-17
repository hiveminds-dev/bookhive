import { Component, Input } from '@angular/core';

export type ActivityType =
  'approved' | 'review' | 'report';

export interface AuthorActivity {
  id: number;
  title: string;
  description: string;
  time: string;
  type: ActivityType;
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [],
  templateUrl: './recent-activity.html',
  styleUrl: './recent-activity.scss'
})
export class RecentActivityComponent {

  @Input() activities: AuthorActivity[] = [];

  getActivityClass(type: ActivityType): string {
    return type;
  }
}
