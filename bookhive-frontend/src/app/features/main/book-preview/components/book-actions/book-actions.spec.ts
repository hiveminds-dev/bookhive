import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookActionsComponent } from './book-actions';

describe('BookActionsComponent', () => {
  let component: BookActionsComponent;
  let fixture: ComponentFixture<BookActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookActionsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BookActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit when Read Book Now is selected', () => {
    let emitted = false;

    component.readBook.subscribe(() => {
      emitted = true;
    });

    component.onReadBook();

    expect(emitted).toBe(true);
  });

  it('should emit when Download is selected', () => {
    let emitted = false;

    component.downloadBook.subscribe(() => {
      emitted = true;
    });

    component.onDownloadBook();

    expect(emitted).toBe(true);
  });

  it('should not download when downloading is disabled', () => {
    let emitted = false;

    component.canDownload = false;

    component.downloadBook.subscribe(() => {
      emitted = true;
    });

    component.onDownloadBook();

    expect(emitted).toBe(false);
  });
});
