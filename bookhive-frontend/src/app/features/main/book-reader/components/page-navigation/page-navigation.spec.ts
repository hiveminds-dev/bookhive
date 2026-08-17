import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNavigationComponent } from './page-navigation';

describe('PageNavigationComponent', () => {
  let component: PageNavigationComponent;
  let fixture: ComponentFixture<PageNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageNavigationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PageNavigationComponent);
    component = fixture.componentInstance;

    component.currentPage = 15;
    component.totalPages = 120;
    component.secondsRemaining = 30;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate the reading percentage', () => {
    expect(component.readingPercentage).toBe(13);
  });

  it('should create the progress width', () => {
    expect(component.progressWidth).toBe('13%');
  });

  it('should not return a percentage above 100', () => {
    component.currentPage = 150;
    component.totalPages = 120;

    expect(component.readingPercentage).toBe(100);
  });

  it('should return zero when total pages is invalid', () => {
    component.totalPages = 0;

    expect(component.readingPercentage).toBe(0);
  });
});
