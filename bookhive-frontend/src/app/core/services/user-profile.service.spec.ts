import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  ProfileImageResponse,
  UserProfile,
  UserProfileService,
  UserProfileUpdate,
} from './user-profile.service';

describe('UserProfileService', () => {
  let service: UserProfileService;
  let httpTesting: HttpTestingController;

  const mockProfile: UserProfile = {
    id: 1,
    full_name: 'Liam Henderson',
    username: 'liamh',
    email: 'liam.henderson@mail.com',
    role: 'reader',
    account_status: 'active',
    email_verified: true,
    created_at: '2026-01-01T12:00:00Z',
    updated_at: '2026-01-01T12:00:00Z',
    country: 'United States',
    preferred_language: 'English',
    short_bio: 'Avid reader.',
    profile_image_path: 'storage/profiles/avatar.jpg',
    profile_image_url: '/storage/profiles/avatar.jpg',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserProfileService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UserProfileService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch current user profile via GET /api/users/me', () => {
    service.getMyProfile().subscribe((profile) => {
      expect(profile).toEqual(mockProfile);
      expect(profile.username).toBe('liamh');
      expect(profile.country).toBe('United States');
    });

    const req = httpTesting.expectOne('/api/users/me');
    expect(req.request.method).toBe('GET');
    req.flush(mockProfile);
  });

  it('should update user profile via PATCH /api/users/me', () => {
    const updateData: UserProfileUpdate = {
      full_name: 'Liam Updated',
      country: 'Canada',
    };
    const updatedProfile = { ...mockProfile, ...updateData };

    service.updateMyProfile(updateData).subscribe((profile) => {
      expect(profile.full_name).toBe('Liam Updated');
      expect(profile.country).toBe('Canada');
    });

    const req = httpTesting.expectOne('/api/users/me');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(updateData);
    req.flush(updatedProfile);
  });

  it('should upload profile image via POST /api/users/me/profile-image', () => {
    const blob = new Blob(['dummy image'], { type: 'image/jpeg' });
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

    const mockResponse: ProfileImageResponse = {
      message: 'Profile image uploaded successfully',
      profile_image_path: 'storage/profiles/avatar.jpg',
      profile_image_url: '/storage/profiles/avatar.jpg',
    };

    service.uploadProfileImage(file).subscribe((res) => {
      expect(res.profile_image_url).toBe('/storage/profiles/avatar.jpg');
    });

    const req = httpTesting.expectOne('/api/users/me/profile-image');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(mockResponse);
  });

  it('should delete profile image via DELETE /api/users/me/profile-image', () => {
    service.deleteProfileImage().subscribe((res) => {
      expect(res.message).toBe('Profile image removed successfully');
    });

    const req = httpTesting.expectOne('/api/users/me/profile-image');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Profile image removed successfully' });
  });
});
