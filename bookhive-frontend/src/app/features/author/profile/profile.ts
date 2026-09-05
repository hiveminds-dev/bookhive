import {
  Component,
  computed,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  Auth
} from '../../../core/services/auth';

import {
  ProfileHeader
} from './components/profile-header/profile-header';

import {
  ProfileActions
} from './components/profile-actions/profile-actions';

import {
  ProfileStatistics
} from './components/profile-statistics/profile-statistics';

import {
  ProfileInformation
} from './components/profile-information/profile-information';

import {
  AuthorProfileBook,
  ProfileBooks
} from './components/profile-books/profile-books';

@Component({
  selector: 'app-author-profile',
  standalone: true,
  imports: [
    ProfileHeader,
    ProfileActions,
    ProfileStatistics,
    ProfileInformation,
    ProfileBooks
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {

  private readonly router = inject(Router);
  private readonly auth = inject(Auth);

  readonly currentUser =
    this.auth.currentUser;

  readonly authorName = computed(
    () => this.currentUser()?.full_name ?? 'Author'
  );

  readonly penName = computed(
    () => this.currentUser()?.username
      ? `@${this.currentUser()?.username}`
      : 'Author Profile'
  );

  profileImage =
    'images/author/profile/profile-placeholder.jpg';

  readonly badges = computed(() => [
    this.currentUser()?.account_status ?? 'pending',
    'Author'
  ]);

  onProfileImageChanged(
    file: File
  ): void {
    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result === 'string'
      ) {
        this.profileImage =
          reader.result;
      }
    };

    reader.readAsDataURL(file);
  }

  editProfile(): void {
    this.router.navigate([
      '/author/profile/edit'
    ]);
  }

  changePassword(): void {
    this.router.navigate([
      '/author/profile/change-password'
    ]);
  }

  openBook(
    book: AuthorProfileBook
  ): void {
    this.router.navigate([
      '/explore',
      book.id,
      'preview'
    ]);
  }

  viewAllBooks(): void {
    this.router.navigate([
      '/author/books'
    ]);
  }
}
