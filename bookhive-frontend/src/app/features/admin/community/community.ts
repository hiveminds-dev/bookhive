import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [NgFor],
  templateUrl: './community.html',
  styleUrl: './community.scss',
})
export class Community {
  private readonly toastService = inject(ToastService);

  readonly posts = [
    {
      id: 1,
      initials: 'EJ',
      badgeClass: 'avatar-yellow',
      userName: 'Elena J.',
      userRole: 'Premium Member',
      title: 'The Magic of Gabriel García Márquez',
      snippet: "I just finished One Hundred Years of Solitude and I'm breath...",
      date: 'Oct 12, 2023',
      likes: '1.2k',
      reports: 0
    },
    {
      id: 2,
      initials: 'MW',
      badgeClass: 'avatar-gray',
      userName: 'Marcus W.',
      userRole: 'Reader',
      title: 'Best Sci-Fi of 2023 so far?',
      snippet: "Looking for recommendations that aren't the usual suspe...",
      date: 'Oct 11, 2023',
      likes: '428',
      reports: 2
    }
  ];

  exportReport(): void {
    this.toastService.success('Exporting community activity report PDF...', 'Report Exported');
  }

  inviteAuthor(): void {
    this.toastService.info('Opening Author Invitation dialogue...', 'Author Invite');
  }

  filterPosts(): void {
    this.toastService.info('Filtered by recent activity.', 'Filter');
  }

  viewPost(post: any): void {
    this.toastService.info(`Viewing discussion: "${post.title}"`, 'Community Post');
  }

  pinPost(post: any): void {
    this.toastService.success(`Pinned "${post.title}" to top of community feed.`, 'Post Pinned');
  }

  deletePost(post: any): void {
    this.toastService.warning(`Removed discussion: "${post.title}".`, 'Post Deleted');
  }
}
