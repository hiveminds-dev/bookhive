import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  SaveActionsComponent
} from './save-actions';

describe('SaveActionsComponent', () => {
  let component: SaveActionsComponent;
  let fixture: ComponentFixture<SaveActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveActionsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      SaveActionsComponent
    );

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the Save Draft action', () => {
    let emitted = false;

    component.saveDraft.subscribe(() => {
      emitted = true;
    });

    component.onSaveDraft();

    expect(emitted).toBe(true);
  });

  it('should emit Submit for Review', () => {
    let emitted = false;

    component.submitForReview.subscribe(() => {
      emitted = true;
    });

    component.onSubmitForReview();

    expect(emitted).toBe(true);
  });

  it('should not submit when disabled', () => {
    let emitted = false;

    component.submitDisabled = true;

    component.submitForReview.subscribe(() => {
      emitted = true;
    });

    component.onSubmitForReview();

    expect(emitted).toBe(false);
  });
});
