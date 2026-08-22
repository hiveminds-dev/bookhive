import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ProfileImageUpload
} from './profile-image-upload';

describe(
  'ProfileImageUpload',
  () => {

    let component:
      ProfileImageUpload;

    let fixture:
      ComponentFixture<ProfileImageUpload>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          ProfileImageUpload
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          ProfileImageUpload
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should have a default image',
      () => {
        expect(component.imageUrl.length)
          .toBeGreaterThan(0);
      }
    );

    it(
      'should activate dragging state',
      () => {
        const event =
          new DragEvent('dragover');

        component.onDragOver(event);

        expect(component.isDragging)
          .toBe(true);
      }
    );
  }
);
