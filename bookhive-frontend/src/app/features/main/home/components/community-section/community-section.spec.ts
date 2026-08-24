import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CommunitySectionComponent } from './community-section';

describe('CommunitySectionComponent', () => {
  let component: CommunitySectionComponent;
  let fixture: ComponentFixture<CommunitySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunitySectionComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunitySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create CommunitySectionComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should emit joinCommunityClick when onJoinCommunity is called', () => {
    let emitted = false;
    component.joinCommunityClick.subscribe(() => {
      emitted = true;
    });

    component.onJoinCommunity();
    expect(emitted).toBe(true);
  });
});
