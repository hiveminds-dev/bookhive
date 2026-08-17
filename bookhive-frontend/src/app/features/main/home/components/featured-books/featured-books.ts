//import { Component } from '@angular/core';

//@Component({
//  selector: 'app-featured-books',
//  imports: [],
//  templateUrl: './featured-books.html',
//  styleUrl: './featured-books.css',
//})
//export class FeaturedBooks {}


import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FeaturedBook {
  title: string;
  category: string;
  description: string;
  image: string;
}

interface SpotlightAuthor {
  name: string;
  quote: string;
  tags: string[];
  avatar: string;
}

@Component({
  selector: 'app-featured-books',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-books.html',
  styleUrl: './featured-books.css'
})
export class FeaturedBooksComponent {
  bookOfTheMonth: FeaturedBook = {
    title: 'The Alchemy of Thought',
    category: 'BOOK OF THE MONTH',
    description: 'A deep dive into the evolution of modern philosophy and how it shapes our digital age architecture.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
  };

  philosophyCard = {
    title: 'Philosophy',
    description: '3,420 curated works from classic stoics to contemporary theorists.',
    linkText: 'Browse Collection'
  };

  authorSpotlight: SpotlightAuthor = {
    name: 'Dr. Elena Vance',
    quote: '"Reading is not just consumption, it\'s an architectural process of the mind."',
    tags: ['Cognitive Science', 'Future History'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
  };

  authorsCount = '28,019';
}
