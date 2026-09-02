import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ReaderDetailComponent } from './reader-detail';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { ToastService } from '../../../../core/services/toast.service';

describe('ReaderDetailComponent', () => {
  let component: ReaderDetailComponent;
  let fixture: ComponentFixture<ReaderDetailComponent>;
  let adminApi: AdminApiService;

  const sampleReader = {
    id: 7,
    full_name: 'Liam Henderson',
    username: 'liamh',
    email: 'liam.henderson@mail.com',
    account_status: 'active',
    email_verified: true,
    joined_at: '2026-08-15T12:00:00Z',
    country: 'United Kingdom',
    short_bio: 'Philosophy enthusiast',
    review_count: 1,
    reviews: [
      {
        id: 1,
        book_id: 1,
        book_title: 'Beyond Good and Evil',
        book_cover_url: '/storage/covers/1.jpg',
        book_author: 'F. Nietzsche',
        rating: 5,
        comment: 'Brilliant masterpiece',
        created_at: '2026-08-20T10:00:00Z',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReaderDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: '7' } },
          },
        },
        AdminApiService,
        ToastService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReaderDetailComponent);
    component = fixture.componentInstance;
    adminApi = TestBed.inject(AdminApiService);
  });

  it('should create and load reader details on init', () => {
    vi.spyOn(adminApi, 'getReaderDetail').mockReturnValue(of(sampleReader));
    component.ngOnInit();

    expect(adminApi.getReaderDetail).toHaveBeenCalledWith(7);
    expect(component.reader()).toBeTruthy();
    expect(component.reader()?.full_name).toBe('Liam Henderson');
    expect(component.reader()?.reviews.length).toBe(1);
  });

  it('should generate initials properly', () => {
    expect(component.getInitials('Liam Henderson')).toBe('LH');
    expect(component.getInitials('Marcus')).toBe('MA');
    expect(component.getInitials('')).toBe('RD');
  });

  it('should prompt confirmation modal and suspend reader on confirm, then reload reader details', () => {
    const suspendedReader = { ...sampleReader, account_status: 'suspended' };
    const getReaderSpy = vi.spyOn(adminApi, 'getReaderDetail')
      .mockReturnValueOnce(of(sampleReader))
      .mockReturnValueOnce(of(suspendedReader));

    const updateSpy = vi.spyOn(adminApi, 'updateReaderStatus').mockReturnValue(
      of({ success: true, message: 'Reader account has been suspended.' })
    );

    component.ngOnInit();
    expect(getReaderSpy).toHaveBeenCalledTimes(1);

    component.promptSuspend();
    expect(component.showConfirmModal()).toBe(true);
    expect(component.confirmActionType()).toBe('suspend');

    component.confirmAction();
    expect(updateSpy).toHaveBeenCalledWith(7, 'suspended');
    expect(getReaderSpy).toHaveBeenCalledTimes(2);
    expect(component.reader()?.account_status).toBe('suspended');
    expect(component.showConfirmModal()).toBe(false);
  });

  it('should prompt confirmation modal and reactivate reader on confirm, then reload reader details', () => {
    const suspendedReader = { ...sampleReader, account_status: 'suspended' };
    const activeReader = { ...sampleReader, account_status: 'active' };
    const getReaderSpy = vi.spyOn(adminApi, 'getReaderDetail')
      .mockReturnValueOnce(of(suspendedReader))
      .mockReturnValueOnce(of(activeReader));

    const updateSpy = vi.spyOn(adminApi, 'updateReaderStatus').mockReturnValue(
      of({ success: true, message: 'Reader account has been reactivated.' })
    );

    component.ngOnInit();
    expect(getReaderSpy).toHaveBeenCalledTimes(1);

    component.promptReactivate();
    expect(component.showConfirmModal()).toBe(true);
    expect(component.confirmActionType()).toBe('reactivate');

    component.confirmAction();
    expect(updateSpy).toHaveBeenCalledWith(7, 'active');
    expect(getReaderSpy).toHaveBeenCalledTimes(2);
    expect(component.reader()?.account_status).toBe('active');
    expect(component.showConfirmModal()).toBe(false);
  });

  it('should send password reset email on confirm', () => {
    vi.spyOn(adminApi, 'getReaderDetail').mockReturnValue(of(sampleReader));
    const resetSpy = vi.spyOn(adminApi, 'resetReaderPassword').mockReturnValue(
      of({ success: true, message: 'Password reset instructions sent.' })
    );

    component.ngOnInit();
    component.promptResetPassword();
    expect(component.showConfirmModal()).toBe(true);
    expect(component.confirmActionType()).toBe('reset-password');

    component.confirmAction();
    expect(resetSpy).toHaveBeenCalledWith(7);
    expect(component.showConfirmModal()).toBe(false);
  });

  it('should handle error when reader password reset fails and allow retry', () => {
    vi.spyOn(adminApi, 'getReaderDetail').mockReturnValue(of(sampleReader));
    vi.spyOn(adminApi, 'resetReaderPassword').mockReturnValue(
      throwError(() => ({ error: { detail: 'Mail service unavailable' } }))
    );
    const toastService = TestBed.inject(ToastService);
    const toastErrorSpy = vi.spyOn(toastService, 'error');

    component.ngOnInit();
    component.promptResetPassword();
    component.confirmAction();

    expect(toastErrorSpy).toHaveBeenCalledWith('Mail service unavailable', 'Reset Failed');
    expect(component.isProcessing()).toBe(false);
    expect(component.showConfirmModal()).toBe(true);
  });

  it('should handle error when reader status update fails', () => {
    vi.spyOn(adminApi, 'getReaderDetail').mockReturnValue(of(sampleReader));
    vi.spyOn(adminApi, 'updateReaderStatus').mockReturnValue(
      throwError(() => ({ error: { detail: 'Cannot update status' } }))
    );
    const toastService = TestBed.inject(ToastService);
    const toastErrorSpy = vi.spyOn(toastService, 'error');

    component.ngOnInit();
    component.promptSuspend();
    component.confirmAction();

    expect(toastErrorSpy).toHaveBeenCalledWith('Cannot update status', 'Status Error');
    expect(component.isProcessing()).toBe(false);
  });

  it('should cancel confirmation modal cleanly', () => {
    component.promptSuspend();
    expect(component.showConfirmModal()).toBe(true);
    component.cancelConfirm();
    expect(component.showConfirmModal()).toBe(false);
    expect(component.confirmActionType()).toBeNull();
  });
});
