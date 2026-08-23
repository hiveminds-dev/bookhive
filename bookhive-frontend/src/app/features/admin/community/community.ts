import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, FormsModule],
  templateUrl: './community.html',
  styleUrl: './community.scss',
})
export class Community {
  private readonly toastService = inject(ToastService);

  searchQuery = signal('');
  showAdvanceSearch = signal(false);
  filterRole = signal('');
  filterReported = signal('');
  filterSortBy = signal('newest');

  toggleAdvanceSearch(): void {
    this.showAdvanceSearch.update(v => !v);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  get filteredPosts(): any[] {
    const q = this.searchQuery().toLowerCase().trim();
    const role = this.filterRole().toLowerCase().trim();

    return this.posts.filter(p => {
      const matchesQ = !q || p.userName.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.snippet.toLowerCase().includes(q);
      if (!matchesQ) return false;

      const matchesRole = !role || p.userRole.toLowerCase().includes(role);
      if (!matchesRole) return false;

      return true;
    });
  }

  applyFilters(): void {
    this.toastService.success('Filtered community discussions.', 'Filter Applied');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterRole.set('');
    this.filterReported.set('');
    this.filterSortBy.set('newest');
    this.toastService.info('Community search filters reset.', 'Filters Reset');
  }

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
