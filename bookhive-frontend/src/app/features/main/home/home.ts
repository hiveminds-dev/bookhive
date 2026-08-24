import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  image: string;
  rating: number;
}

interface Category {
  name: string;
  books: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private router: Router) {}

  // ================= STATE =================

  isLoading = true;
  hasError = false;

  searchText = '';

  // ================= STATISTICS =================

  // Mock/demo values for the current frontend.
  // Replace with API values when backend integration is ready.
   // don't forget
  totalBooks = 120000;
  totalAuthors = 28019;
  rating = 4.9;

  // ================= CATEGORIES =================

  categories: Category[] = [
    {
      name: 'Philosophy',
      books: 34200,
    },
    {
      name: 'Science',
      books: 28500,
    },
    {
      name: 'Technology',
      books: 19400,
    },
    {
      name: 'History',
      books: 15800,
    },
  ];

  // ================= BOOKS =================

  books: Book[] = [];

  // ================= INITIAL LOAD =================

  ngOnInit(): void {
    this.loadBooks();
  }

  // ================= LOAD BOOKS =================

  loadBooks(): void {
    this.isLoading = true;
    this.hasError = false;

    try {
      // Mock/local data for now.
      // Replace this section later with your API/service call.

      this.books = [
        {
          id: 1,
          title: 'Beyond Good and Evil',
          author: 'Friedrich Nietzsche',
          category: 'Philosophy',
          image: 'assets/images/book-covers/beyond-good-and-evil.jpg',
          rating: 5,
        },

        {
          id: 2,
          title: 'Quantum Mechanics',
          author: 'Dr. Sarah Chen',
          category: 'Science',
          image: 'assets/images/book-covers/quantum-mechanics.jpg',
          rating: 4,
        },

        {
          id: 3,
          title: 'The Silent Grove',
          author: 'Elena Rossi',
          category: 'Mystery',
          image: 'assets/images/book-covers/the-silent-grove.jpg',
          rating: 5,
        },

        {
          id: 4,
          title: 'Artificial Intelligence',
          author: 'Michael Lee',
          category: 'Technology',
          image: 'assets/images/book-covers/ai_book_cover_mockup.webp',
          rating: 5,
        },
      ];

      this.isLoading = false;
    } catch (error) {
      console.error('Unable to load books:', error);

      this.books = [];
      this.hasError = true;
      this.isLoading = false;
    }
  }

  // ================= SEARCH =================

  get filteredBooks(): Book[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.books;
    }

    return this.books.filter(
      (book) =>
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search) ||
        book.category.toLowerCase().includes(search),
    );
  }

  clearSearch(): void {
    this.searchText = '';
  }

  // ================= BUTTON FUNCTIONS =================

  login(): void {
    this.router.navigate(['/login']);
  }

  signup(): void {
    this.router.navigate(['/register']);
  }

  uploadBook(): void {
    this.router.navigate(['/author/books/upload']);
  }

  startJourney(): void {
    this.router.navigate(['/explore']);
  }

  exploreLibrary(): void {
    this.router.navigate(['/explore']);
  }

  browseCategory(category: string): void {
    this.router.navigate(['/explore'], {
      queryParams: { category },
    });
  }

  readBook(book: Book): void {
    this.router.navigate(['/explore', book.id, 'preview']);
  }
}
