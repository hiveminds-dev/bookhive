import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import {
  ChangePassword
} from './change-password';

describe(
  'ChangePassword',
  () => {

    let component: ChangePassword;

    let fixture:
      ComponentFixture<ChangePassword>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          ChangePassword
        ],
        providers: [
          provideRouter([])
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          ChangePassword
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should start with invalid form',
      () => {
        expect(component.passwordForm.invalid)
          .toBe(true);
      }
    );

    it(
      'should detect mismatched passwords',
      () => {
        component.passwordForm.patchValue({
          currentPassword:
            'Current123',
          newPassword:
            'NewPassword123',
          confirmPassword:
            'DifferentPassword123'
        });

        expect(
          component.passwordForm.hasError(
            'passwordMismatch'
          )
        ).toBe(true);
      }
    );

    it(
      'should accept matching passwords',
      () => {
        component.passwordForm.patchValue({
          currentPassword:
            'Current123',
          newPassword:
            'NewPassword123',
          confirmPassword:
            'NewPassword123'
        });

        expect(component.passwordForm.valid)
          .toBe(true);
      }
    );
  }
);
