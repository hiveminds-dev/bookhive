import {
  Component,
  inject,
  OnInit
} from '@angular/core';
import { Auth } from '../../../../../core/services/auth';
import {
  UserProfile,
  UserProfileService
} from '../../../../../core/services/user-profile.service';

export interface ContactDetail {
  id: number;
  icon: string;
  label: string;
  value: string;
  link?: string;
}

export interface SocialLink {
  id: number;
  icon: string;
  label: string;
  url: string;
}

@Component({
  selector: 'app-profile-information',
  standalone: true,
  imports: [],
  templateUrl: './profile-information.html',
  styleUrl: './profile-information.scss'
})
export class ProfileInformation implements OnInit {
  private readonly auth = inject(Auth);
  private readonly userProfileService = inject(UserProfileService);
  readonly currentUser = this.auth.currentUser;
  profile: UserProfile | null = null;

  ngOnInit(): void {
    this.userProfileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
      },
      error: () => {
        this.profile = null;
      }
    });
  }

  get emailValue(): string {
    return this.profile?.email ?? this.currentUser()?.email ?? 'author@bookhive.com';
  }

  get contactDetails(): ContactDetail[] {
    const email = this.emailValue;
    return [
      {
        id: 1,
        icon: 'email',
        label: 'Email',
        value: email,
        link: `mailto:${email}`
      },
      {
        id: 2,
        icon: 'phone',
        label: 'Account',
        value: this.profile?.account_status ?? this.currentUser()?.account_status ?? 'pending'
      },
      {
        id: 3,
        icon: 'country',
        label: 'Country',
        value: this.profile?.country ?? 'Not added'
      },
      {
        id: 4,
        icon: 'language',
        label: 'Language',
        value: this.profile?.preferred_language ?? 'Not added'
      }
    ];
  }

  readonly socialLinks: SocialLink[] = [
    {
      id: 1,
      icon: 'web',
      label: 'Web',
      url: 'https://bookhive.com'
    },
    {
      id: 2,
      icon: 'twitter',
      label: 'Twitter',
      url: 'https://twitter.com'
    },
    {
      id: 3,
      icon: 'linkedin',
      label: 'LinkedIn',
      url: 'https://linkedin.com'
    }
  ];

  get biography(): string {
    return this.profile?.short_bio ||
      'Biography details will appear here after the author profile is updated.';
  }
}
