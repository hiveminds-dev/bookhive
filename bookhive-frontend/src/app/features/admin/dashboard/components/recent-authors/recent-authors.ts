import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-recent-authors',
  imports: [NgFor],
  templateUrl: './recent-authors.html',
  styleUrl: './recent-authors.css',
})
export class RecentAuthors {
  readonly readers = [
    { name: 'Liam Henderson', meta: 'Joined 2h ago', initials: 'LH' },
    { name: 'Sarah Jenkins', meta: 'Joined 5h ago', initials: 'SJ' }
  ];
}
