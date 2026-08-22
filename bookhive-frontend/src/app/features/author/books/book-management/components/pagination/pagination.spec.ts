import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  PaginationComponent
} from './pagination';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      PaginationComponent
    );

    component = fixture.componentInstance;
    component.currentPage = 1;
    component.totalPages = 5;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should move to the next page', () => {
    component.nextPage();

    expect(component.currentPage).toBe(2);
  });

  it('should not move before page one', () => {
    component.currentPage = 1;
    component.previousPage();

    expect(component.currentPage).toBe(1);
  });

  it('should not move beyond the last page', () => {
    component.currentPage = 5;
    component.nextPage();

    expect(component.currentPage).toBe(5);
  });

  it('should create visible page numbers', () => {
    expect(component.visiblePages)
      .toEqual([1, 2, 3, 4, 5]);
  });
});
