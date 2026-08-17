import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import {
  AuthorLayoutComponent
} from './author-layout';

describe('AuthorLayoutComponent', () => {
  let component: AuthorLayoutComponent;
  let fixture: ComponentFixture<AuthorLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorLayoutComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(
      AuthorLayoutComponent
    );

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close the mobile sidebar', () => {
    component.toggleSidebar();

    expect(component.mobileSidebarOpen).toBe(true);

    component.closeSidebar();

    expect(component.mobileSidebarOpen).toBe(false);
  });

  it('should open and close the profile menu', () => {
    component.toggleProfileMenu();

    expect(component.profileMenuOpen).toBe(true);

    component.closeProfileMenu();

    expect(component.profileMenuOpen).toBe(false);
  });

  it('should activate the avatar fallback', () => {
    component.onAvatarError();

    expect(component.avatarLoadFailed).toBe(true);
  });
});
