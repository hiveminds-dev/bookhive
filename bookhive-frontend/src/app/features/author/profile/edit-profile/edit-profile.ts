import {
  Component,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

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

  profileImageUrl =
    'images/author/profile/julian-barnes.jpg';

  selectedImage: File | null = null;

  personalDetails: PersonalDetailsValue = {
    fullName: 'Julian Barnes',
    penName: 'J.B. Aurelius',
    email: 'j.barnes@aurelius.com',
    phone: '+44 20 7946 0958',
    country: 'United Kingdom',
    language: 'English (UK)',
    category: 'Fiction'
  };

  biography =
    'Julian Barnes, writing under the prestigious pen name J.B. Aurelius, is a contemporary novelist and essayist whose work explores the intricate intersections of memory, historical truth, and the human condition.';

  socialLinks: SocialLinksValue = {
    website: 'https://example.com',
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
