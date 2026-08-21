import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ProfileSaveActions
} from './profile-save-actions';

describe(
  'ProfileSaveActions',
  () => {

    let component:
      ProfileSaveActions;

    let fixture:
      ComponentFixture<ProfileSaveActions>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          ProfileSaveActions
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          ProfileSaveActions
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should emit cancel event',
      () => {
        let eventEmitted = false;

        component.cancelSelected
          .subscribe(() => {
            eventEmitted = true;
          });

        component.cancel();

        expect(eventEmitted).toBe(true);
      }
    );

    it(
      'should emit save event',
      () => {
        let eventEmitted = false;

        component.saveSelected
          .subscribe(() => {
            eventEmitted = true;
          });

        component.save();

        expect(eventEmitted).toBe(true);
      }
    );

    it(
      'should not save when disabled',
      () => {
        let eventEmitted = false;

        component.isSaveDisabled = true;

        component.saveSelected
          .subscribe(() => {
            eventEmitted = true;
          });

        component.save();

        expect(eventEmitted).toBe(false);
      }
    );
  }
);
