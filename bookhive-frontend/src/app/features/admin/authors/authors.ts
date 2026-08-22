import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [NgFor],
  templateUrl: './authors.html',
  styleUrl: './authors.scss',
})
export class AuthorsComponent {
  readonly authors = [
    {
      fullName: 'Eleanor Vance',
      penName: 'E. V. Sterling',
      email: 'eleanor.v@lumina.com',
      country: 'United Kingdom',
      appliedDate: 'Oct 24, 2023',
      avatar: 'assets/images/auth/sign_in_1.png'
    },
    {
      fullName: 'Julian Thorne',
      penName: 'J. Thistle',
      email: 'j.thorne@writes.org',
      country: 'Canada',
      appliedDate: 'Oct 23, 2023',
      avatar: 'assets/images/auth/sign_in_1.png'
    }
  ];
}
