import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HeroComponent } from './hero';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create HeroComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should emit exploreClick when onExplore is called', () => {
    let clicked = false;
    component.exploreClick.subscribe(() => {
      clicked = true;
    });

    component.onExplore();
    expect(clicked).toBe(true);
  });

  it('should emit communityClick when onCommunity is called', () => {
    let clicked = false;
    component.communityClick.subscribe(() => {
      clicked = true;
    });

    component.onCommunity();
    expect(clicked).toBe(true);
  });
});
