import {
  Component,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import { Auth } from '../../../../core/services/auth';

import {
  ProfileImageUpload
} from './components/profile-image-upload/profile-image-upload';

import {
  PersonalDetails,
  PersonalDetailsValue
} from './components/personal-details/personal-details';

import {
  BiographyForm
} from './components/biography-form/biography-form';

import {
  SocialLinksForm,
  SocialLinksValue
} from './components/social-links-form/social-links-form';

import {
  ProfileSaveActions
} from './components/profile-save-actions/profile-save-actions';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    ProfileImageUpload,
    PersonalDetails,
    BiographyForm,
    SocialLinksForm,
    ProfileSaveActions
  ],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.scss'
})
export class EditProfile {

  private readonly router = inject(Router);
  private readonly auth = inject(Auth);

  readonly currentUser = this.auth.currentUser;

  profileImageUrl =
    'images/author/profile/profile-placeholder.jpg';

  selectedImage: File | null = null;

  personalDetails: PersonalDetailsValue = {
    fullName: this.currentUser()?.full_name || 'Author',
    penName: this.currentUser()?.username || 'Author Pen Name',
    email: this.currentUser()?.email || 'author@bookhive.com',
    phone: '+1 (555) 019-2834',
    country: 'United Kingdom',
    language: 'English (UK)',
    category: 'Fiction'
  };

  biography =
    'Published author dedicated to compelling storytelling, insightful literature, and enriching the BookHive reading community with quality manuscripts.';

  socialLinks: SocialLinksValue = {
    website: 'https://bookhive.com',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com'
  };

  isSaving = false;

  saveMessage = '';

  onImageChanged(
    file: File
  ): void {
    this.selectedImage = file;
  }

  onPersonalDetailsChanged(
    details: PersonalDetailsValue
  ): void {
    this.personalDetails = details;
  }

  onBiographyChanged(
    biography: string
  ): void {
    this.biography = biography;
  }

  onSocialLinksChanged(
    socialLinks: SocialLinksValue
  ): void {
    this.socialLinks = socialLinks;
  }

  cancelEditing(): void {
    this.router.navigate([
      '/author/profile'
    ]);
  }

  saveProfile(): void {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.saveMessage = '';

    const profileData = {
      ...this.personalDetails,
      biography: this.biography,
      socialLinks: this.socialLinks,
      profileImage: this.selectedImage
    };

    console.log(
      'Profile data ready for backend:',
      profileData
    );

    setTimeout(() => {
      this.isSaving = false;

      this.saveMessage =
        'Profile updated successfully.';

      setTimeout(() => {
        this.router.navigate([
          '/author/profile'
        ]);
      }, 900);
    }, 1000);
  }
}
