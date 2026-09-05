import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AdminApiService, AuthorApplicationItem, AuthorStats } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthorsComponent } from './authors';

describe('AuthorsComponent', () => {
  let component: AuthorsComponent;
  let fixture: ComponentFixture<AuthorsComponent>;
  let adminApiMock: {
    getAuthorStats: ReturnType<typeof vi.fn>;
    getAuthorApplications: ReturnType<typeof vi.fn>;
    approveAuthor: ReturnType<typeof vi.fn>;
    rejectAuthor: ReturnType<typeof vi.fn>;
  };
  let toastServiceMock: {
    success: ReturnType<typeof vi.fn>;
    warning: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
  };

  const mockStats: AuthorStats = {
    new_applications: 3,
    total_authors: 12,
    books_in_review: 4,
    total_rejected: 2,
  };

  const mockAuthors: AuthorApplicationItem[] = [
    {
      id: 10,
      user_id: 10,
      full_name: 'Julian Thorne',
      pen_name: 'J. Thistle',
      email: 'j.thorne@writes.org',
      country: 'United Kingdom',
      account_status: 'pending',
      profile_image_path: null,
      bio: 'Historical fiction author.',
      applied_date: '2026-01-10T12:00:00Z',
    },
    {
      id: 11,
      user_id: 11,
      full_name: 'Eleanor Vance',
      pen_name: 'E. V. Sterling',
      email: 'eleanor.v@lumina.com',
      country: 'United Kingdom',
      account_status: 'approved',
      profile_image_path: null,
      bio: 'Philosophy literature author.',
      applied_date: '2026-01-05T10:00:00Z',
    },
  ];

  beforeEach(async () => {
    adminApiMock = {
      getAuthorStats: vi.fn().mockReturnValue(of(mockStats)),
      getAuthorApplications: vi.fn().mockReturnValue(of(mockAuthors)),
      approveAuthor: vi.fn().mockReturnValue(of({ message: 'Author approved successfully.' })),
      rejectAuthor: vi.fn().mockReturnValue(of({ message: 'Author rejected successfully.' })),
    };

    toastServiceMock = {
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AuthorsComponent],
      providers: [
        provideRouter([]),
        { provide: AdminApiService, useValue: adminApiMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component and load author applications and stats on init', () => {
    expect(component).toBeTruthy();
    expect(adminApiMock.getAuthorStats).toHaveBeenCalled();
    expect(adminApiMock.getAuthorApplications).toHaveBeenCalled();
    expect(component.authorsSignal().length).toBe(2);
    expect(component.authorStatsSignal()).toEqual(mockStats);
    expect(component.loading()).toBe(false);
  });

  it('should filter authors by search query correctly', () => {
    component.onSearchInput('Julian');
    fixture.detectChanges();

    const filtered = component.filteredAuthors;
    expect(filtered.length).toBe(1);
    expect(filtered[0].full_name).toBe('Julian Thorne');
  });

  it('should approve an author, update local status, refresh summary statistics, and show success toast', () => {
    const pendingAuthor = mockAuthors[0];
    const updatedStats: AuthorStats = {
      ...mockStats,
      new_applications: 2,
      total_authors: 13,
    };
    adminApiMock.getAuthorStats.mockReturnValue(of(updatedStats));

    component.approveAuthor(pendingAuthor);

    expect(adminApiMock.approveAuthor).toHaveBeenCalledWith(pendingAuthor.user_id);
    const updatedAuthor = component.authorsSignal().find((a) => a.user_id === pendingAuthor.user_id);
    expect(updatedAuthor?.account_status).toBe('approved');
    expect(adminApiMock.getAuthorStats).toHaveBeenCalledTimes(2); // Initial + after approval
    expect(toastServiceMock.success).toHaveBeenCalledWith(
      expect.stringContaining('Approved Julian Thorne'),
      'Request Approved'
    );
  });

  it('should open the rejection confirmation modal when rejecting an author', () => {
    const author = mockAuthors[0];

    component.openRejectModal(author);
    fixture.detectChanges();

    expect(component.authorToReject()).toEqual(author);
    expect(component.rejectionReason()).toBe('');
    expect(component.rejectionError()).toBeNull();
  });

  it('should not submit rejection with an empty or whitespace-only reason', () => {
    const author = mockAuthors[0];
    component.openRejectModal(author);

    component.onRejectionReasonChange('   ');
    component.confirmRejectAuthor();

    expect(component.rejectionError()).toBe('A rejection reason is required.');
    expect(adminApiMock.rejectAuthor).not.toHaveBeenCalled();
  });

  it('should reject an author with a valid reason, update local status, refresh summary statistics, close modal, and show warning toast', () => {
    const author = mockAuthors[0];
    const validReason = 'The submitted author credentials cannot be verified against official publisher records.';
    const updatedStats: AuthorStats = {
      ...mockStats,
      new_applications: 2,
      total_rejected: 3,
    };
    adminApiMock.getAuthorStats.mockReturnValue(of(updatedStats));

    component.openRejectModal(author);
    component.onRejectionReasonChange(validReason);
    component.confirmRejectAuthor();

    expect(adminApiMock.rejectAuthor).toHaveBeenCalledWith(author.user_id, validReason);
    const updatedAuthor = component.authorsSignal().find((a) => a.user_id === author.user_id);
    expect(updatedAuthor?.account_status).toBe('rejected');
    expect(updatedAuthor?.rejection_reason).toBe(validReason);
    expect(component.authorToReject()).toBeNull();
    expect(adminApiMock.getAuthorStats).toHaveBeenCalledTimes(2);
    expect(toastServiceMock.warning).toHaveBeenCalledWith(
      expect.stringContaining('Rejected application for Julian Thorne'),
      'Request Rejected'
    );
  });

  it('should keep rejection modal open and display error message when backend rejection fails', () => {
    const author = mockAuthors[0];
    adminApiMock.rejectAuthor.mockReturnValue(
      throwError(() => ({
        error: { detail: 'Author application was already processed.' },
      }))
    );

    component.openRejectModal(author);
    component.onRejectionReasonChange('Insufficient verification documents.');
    component.confirmRejectAuthor();

    expect(component.isRejecting()).toBe(false);
    expect(component.rejectionError()).toBe('Author application was already processed.');
    expect(component.authorToReject()).toEqual(author); // Modal remains open
  });

  it('should display error toast when backend approval fails', () => {
    const author = mockAuthors[0];
    adminApiMock.approveAuthor.mockReturnValue(
      throwError(() => ({
        error: { detail: 'User is not an author application.' },
      }))
    );

    component.approveAuthor(author);

    expect(component.isApproving()).toBe(false);
    expect(toastServiceMock.warning).toHaveBeenCalledWith(
      'User is not an author application.',
      'Error'
    );
  });
});
