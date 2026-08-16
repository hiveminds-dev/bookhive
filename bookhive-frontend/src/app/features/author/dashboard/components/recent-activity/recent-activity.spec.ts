import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  AuthorActivity,
  RecentActivityComponent
} from './recent-activity';

describe('RecentActivityComponent', () => {
  let component: RecentActivityComponent;
  let fixture: ComponentFixture<RecentActivityComponent>;

  const testActivity: AuthorActivity = {
    id: 1,
    title: 'Book approved: "Echoes of Gold"',
    description:
      'Your manuscript passed the final editorial review.',
    time: '2 hours ago',
    type: 'approved'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentActivityComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      RecentActivityComponent
    );

    component = fixture.componentInstance;
    component.activities = [testActivity];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive recent activities', () => {
    expect(component.activities.length).toBe(1);
  });

  it('should return the activity class', () => {
    expect(component.getActivityClass('approved'))
      .toBe('approved');
  });
});
