import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  CommunitySidebar
} from './community-sidebar';

describe('CommunitySidebar', () => {

  let component:
    CommunitySidebar;

  let fixture:
    ComponentFixture<CommunitySidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommunitySidebar
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        CommunitySidebar
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(
    'should contain four guidelines',
    () => {
      expect(
        component.guidelines.length
      ).toBe(4);
    }
  );

  it(
    'should contain trending tags',
    () => {
      expect(
        component.tags.length
      ).toBeGreaterThan(0);
    }
  );

  it(
    'should emit selected community',
    () => {
      let selectedId = 0;

      component.communitySelected
        .subscribe(community => {
          selectedId =
            community.id;
        });

      component.selectCommunity(
        component.suggestedCommunities[0]
      );

      expect(selectedId).toBe(1);
    }
  );

  it(
    'should emit policy event',
    () => {
      let emitted = false;

      component.policySelected
        .subscribe(() => {
          emitted = true;
        });

      component.openPolicy();

      expect(emitted).toBe(true);
    }
  );
});
