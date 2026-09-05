import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  BookCoverUploadComponent
} from './book-cover-upload';

describe('BookCoverUploadComponent', () => {
  let component: BookCoverUploadComponent;
  let fixture: ComponentFixture<BookCoverUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCoverUploadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      BookCoverUploadComponent
    );

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start without selected files', () => {
    expect(component.selectedBookFile)
      .toBeUndefined();

    expect(component.selectedCover)
      .toBeUndefined();
  });

  it('should remove the selected book file', () => {
    component.selectedBookFile =
      new File(['book'], 'book.pdf', {
        type: 'application/pdf'
      });

    component.removeBookFile();

    expect(component.selectedBookFile)
      .toBeUndefined();
  });

  it('should remove the selected cover', () => {
    component.coverPreview = 'preview';
    component.removeCover();

    expect(component.coverPreview).toBe('');
  });
});
