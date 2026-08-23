import {
  Component,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  CommunityHero
} from './components/community-hero/community-hero';

import {
  CommunitySearch
} from './components/community-search/community-search';

import {
  PopularCommunities,
  PopularCommunity
} from './components/popular-communities/popular-communities';

import {
  CommunityDiscussion,
  TrendingDiscussions
} from './components/trending-discussions/trending-discussions';

import {
  CommunitySidebar,
  SuggestedCommunity
} from './components/community-sidebar/community-sidebar';

import {
  CommunityEvent,
  UpcomingEvents
} from './components/upcoming-events/upcoming-events';

import {
  ActiveMember,
  ActiveMembers
} from './components/active-members/active-members';

import {
  CommunityCta
} from './components/community-cta/community-cta';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [
    CommunityHero,
    CommunitySearch,
    PopularCommunities,
    TrendingDiscussions,
    CommunitySidebar,
    UpcomingEvents,
    ActiveMembers,
    CommunityCta
  ],
  templateUrl: './community.html',
  styleUrl: './community.scss'
})
export class Community {

  private readonly router =
    inject(Router);

  searchTerm = '';

  notificationMessage = '';

  private notificationTimer:
    ReturnType<typeof setTimeout> | undefined;

  onSearchChanged(
    search: string
  ): void {
    this.searchTerm = search;
  }

  onStartDiscussion(): void {
    this.showNotification(
      'Start Discussion form will open here.'
    );
  }

  onBrowseCommunities(): void {
    const section =
      document.getElementById(
        'popular-communities'
      );

    section?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  onCommunityJoined(
    community: PopularCommunity
  ): void {
    this.showNotification(
      `You joined ${community.name}.`
    );
  }

  onViewAllCommunities(): void {
    this.onBrowseCommunities();
  }

  onThreadSelected(
    discussion: CommunityDiscussion
  ): void {
    this.showNotification(
      `Opening discussion: ${discussion.title}`
    );
  }

  onDiscussionLiked(
    discussion: CommunityDiscussion
  ): void {
    this.showNotification(
      `You liked ${discussion.author}'s discussion.`
    );
  }

  onSuggestedCommunitySelected(
    community: SuggestedCommunity
  ): void {
    this.showNotification(
      `You joined ${community.name}.`
    );
  }

  onPolicySelected(): void {
    this.showNotification(
      'Community policy will open here.'
    );
  }

  onEventSelected(
    event: CommunityEvent
  ): void {
    this.showNotification(
      `You registered for ${event.title}.`
    );
  }

  onFollowChanged(
    member: ActiveMember
  ): void {
    const action =
      member.following
        ? 'following'
        : 'unfollowed';

    this.showNotification(
      `You are ${action} ${member.name}.`
    );
  }

  onJoinCommunity(): void {
    this.onBrowseCommunities();
  }

  onExploreBooks(): void {
    this.router.navigate([
      '/explore'
    ]);
  }

  closeNotification(): void {
    this.notificationMessage = '';

    if (this.notificationTimer) {
      clearTimeout(
        this.notificationTimer
      );
    }
  }

  private showNotification(
    message: string
  ): void {
    this.notificationMessage =
      message;

    if (this.notificationTimer) {
      clearTimeout(
        this.notificationTimer
      );
    }

    this.notificationTimer =
      setTimeout(() => {
        this.notificationMessage = '';
      }, 3500);
  }
}
