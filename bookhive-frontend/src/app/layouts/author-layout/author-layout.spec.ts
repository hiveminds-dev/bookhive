import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Auth } from '../../core/services/auth';
import { AuthorLayoutComponent } from './author-layout';

describe('AuthorLayoutComponent', () => {
  let component: AuthorLayoutComponent;
  let fixture: ComponentFixture<AuthorLayoutComponent>;

  beforeEach(async () => {
    const currentUser = signal({
      id: 1,
      full_name: 'Eleanor Vance',
      username: 'eleanorv',
      email: 'eleanor.v@lumina.com',
      role: 'author' as const,
      account_status: 'approved',
      email_verified: true,
    });

    await TestBed.configureTestingModule({
      imports: [AuthorLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: {
            currentUser: currentUser.asReadonly(),
            logout: () => ({ subscribe: () => undefined }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorLayoutComponent);
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

  it('should show the logged-in author name and initials', () => {
    expect(component.authorName()).toBe('Eleanor Vance');
    expect(component.avatarInitials()).toBe('EV');
  });
});
