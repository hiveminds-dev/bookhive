import { Component, computed, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';
import {
  LucideLayoutDashboard,
  LucideBook,
  LucideInbox,
  LucideBarChart2,
  LucideCircleUser,
  LucideMenu,
  LucideX,
  LucideSearch,
  LucideChevronDown,
  LucideLogOut,
} from '@lucide/angular';


@Component({
  selector: 'app-author-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    LucideLayoutDashboard,
    LucideBook,
    LucideInbox,
    LucideBarChart2,
    LucideCircleUser,
    LucideMenu,
    LucideX,
    LucideSearch,
    LucideChevronDown,
    LucideLogOut,
  ],
  templateUrl: './author-layout.html',
  styleUrl: './author-layout.scss'
})
export class AuthorLayoutComponent {

  private readonly router = inject(Router);
  private readonly auth = inject(Auth);

  searchTerm = '';
  mobileSidebarOpen = false;
  profileMenuOpen = false;
  avatarLoadFailed = false;

  readonly currentUser =
    this.auth.currentUser;

  readonly authorName = computed(
    () => this.currentUser()?.full_name ?? 'Author'
  );

  readonly authorRole = computed(
    () => this.currentUser()?.role === 'author'
      ? 'Author'
      : 'BookHive Member'
  );

  readonly avatarInitials = computed(() => {
    const name =
      this.authorName().trim();

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('') || 'AU';
  });

  readonly avatarPath =
    'images/author/profile/profile-placeholder.jpg';

  toggleSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  closeSidebar(): void {
    this.mobileSidebarOpen = false;
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeProfileMenu(): void {
    this.profileMenuOpen = false;
  }

  onAvatarError(): void {
    this.avatarLoadFailed = true;
  }

  searchLibrary(): void {
    const search = this.searchTerm.trim();

    if (!search) {
      return;
    }

    console.log('Author library search:', search);
  }

  logout(): void {
    this.closeSidebar();
    this.closeProfileMenu();

    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
