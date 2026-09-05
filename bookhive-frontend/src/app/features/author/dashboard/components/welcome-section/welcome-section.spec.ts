import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  WelcomeSectionComponent
} from './welcome-section';

describe('WelcomeSectionComponent', () => {
  let component: WelcomeSectionComponent;
  let fixture: ComponentFixture<WelcomeSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeSectionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      WelcomeSectionComponent
    );

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive the author information', () => {
    component.authorName = 'Eleanor';
    component.newReviewCount = 2;

    expect(component.authorName).toBe('Eleanor');
    expect(component.newReviewCount).toBe(2);
  });

  it('should emit the upload action', () => {
    let emitted = false;

    component.uploadBook.subscribe(() => {
      emitted = true;
    });

    component.onUploadBook();

    expect(emitted).toBe(true);
  });
});
