import {
  Component,
  computed,
  inject,
  OnInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  Auth
} from '../../../core/services/auth';

import {
  AuthorBookItem,
  BookService
} from '../../../core/services/book.service';

import {
  ToastService
} from '../../../core/services/toast.service';

import {
  UserProfileService
} from '../../../core/services/user-profile.service';

import {
  ProfileHeader
} from './components/profile-header/profile-header';

import {
  ProfileActions
} from './components/profile-actions/profile-actions';

import {
  ProfileStatistic,
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
export class Profile implements OnInit {

  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  private readonly bookService = inject(BookService);
  private readonly toastService = inject(ToastService);
  private readonly userProfileService = inject(UserProfileService);

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

  profileStatistics: ProfileStatistic[] = [
    {
      id: 1,
      label: 'Published Books',
      value: '0'
    },
    {
      id: 2,
      label: 'Followers',
      value: 'Not tracked'
    },
    {
      id: 3,
      label: 'Downloads',
      value: 'Not tracked'
    },
    {
      id: 4,
      label: 'Joined Date',
      value: 'Current'
    }
  ];

  books: AuthorProfileBook[] = [];

  readonly badges = computed(() => [
    this.currentUser()?.account_status ?? 'pending',
    'Author'
  ]);

  ngOnInit(): void {
    this.userProfileService.getMyProfile().subscribe({
      next: (profile) => {
        if (profile.profile_image_url) {
          this.profileImage = profile.profile_image_url;
        }

        const joinedDate = profile.created_at
          ? new Date(profile.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          : 'Current';

        this.profileStatistics = this.profileStatistics.map((statistic) =>
          statistic.label === 'Joined Date'
            ? { ...statistic, value: joinedDate }
            : statistic
        );
      },
      error: () => {
        this.profileStatistics = this.profileStatistics.map((statistic) =>
          statistic.label === 'Joined Date'
            ? { ...statistic, value: 'Current' }
            : statistic
        );
      }
    });

    this.bookService.getAuthorBooks().subscribe({
      next: (books) => {
        const publishedBooks = books.filter(
          (book) => book.status.toUpperCase() === 'PUBLISHED'
        );

        this.profileStatistics = [
          {
            ...this.profileStatistics[0],
            value: String(publishedBooks.length)
          },
          this.profileStatistics[1],
          this.profileStatistics[2],
          this.profileStatistics[3]
        ];

        this.books = publishedBooks
          .slice(0, 3)
          .map((book) => this.mapProfileBook(book));
      },
      error: () => {
        this.toastService.warning('Failed to load author profile books.', 'Notice');
      }
    });
  }

  private mapProfileBook(
    book: AuthorBookItem
  ): AuthorProfileBook {
    return {
      id: book.id,
      title: book.title,
      category: book.category_name || 'General',
      cover: book.cover_url || (
        book.cover_image_path
          ? `/${book.cover_image_path}`
          : 'images/author-books/default-cover.jpg'
      ),
      publishedDate: book.published_at
        ? new Date(book.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        : 'Published',
      rating: 0
    };
  }

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
