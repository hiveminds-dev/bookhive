import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ProfileHeader
} from './profile-header';

describe(
  'ProfileHeader',
  () => {

    let component: ProfileHeader;

    let fixture:
      ComponentFixture<ProfileHeader>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          ProfileHeader
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          ProfileHeader
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should display default author name',
      () => {
        expect(component.authorName)
          .toBe('Julian Barnes');
      }
    );

    it(
      'should contain author badges',
      () => {
        expect(component.badges.length)
          .toBe(2);
      }
    );
  }
);
