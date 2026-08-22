import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-statistics',
  imports: [NgFor],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss',
})
export class Statistics {
  readonly cards = [
    { path: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z', trend: '+12%', trendClass: 'positive', label: 'Total Books', value: '14,284' },
    { path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75', trend: '+5.2%', trendClass: 'positive', label: 'Total Readers', value: '82.1k' },
    { path: 'M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z', trend: '0%', trendClass: 'neutral', label: 'Total Authors', value: '1,502' },
    { path: 'M6 2h12v4H6z M5 6h14v16H5z M9 11h6 M9 15h6', trend: '+3', trendClass: 'alert', label: 'Book Requests', value: '42' },
    { path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z M9 12l2 2 4-4', trend: '-2%', trendClass: 'positive', label: 'Author Requests', value: '18' }
  ];
}
