import {
  Component
} from '@angular/core';

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

  readonly contactDetails: ContactDetail[] = [
    {
      id: 1,
      icon: '✉',
      label: 'Email',
      value: 'j.barnes@aurelius.com',
      link: 'mailto:j.barnes@aurelius.com'
    },
    {
      id: 2,
      icon: '⌕',
      label: 'Phone',
      value: '+44 20 7946 0958',
      link: 'tel:+442079460958'
    },
    {
      id: 3,
      icon: '⌖',
      label: 'Country',
      value: 'United Kingdom'
    },
    {
      id: 4,
      icon: '◎',
      label: 'Language',
      value: 'English (UK)'
    }
  ];

  readonly socialLinks: SocialLink[] = [
    {
      id: 1,
      icon: '●',
      label: 'Web',
      url: 'https://example.com'
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
    'Julian Barnes, writing under the prestigious pen name J.B. Aurelius, is a contemporary novelist and essayist whose work explores the intricate intersections of memory, historical truth, and the human condition. With over a decade of dedication to the craft, his narratives often weave together philosophical inquiry with a deeply empathetic understanding of his characters.';
}
