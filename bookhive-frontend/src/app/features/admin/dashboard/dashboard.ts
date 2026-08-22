import { Component } from '@angular/core';
import { Activity } from './components/activity/activity';
import { RecentAuthors } from './components/recent-authors/recent-authors';
import { RecentBooks } from './components/recent-books/recent-books';
import { RecentRequests } from './components/recent-requests/recent-requests';
import { Statistics } from './components/statistics/statistics';

@Component({
  selector: 'app-dashboard',
  imports: [Statistics, RecentBooks, RecentAuthors, RecentRequests, Activity],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
