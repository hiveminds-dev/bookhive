import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [NgFor],
  templateUrl: './community.html',
  styleUrl: './community.scss',
})
export class Community {
  readonly posts = [
    {
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
}
