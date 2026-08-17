import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  styleUrls: ['./home.css'],
})
export class HomeComponent {
  searchText = '';

  // ================= STATISTICS =================

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

  books: Book[] = [
    {
      id: 1,
      title: 'The Alchemy of Thought',
      author: 'Dr. Elena Vance',
      category: 'Philosophy',
      image: 'assets/books-images/alchemy_thought_cover.webp',
      rating: 5,
    },

    {
      id: 2,
      title: 'Future Architecture',
      author: 'James Carter',
      category: 'Architecture',
      image: 'assets/books-images/future_architecture_cover.webp',
      rating: 4,
    },

    {
      id: 3,
      title: 'Modern Psychology',
      author: 'Sophia Green',
      category: 'Psychology',
      image: 'assets/books-images/modern_psychology_cover.webp',
      rating: 5,
    },

    {
      id: 4,
      title: 'Artificial Intelligence',
      author: 'Michael Lee',
      category: 'Technology',
      image: 'assets/books-images/ai_book_cover_mockup.webp',
      rating: 5,
    },
  ];

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

  // ================= BUTTON FUNCTIONS =================

  login(): void {
    console.log('Navigate to Login');
  }

  signup(): void {
    console.log('Navigate to Register');
  }

  uploadBook(): void {
    console.log('Navigate to Upload Book');
  }

  startJourney(): void {
    console.log('Start Journey');
  }

  exploreLibrary(): void {
    console.log('Explore Library');
  }

  browseCategory(category: string): void {
    console.log('Selected category:', category);
  }

  readBook(book: Book): void {
    console.log('Selected book:', book);
  }
}
