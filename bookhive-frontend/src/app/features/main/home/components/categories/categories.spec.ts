import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CategoryItem } from '../../../../../core/services/book.service';
import { CategoriesComponent } from './categories';

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;

  const mockCategories: CategoryItem[] = [
    {
      id: 1,
      name: 'Programming & Software',
      description: 'Clean code and algorithms.',
      is_active: true,
    },
    {
      id: 2,
      name: 'Technology',
      description: 'AI and cloud systems.',
      is_active: true,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create CategoriesComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render category cards with routerLink to explore with category_id', () => {
    fixture.componentRef.setInput('categories', mockCategories);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll<HTMLAnchorElement>('.category-card');
    expect(cards.length).toBe(2);
    expect(cards[0].getAttribute('href')).toBe('/explore?category_id=1');
    expect(cards[1].getAttribute('href')).toBe('/explore?category_id=2');
  });

  it('should map active categories from input with appropriate Lucide icon types', () => {
    fixture.componentRef.setInput('categories', mockCategories);
    fixture.detectChanges();

    const display = component.displayCategories;
    expect(display.length).toBe(2);
    expect(display[0].name).toBe('Programming & Software');
    expect(display[0].iconType).toBe('code');
    expect(display[1].iconType).toBe('cpu');
  });

  it('should return empty list and show no fake fallback categories when input is empty', () => {
    fixture.componentRef.setInput('categories', []);
    fixture.detectChanges();

    const display = component.displayCategories;
    expect(display.length).toBe(0);
  });

  it('should emit retryClick when onRetry is called', () => {
    let retryEmitted = false;
    component.retryClick.subscribe(() => {
      retryEmitted = true;
    });

    component.onRetry();
    expect(retryEmitted).toBe(true);
  });
});
