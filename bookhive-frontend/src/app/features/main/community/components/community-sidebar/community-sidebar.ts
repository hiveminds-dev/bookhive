import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

export interface SuggestedCommunity {
  id: number;
  name: string;
  members: string;
  icon: string;
}

export interface RecentActivity {
  id: number;
  initials: string;
  user: string;
  action: string;
  target: string;
}

@Component({
  selector: 'app-community-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './community-sidebar.html',
  styleUrl: './community-sidebar.scss'
})
export class CommunitySidebar {

  @Output()
  readonly communitySelected =
    new EventEmitter<SuggestedCommunity>();

  @Output()
  readonly policySelected =
    new EventEmitter<void>();

  readonly guidelines: string[] = [
    'Be respectful and constructive.',
    'No spoilers without warnings.',
    'Keep it literary-focused.',
    'Respect privacy and data.'
  ];

  readonly tags: string[] = [
    '#Programming',
    '#AI',
    '#Fantasy',
    '#History',
    '#Business',
    '#SinhalaBooks',
    '#Poetry'
  ];

  readonly suggestedCommunities:
    SuggestedCommunity[] = [
    {
      id: 1,
      name: 'Modern Philosophy',
      members: '1.2k members',
      icon: 'philosophy'
    },
    {
      id: 2,
      name: 'Design Theory',
      members: '850 members',
      icon: 'architecture'
    }
  ];

  readonly recentActivities:
    RecentActivity[] = [
    {
      id: 1,
      initials: 'RK',
      user: 'Ruwan',
      action: 'commented on',
      target: 'The Future of AI'
    },
    {
      id: 2,
      initials: 'TH',
      user: 'Tharushi',
      action: 'liked your review of',
      target: 'Atomic Habits'
    },
    {
      id: 3,
      initials: 'AK',
      user: 'Alex',
      action: 'joined the',
      target: 'Science Club'
    }
  ];

  selectCommunity(
    community: SuggestedCommunity
  ): void {
    this.communitySelected.emit(
      community
    );
  }

  openPolicy(): void {
    this.policySelected.emit();
  }
}
