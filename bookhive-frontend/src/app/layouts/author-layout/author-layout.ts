import { Component, computed, inject, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal';
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
  LucideBell,
  LucideGrid2X2,
} from '@lucide/angular';


@Component({
  selector: 'app-author-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ConfirmationModalComponent,
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
    LucideBell,
    LucideGrid2X2,
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
  activeTopbarMenu: 'notifications' | 'quick' | null = null;
  avatarLoadFailed = false;
  readonly showLogoutConfirmSignal = signal<boolean>(false);

  readonly notifications = [
    {
      title: 'Drafts ready to continue',
      meta: 'Open My Books'
    },
    {
      title: 'Submission status updates',
      meta: 'Check Requests'
    }
  ];

  readonly quickLinks = [
    {
      label: 'Dashboard',
      route: '/author/dashboard'
    },
    {
      label: 'My Books',
      route: '/author/books'
    },
    {
      label: 'Upload Book',
      route: '/author/books/upload'
    },
    {
      label: 'Requests',
      route: '/author/requests'
    },
    {
      label: 'Analytics',
      route: '/author/analytics'
    },
    {
      label: 'Profile',
      route: '/author/profile'
    }
  ];

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
    this.activeTopbarMenu = null;
  }

  closeProfileMenu(): void {
    this.profileMenuOpen = false;
  }

  toggleTopbarMenu(
    menu: 'notifications' | 'quick'
  ): void {
    this.activeTopbarMenu =
      this.activeTopbarMenu === menu
        ? null
        : menu;
    this.profileMenuOpen = false;
  }

  closeTopbarMenu(): void {
    this.activeTopbarMenu = null;
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

  promptLogout(): void {
    this.closeSidebar();
    this.closeProfileMenu();
    this.closeTopbarMenu();
    this.showLogoutConfirmSignal.set(true);
  }

  cancelLogout(): void {
    this.showLogoutConfirmSignal.set(false);
  }

  confirmLogout(): void {
    this.showLogoutConfirmSignal.set(false);

    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
