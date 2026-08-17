import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import {
  AuthorDashboardComponent
} from './dashboard';

describe('AuthorDashboardComponent', () => {
  let component: AuthorDashboardComponent;
  let fixture: ComponentFixture<AuthorDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorDashboardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(
      AuthorDashboardComponent
    );

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain four statistics', () => {
    expect(component.statistics.length).toBe(4);
  });

  it('should contain recent books', () => {
    expect(component.recentBooks.length).toBe(3);
  });

  it('should contain recent reviews', () => {
    expect(component.recentReviews.length).toBe(2);
  });

  it('should contain recent activities', () => {
    expect(component.activities.length).toBe(3);
  });
});
