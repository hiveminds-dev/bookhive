import {
  Component,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

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

  authorName = 'Julian Barnes';

  penName = 'J.B. Aurelius';

  profileImage =
    'images/author/profile/julian-barnes.jpg';

  readonly badges: string[] = [
    'Bestselling Author',
    'Fiction'
  ];

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
