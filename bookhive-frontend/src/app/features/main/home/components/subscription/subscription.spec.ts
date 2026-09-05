import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SubscriptionComponent } from './subscription';

describe('SubscriptionComponent', () => {
  let component: SubscriptionComponent;
  let fixture: ComponentFixture<SubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create SubscriptionComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should emit registerClick when onRegister is called', () => {
    let registerEmitted = false;
    component.registerClick.subscribe(() => {
      registerEmitted = true;
    });

    component.onRegister();
    expect(registerEmitted).toBe(true);
  });

  it('should emit exploreClick when onExplore is called', () => {
    let exploreEmitted = false;
    component.exploreClick.subscribe(() => {
      exploreEmitted = true;
    });

    component.onExplore();
    expect(exploreEmitted).toBe(true);
  });
});
