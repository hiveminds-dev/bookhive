import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideBookOpen,
  LucideCalendar,
  LucideCamera,
  LucideCheckCircle,
  LucideEdit3,
  LucideGlobe,
  LucideLock,
  LucideLogOut,
  LucideMapPin,
  LucideRotateCw,
  LucideShieldCheck,
  LucideSparkles,
  LucideTrash2,
  LucideUpload,
  LucideUser,
  LucideX,
} from '@lucide/angular';

import { Auth } from '../../../core/services/auth';
import {
  UserProfile,
  UserProfileService,
  UserProfileUpdate,
} from '../../../core/services/user-profile.service';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@Component({
  selector: 'app-reader-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    TitleCasePipe,
    LucideUser,
    LucideMapPin,
    LucideGlobe,
    LucideCalendar,
    LucideCheckCircle,
    LucideAlertCircle,
    LucideEdit3,
    LucideCamera,
    LucideLock,
    LucideBookOpen,
    LucideLogOut,
    LucideX,
    LucideRotateCw,
    LucideTrash2,
    LucideUpload,
    LucideShieldCheck,
    LucideSparkles,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ReaderProfile implements OnInit {
  private readonly userProfileService = inject(UserProfileService);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly profile = signal<UserProfile | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly avatarLoadFailed = signal<boolean>(false);

  // Modals state
  readonly isEditModalOpen = signal<boolean>(false);
  readonly isAvatarModalOpen = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly isUploadingAvatar = signal<boolean>(false);
  readonly editFormError = signal<string | null>(null);
  readonly avatarFormError = signal<string | null>(null);

  // Avatar upload state
  readonly selectedAvatarFile = signal<File | null>(null);
  readonly avatarPreviewUrl = signal<string | null>(null);

  readonly editForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern('^[A-Za-z][A-Za-z0-9_]*$'),
      ],
    ],
    country: ['', [Validators.maxLength(100)]],
    preferredLanguage: ['', [Validators.maxLength(50)]],
    shortBio: ['', [Validators.maxLength(500)]],
  });

  readonly initials = computed(() => {
    const name = this.profile()?.full_name?.trim();
    if (!name) return 'R';
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  readonly hasAvatarImage = computed(() => {
    const url = this.profile()?.profile_image_url;
    return Boolean(url && !this.avatarLoadFailed());
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.avatarLoadFailed.set(false);

    this.userProfileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage.set('Failed to load your profile. Please check your connection and try again.');
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  openEditModal(): void {
    const p = this.profile();
    if (!p) return;

    this.editForm.reset({
      fullName: p.full_name,
      username: p.username,
      country: p.country || '',
      preferredLanguage: p.preferred_language || '',
      shortBio: p.short_bio || '',
    });

    this.editFormError.set(null);
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    if (this.isSaving()) return;
    this.isEditModalOpen.set(false);
    this.editFormError.set(null);
  }

  onSaveProfile(): void {
    if (this.editForm.invalid || this.isSaving()) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.editFormError.set(null);

    const formValues = this.editForm.value;
    const updatePayload: UserProfileUpdate = {
      full_name: formValues.fullName.trim(),
      username: formValues.username.trim().toLowerCase(),
      country: formValues.country ? formValues.country.trim() : null,
      preferred_language: formValues.preferredLanguage ? formValues.preferredLanguage.trim() : null,
      short_bio: formValues.shortBio ? formValues.shortBio.trim() : null,
    };

    this.userProfileService.updateMyProfile(updatePayload).subscribe({
      next: (updatedProfile) => {
        this.profile.set(updatedProfile);
        this.isSaving.set(false);
        this.isEditModalOpen.set(false);
        this.showTemporarySuccess('Profile updated successfully.');

        // Synchronize auth state for navigation headers
        this.auth.updateCurrentUserState({
          full_name: updatedProfile.full_name,
          username: updatedProfile.username,
        });

        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSaving.set(false);
        if (err.status === 409) {
          this.editFormError.set('This username is already taken. Please choose another.');
        } else if (err.status === 422 && err.error?.detail) {
          const detail = Array.isArray(err.error.detail)
            ? err.error.detail.map((d: { msg?: string }) => d.msg || '').join(', ')
            : String(err.error.detail);
          this.editFormError.set(`Validation error: ${detail}`);
        } else {
          this.editFormError.set('An error occurred while saving your profile. Please try again.');
        }
        this.cdr.markForCheck();
      },
    });
  }

  openAvatarModal(): void {
    this.selectedAvatarFile.set(null);
    this.avatarPreviewUrl.set(null);
    this.avatarFormError.set(null);
    this.isAvatarModalOpen.set(true);
  }

  closeAvatarModal(): void {
    if (this.isUploadingAvatar()) return;
    this.isAvatarModalOpen.set(false);
    this.selectedAvatarFile.set(null);
    this.avatarPreviewUrl.set(null);
    this.avatarFormError.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.avatarFormError.set(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      this.avatarFormError.set('Only JPG, JPEG, PNG, and WebP images are allowed.');
      input.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      this.avatarFormError.set('File size exceeds the 5 MB limit. Please select a smaller image.');
      input.value = '';
      return;
    }

    this.selectedAvatarFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreviewUrl.set(reader.result as string);
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  onUploadAvatar(): void {
    const file = this.selectedAvatarFile();
    if (!file || this.isUploadingAvatar()) {
      return;
    }

    this.isUploadingAvatar.set(true);
    this.avatarFormError.set(null);

    this.userProfileService.uploadProfileImage(file).subscribe({
      next: (response) => {
        const current = this.profile();
        if (current) {
          this.profile.set({
            ...current,
            profile_image_path: response.profile_image_path,
            profile_image_url: response.profile_image_url,
          });
        }
        this.avatarLoadFailed.set(false);
        this.isUploadingAvatar.set(false);
        this.closeAvatarModal();
        this.showTemporarySuccess('Profile image updated successfully.');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isUploadingAvatar.set(false);
        const message = err.error?.detail || 'Failed to upload profile image. Please try again.';
        this.avatarFormError.set(message);
        this.cdr.markForCheck();
      },
    });
  }

  onDeleteAvatar(): void {
    if (this.isUploadingAvatar()) return;

    this.isUploadingAvatar.set(true);
    this.avatarFormError.set(null);

    this.userProfileService.deleteProfileImage().subscribe({
      next: () => {
        const current = this.profile();
        if (current) {
          this.profile.set({
            ...current,
            profile_image_path: null,
            profile_image_url: null,
          });
        }
        this.avatarLoadFailed.set(false);
        this.isUploadingAvatar.set(false);
        this.closeAvatarModal();
        this.showTemporarySuccess('Profile image removed.');
        this.cdr.markForCheck();
      },
      error: () => {
        this.isUploadingAvatar.set(false);
        this.avatarFormError.set('Failed to remove profile image. Please try again.');
        this.cdr.markForCheck();
      },
    });
  }

  onAvatarError(): void {
    this.avatarLoadFailed.set(true);
    this.cdr.markForCheck();
  }

  onLogout(): void {
    this.auth.logout().subscribe({
      next: () => {
        void this.router.navigate(['/login']);
      },
      error: () => {
        void this.router.navigate(['/login']);
      },
    });
  }

  private showTemporarySuccess(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => {
      this.successMessage.set(null);
      this.cdr.markForCheck();
    }, 4000);
  }
}
