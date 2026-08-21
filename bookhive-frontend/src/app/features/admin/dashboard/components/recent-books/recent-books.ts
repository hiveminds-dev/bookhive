import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-recent-books',
  imports: [NgFor],
  templateUrl: './recent-books.html',
  styleUrl: './recent-books.css',
})
export class RecentBooks {
  readonly books = [
    { cover: 'images/booklogo.png', title: 'The Silent Echo', isbn: '978-3-16-148410-0', author: 'Eleanor Vance', category: 'Fiction', status: 'Published', statusClass: 'published' },
    { cover: 'images/booklogo.png', title: 'Modern Architecture', isbn: '452-1-09-548122-1', author: 'Julian Thorne', category: 'Art & Design', status: 'Under Review', statusClass: 'review' }
  ];
}
