import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Auth } from '../../../core/services/auth';
import {
  ProfileImageResponse,
  UserProfile,
  UserProfileService,
} from '../../../core/services/user-profile.service';
import { ReaderProfile } from './profile';

describe('ReaderProfile', () => {
  let component: ReaderProfile;
  let fixture: ComponentFixture<ReaderProfile>;
  let userProfileService: {
    getMyProfile: ReturnType<typeof vi.fn>;
    updateMyProfile: ReturnType<typeof vi.fn>;
    uploadProfileImage: ReturnType<typeof vi.fn>;
    deleteProfileImage: ReturnType<typeof vi.fn>;
  };
  let authService: {
    currentUser: ReturnType<typeof signal>;
    updateCurrentUserState: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  const mockProfile: UserProfile = {
    id: 42,
    full_name: 'Liam Henderson',
    username: 'liamh',
    email: 'liam.henderson@mail.com',
    role: 'reader',
    account_status: 'active',
    email_verified: true,
    created_at: '2026-01-15T12:00:00Z',
    updated_at: '2026-01-20T12:00:00Z',
    country: 'United States',
    preferred_language: 'English',
    short_bio: 'Passionate about history and philosophy literature.',
    profile_image_path: 'storage/profiles/avatar_42.jpg',
    profile_image_url: '/storage/profiles/avatar_42.jpg',
  };

  beforeEach(async () => {
    userProfileService = {
      getMyProfile: vi.fn().mockReturnValue(of(mockProfile)),
      updateMyProfile: vi.fn(),
      uploadProfileImage: vi.fn(),
      deleteProfileImage: vi.fn(),
    };

    authService = {
      currentUser: signal({
        id: 42,
        full_name: 'Liam Henderson',
        username: 'liamh',
        email: 'liam.henderson@mail.com',
        role: 'reader' as const,
        account_status: 'active',
        email_verified: true,
      }),
      updateCurrentUserState: vi.fn(),
      logout: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [ReaderProfile],
      providers: [
        provideRouter([]),
        { provide: UserProfileService, useValue: userProfileService },
        { provide: Auth, useValue: authService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    fixture = TestBed.createComponent(ReaderProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load profile on init', () => {
    expect(component).toBeTruthy();
    expect(userProfileService.getMyProfile).toHaveBeenCalledTimes(1);
    expect(component.profile()).toEqual(mockProfile);
    expect(component.isLoading()).toBe(false);
  });

  it('should render profile name, username, badges, and bio in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Liam Henderson');
    expect(compiled.textContent).toContain('@liamh');
    expect(compiled.textContent).toContain('liam.henderson@mail.com');
    expect(compiled.textContent).toContain('Active Account');
    expect(compiled.textContent).toContain('Email Verified');
    expect(compiled.textContent).toContain('Passionate about history and philosophy literature.');
    expect(compiled.textContent).toContain('United States');
    expect(compiled.textContent).toContain('English');
  });

  it('should calculate initials correctly and display initials fallback on missing avatar or load error', () => {
    expect(component.initials()).toBe('LH');

    component.onAvatarError();
    fixture.detectChanges();

    expect(component.hasAvatarImage()).toBe(false);
    const compiled = fixture.nativeElement as HTMLElement;
    const initialsElem = compiled.querySelector('.avatar-initials');
    expect(initialsElem?.textContent?.trim()).toBe('LH');
  });

  it('should show error state when profile loading fails and retry successfully', () => {
    userProfileService.getMyProfile.mockReturnValue(throwError(() => new Error('Network error')));
    component.loadProfile();
    fixture.detectChanges();

    expect(component.errorMessage()).toContain('Failed to load your profile');
    expect(component.isLoading()).toBe(false);

    // Now retry with success
    userProfileService.getMyProfile.mockReturnValue(of(mockProfile));
    component.loadProfile();
    fixture.detectChanges();

    expect(component.errorMessage()).toBeNull();
    expect(component.profile()).toEqual(mockProfile);
  });

  it('should open edit modal and pre-fill form with current profile data', () => {
    component.openEditModal();
    fixture.detectChanges();

    expect(component.isEditModalOpen()).toBe(true);
    expect(component.editForm.get('fullName')?.value).toBe('Liam Henderson');
    expect(component.editForm.get('username')?.value).toBe('liamh');
    expect(component.editForm.get('country')?.value).toBe('United States');
    expect(component.editForm.get('preferredLanguage')?.value).toBe('English');
    expect(component.editForm.get('shortBio')?.value).toBe('Passionate about history and philosophy literature.');
  });

  it('should validate edit form fields (reject invalid names and invalid usernames)', () => {
    component.openEditModal();

    // Blank full name
    component.editForm.patchValue({ fullName: ' ' });
    expect(component.editForm.get('fullName')?.valid).toBe(false);

    // Invalid username with space and starting with digit
    component.editForm.patchValue({ username: '123 user' });
    expect(component.editForm.get('username')?.valid).toBe(false);

    // Valid inputs
    component.editForm.patchValue({ fullName: 'Liam Updated', username: 'liam_updated' });
    expect(component.editForm.valid).toBe(true);
  });

  it('should save profile successfully and update Auth and view state', () => {
    const updatedProfile: UserProfile = {
      ...mockProfile,
      full_name: 'Liam Updated',
      username: 'liam_updated',
      country: 'Canada',
    };
    userProfileService.updateMyProfile.mockReturnValue(of(updatedProfile));

    component.openEditModal();
    component.editForm.patchValue({
      fullName: 'Liam Updated',
      username: 'liam_updated',
      country: 'Canada',
    });

    component.onSaveProfile();

    expect(userProfileService.updateMyProfile).toHaveBeenCalledWith({
      full_name: 'Liam Updated',
      username: 'liam_updated',
      country: 'Canada',
      preferred_language: 'English',
      short_bio: 'Passionate about history and philosophy literature.',
    });
    expect(component.profile()).toEqual(updatedProfile);
    expect(component.isEditModalOpen()).toBe(false);
    expect(authService.updateCurrentUserState).toHaveBeenCalledWith({
      full_name: 'Liam Updated',
      username: 'liam_updated',
    });
    expect(component.successMessage()).toBe('Profile updated successfully.');
  });

  it('should handle duplicate username conflict error (409) gracefully', () => {
    userProfileService.updateMyProfile.mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'Username is already registered' } })),
    );

    component.openEditModal();
    component.editForm.patchValue({ username: 'existinguser' });
    component.onSaveProfile();

    expect(component.editFormError()).toBe('This username is already taken. Please choose another.');
    expect(component.isEditModalOpen()).toBe(true);
  });

  it('should validate avatar file type and size on client side', () => {
    component.openAvatarModal();

    // Invalid file type
    const textBlob = new Blob(['hello'], { type: 'text/plain' });
    const textFile = new File([textBlob], 'test.txt', { type: 'text/plain' });
    component.onFileSelected({ target: { files: [textFile] } } as unknown as Event);
    expect(component.avatarFormError()).toContain('Only JPG, JPEG, PNG, and WebP');
    expect(component.selectedAvatarFile()).toBeNull();

    // Oversized file (> 5MB)
    const bigBlob = new Blob([new Uint8Array(6 * 1024 * 1024)], { type: 'image/jpeg' });
    const bigFile = new File([bigBlob], 'big.jpg', { type: 'image/jpeg' });
    component.onFileSelected({ target: { files: [bigFile] } } as unknown as Event);
    expect(component.avatarFormError()).toContain('exceeds the 5 MB limit');
    expect(component.selectedAvatarFile()).toBeNull();

    // Valid file
    const validBlob = new Blob(['valid image'], { type: 'image/png' });
    const validFile = new File([validBlob], 'avatar.png', { type: 'image/png' });
    component.onFileSelected({ target: { files: [validFile] } } as unknown as Event);
    expect(component.avatarFormError()).toBeNull();
    expect(component.selectedAvatarFile()).toBe(validFile);
  });

  it('should upload profile image and update avatar URL in profile signal', () => {
    const uploadResponse: ProfileImageResponse = {
      message: 'Profile image uploaded successfully',
      profile_image_path: 'storage/profiles/new_avatar.png',
      profile_image_url: '/storage/profiles/new_avatar.png',
    };
    userProfileService.uploadProfileImage.mockReturnValue(of(uploadResponse));

    component.openAvatarModal();
    const validBlob = new Blob(['valid image'], { type: 'image/png' });
    const validFile = new File([validBlob], 'avatar.png', { type: 'image/png' });
    component.onFileSelected({ target: { files: [validFile] } } as unknown as Event);

    component.onUploadAvatar();

    expect(userProfileService.uploadProfileImage).toHaveBeenCalledWith(validFile);
    expect(component.profile()?.profile_image_url).toBe('/storage/profiles/new_avatar.png');
    expect(component.isAvatarModalOpen()).toBe(false);
    expect(component.successMessage()).toBe('Profile image updated successfully.');
  });

  it('should remove profile image when onDeleteAvatar is called', () => {
    userProfileService.deleteProfileImage.mockReturnValue(of({ message: 'Profile image removed successfully' }));

    component.openAvatarModal();
    component.onDeleteAvatar();

    expect(userProfileService.deleteProfileImage).toHaveBeenCalled();
    expect(component.profile()?.profile_image_url).toBeNull();
    expect(component.isAvatarModalOpen()).toBe(false);
    expect(component.successMessage()).toBe('Profile image removed.');
  });

  it('should log out and navigate to /login when onLogout is called', () => {
    component.onLogout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
