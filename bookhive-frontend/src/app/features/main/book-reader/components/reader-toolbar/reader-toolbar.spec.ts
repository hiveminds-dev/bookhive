import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReaderToolbarComponent } from './reader-toolbar';

describe('ReaderToolbarComponent', () => {
  let component: ReaderToolbarComponent;
  let fixture: ComponentFixture<ReaderToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReaderToolbarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ReaderToolbarComponent);
    component = fixture.componentInstance;

    component.zoomLevel = 100;
    component.currentPage = 15;
    component.totalPages = 120;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit next page', () => {
    let emitted = false;

    component.nextPage.subscribe(() => {
      emitted = true;
    });

    component.onNextPage();

    expect(emitted).toBe(true);
  });

  it('should emit previous page', () => {
    let emitted = false;

    component.previousPage.subscribe(() => {
      emitted = true;
    });

    component.onPreviousPage();

    expect(emitted).toBe(true);
  });

  it('should toggle the bookmark', () => {
    component.bookmarked = false;
    component.toggleBookmark();

    expect(component.bookmarked).toBe(true);
  });

  it('should not move before the first page', () => {
    let emitted = false;
    component.currentPage = 1;

    component.previousPage.subscribe(() => {
      emitted = true;
    });

    component.onPreviousPage();

    expect(emitted).toBe(false);
  });
});
