import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start on the first page', () => {
    expect(component.currentPage).toBe(1);
  });

  it('should move to the next page', () => {
    component.nextPage();

    expect(component.currentPage).toBe(2);
  });

  it('should not move before the first page', () => {
    component.currentPage = 1;
    component.previousPage();

    expect(component.currentPage).toBe(1);
  });

  it('should not move beyond the last page', () => {
    component.currentPage = 12;
    component.totalPages = 12;
    component.nextPage();

    expect(component.currentPage).toBe(12);
  });

  it('should generate compact pagination items', () => {
    component.currentPage = 1;
    component.totalPages = 12;

    expect(component.visiblePages).toEqual([
      1,
      2,
      3,
      'ellipsis',
      12
    ]);
  });
});
