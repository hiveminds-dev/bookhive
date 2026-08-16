import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-author-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule
  ],
  templateUrl: './author-layout.html',
  styleUrl: './author-layout.scss'
})
export class AuthorLayoutComponent {

  private readonly router = inject(Router);

  searchTerm = '';
  mobileSidebarOpen = false;
  profileMenuOpen = false;
  avatarLoadFailed = false;

  readonly authorName = 'Marcus Aurelius';
  readonly authorRole = 'Premium Author';
  readonly avatarPath =
    'images/authors/marcus-aurelius.jpg';

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

    this.router.navigate(['/login']);
  }
}
