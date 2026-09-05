import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ActiveMembers
} from './active-members';

describe('ActiveMembers', () => {

  let component:
    ActiveMembers;

  let fixture:
    ComponentFixture<ActiveMembers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ActiveMembers
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        ActiveMembers
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(
    'should contain four members',
    () => {
      expect(
        component.members.length
      ).toBe(4);
    }
  );

  it(
    'should follow a member',
    () => {
      const member =
        component.members[0];

      component.toggleFollow(member);

      expect(
        member.following
      ).toBe(true);
    }
  );

  it(
    'should unfollow a member',
    () => {
      const member =
        component.members[0];

      member.following = true;

      component.toggleFollow(member);

      expect(
        member.following
      ).toBe(false);
    }
  );

  it(
    'should emit changed member',
    () => {
      let selectedId = 0;

      component.followChanged
        .subscribe(member => {
          selectedId = member.id;
        });

      component.toggleFollow(
        component.members[0]
      );

      expect(selectedId).toBe(1);
    }
  );
});
