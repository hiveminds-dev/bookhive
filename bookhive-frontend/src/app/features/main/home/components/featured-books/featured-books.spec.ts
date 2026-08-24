import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CatalogueBook } from '../../../../../core/services/book.service';
import { FeaturedBooksComponent } from './featured-books';

describe('FeaturedBooksComponent', () => {
  let component: FeaturedBooksComponent;
  let fixture: ComponentFixture<FeaturedBooksComponent>;

  const mockBooks: CatalogueBook[] = [
    {
      id: 10,
      title: 'The Republic',
      description: 'Platonic dialogues on justice.',
      language: 'English',
      reading_level: 'Advanced',
      page_count: 350,
      published_at: '2026-01-01',
      cover_url: '/storage/covers/republic.jpg',
      author_name: 'Plato',
      category_name: 'Philosophy',
    },
    {
      id: 11,
      title: 'Ancient Fragments',
      description: 'Historical fragments.',
      language: null,
      reading_level: null,
      page_count: null,
      published_at: '2026-01-01',
      cover_url: null,
      author_name: 'Anonymous',
      category_name: 'History',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedBooksComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create FeaturedBooksComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render books when books input is populated', () => {
    fixture.componentRef.setInput('books', mockBooks);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('The Republic');
    expect(compiled.textContent).toContain('By Plato');
    expect(compiled.textContent).toContain('350 Pages');
  });

  it('should render cover image with accessible alt text and handle null cover gracefully', () => {
    fixture.componentRef.setInput('books', mockBooks);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const coverImages = compiled.querySelectorAll<HTMLImageElement>('.book-cover-img');
    expect(coverImages.length).toBe(1);
    expect(coverImages[0].src).toContain('/storage/covers/republic.jpg');
    expect(coverImages[0].alt).toBe('The Republic cover');

    const placeholders = compiled.querySelectorAll('.cover-placeholder');
    expect(placeholders.length).toBe(1);
    expect(placeholders[0].textContent).toContain('Ancient Fragments');
  });

  it('should switch to placeholder when cover image fails to load', () => {
    fixture.componentRef.setInput('books', mockBooks);
    fixture.detectChanges();

    component.onCoverError(10);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const coverImages = compiled.querySelectorAll<HTMLImageElement>('.book-cover-img');
    expect(coverImages.length).toBe(0);

    const placeholders = compiled.querySelectorAll('.cover-placeholder');
    expect(placeholders.length).toBe(2);
  });

  it('should display neutral message when language is null', () => {
    fixture.componentRef.setInput('books', [mockBooks[1]]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Language not specified');
    expect(compiled.textContent).not.toContain('Pages');
  });

  it('should render loading skeletons when isLoading is true', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.book-card-skeleton').length).toBe(8);
  });

  it('should render error state when hasError is true', () => {
    fixture.componentRef.setInput('hasError', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Unable to load catalogue books');
  });

  it('should render empty state when books array is empty and not loading', () => {
    fixture.componentRef.setInput('books', []);
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('hasError', false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No books available');
  });
});
