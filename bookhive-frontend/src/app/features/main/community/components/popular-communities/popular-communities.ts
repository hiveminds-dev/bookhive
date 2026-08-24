import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

export interface PopularCommunity {
  id: number;
  name: string;
  members: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-popular-communities',
  standalone: true,
  imports: [],
  templateUrl: './popular-communities.html',
  styleUrl: './popular-communities.scss'
})
export class PopularCommunities {

  @Output()
  readonly communityJoined =
    new EventEmitter<PopularCommunity>();

  @Output()
  readonly viewAll =
    new EventEmitter<void>();

  readonly communities:
    PopularCommunity[] = [
    {
      id: 1,
      name: 'Novel Lovers',
      members: '12.4k Members',
      description:
        'For those who live a thousand lives through the magic of novels.',
      icon: 'auto_stories'
    },
    {
      id: 2,
      name: 'Programming Books',
      members: '8.2k Members',
      description:
        'Deep dives into software architecture, clean code, and development.',
      icon: 'terminal'
    },
    {
      id: 3,
      name: 'Self Development',
      members: '15.1k Members',
      description:
        'Discussions on productivity, habits, psychology, and personal growth.',
      icon: 'psychology'
    },
    {
      id: 4,
      name: 'Business Readers',
      members: '5.6k Members',
      description:
        'Master the markets and management with insights from great books.',
      icon: 'trending_up'
    },
    {
      id: 5,
      name: 'AI & Technology',
      members: '9.8k Members',
      description:
        'Stay ahead of the curve with the latest in artificial intelligence.',
      icon: 'smart_toy'
    },
    {
      id: 6,
      name: 'Science Club',
      members: '6.3k Members',
      description:
        'Exploring the wonders of the universe, from quantum theory to space.',
      icon: 'biotech'
    }
  ];

  joinCommunity(
    community: PopularCommunity
  ): void {
    this.communityJoined.emit(
      community
    );
  }

  onViewAll(): void {
    this.viewAll.emit();
  }
}
