import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-recent-requests',
  imports: [NgFor, NgIf],
  templateUrl: './recent-requests.html',
  styleUrl: './recent-requests.css',
})
export class RecentRequests {
  readonly requests = [
    { name: 'Marcus Webb', meta: 'Pen Name: M.W. Storm', badge: 'Urgent', initials: 'MW' },
    { name: 'Diana Ross', meta: 'Applied Aug 14', badge: '', initials: 'DR' }
  ];
}
