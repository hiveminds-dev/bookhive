import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  ReaderChapter,
  ReaderSidebarComponent
} from './reader-sidebar';

describe('ReaderSidebarComponent', () => {
  let component: ReaderSidebarComponent;
  let fixture: ComponentFixture<ReaderSidebarComponent>;

  const testChapter: ReaderChapter = {
    page: 1,
    title: 'Introduction'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReaderSidebarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ReaderSidebarComponent);
    component = fixture.componentInstance;

    component.bookTitle = 'The Architecture of Light';
    component.cover = 'images/reader/architecture-of-light.jpg';
    component.totalPages = 120;
    component.rating = 4.9;
    component.currentPage = 1;
    component.chapters = [testChapter];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive the book details', () => {
    expect(component.totalPages).toBe(120);
    expect(component.rating).toBe(4.9);
  });

  it('should emit the selected chapter', () => {
    let selectedChapter: ReaderChapter | undefined;

    component.chapterSelected.subscribe(chapter => {
      selectedChapter = chapter;
    });

    component.selectChapter(testChapter);

    expect(selectedChapter).toEqual(testChapter);
  });

  it('should activate the placeholder when the cover fails', () => {
    component.onImageError();

    expect(component.imageLoadFailed).toBe(true);
  });
});
