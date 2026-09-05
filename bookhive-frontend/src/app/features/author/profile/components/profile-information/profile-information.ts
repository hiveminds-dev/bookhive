import {
  Component,
  inject,
} from '@angular/core';
import { Auth } from '../../../../../core/services/auth';

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
export class ProfileInformation {
  private readonly auth = inject(Auth);
  readonly currentUser = this.auth.currentUser;

  get emailValue(): string {
    return this.currentUser()?.email ?? 'author@bookhive.com';
  }

  get contactDetails(): ContactDetail[] {
    const email = this.emailValue;
    return [
      {
        id: 1,
        icon: '✉',
        label: 'Email',
        value: email,
        link: `mailto:${email}`
      },
      {
        id: 2,
        icon: '⌕',
        label: 'Phone',
        value: '+1 (555) 019-2834',
        link: 'tel:+15550192834'
      },
      {
        id: 3,
        icon: '⌖',
        label: 'Country',
        value: 'International'
      },
      {
        id: 4,
        icon: '◎',
        label: 'Language',
        value: 'English'
      }
    ];
  }

  readonly socialLinks: SocialLink[] = [
    {
      id: 1,
      icon: '●',
      label: 'Web',
      url: 'https://bookhive.com'
    },
    {
      id: 2,
      icon: '@',
      label: 'Twitter',
      url: 'https://twitter.com'
    },
    {
      id: 3,
      icon: '▣',
      label: 'LinkedIn',
      url: 'https://linkedin.com'
    }
  ];

  readonly biography =
    'Published author dedicated to compelling storytelling, insightful literature, and enriching the BookHive reading community with quality manuscripts.';
}
