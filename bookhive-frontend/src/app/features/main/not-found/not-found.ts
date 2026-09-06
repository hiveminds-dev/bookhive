import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss'
})
export class NotFoundComponent {
  private router = inject(Router);

  searchQuery = '';

  popularTopics = [
    { label: 'Fiction', query: 'Fiction' },
    { label: 'Science & Nature', query: 'Science' },
    { label: 'History', query: 'History' },
    { label: 'Philosophy', query: 'Philosophy' }
  ];

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (q) {
      this.router.navigate(['/explore'], { queryParams: { q } });
    } else {
      this.router.navigate(['/explore']);
    }
  }

  browseTopic(topic: string): void {
    this.router.navigate(['/explore'], { queryParams: { q: topic } });
  }
}
