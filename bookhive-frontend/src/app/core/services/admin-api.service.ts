import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

export interface DashboardStats {
  total_books: number;
  total_readers: number;
  total_authors: number;
  total_admins: number;
  book_requests: number;
  author_requests: number;
}

export interface BookReviewItem {
  id: number;
  user_name: string;
  avatar_letter: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface BookRejectionLogItem {
  id: number;
  reason: string;
  created_at: string;
}

export interface AdminBookItem {
  id: number;
  title: string;
  author_name: string;
  category_name: string;
  language: string | null;
  reading_level: string | null;
  status: string;
  cover_image_path: string | null;
  page_count?: number;
  estimated_reading_time?: string;
  average_rating?: number;
  review_count?: number;
  reviews?: BookReviewItem[];
  rejection_logs?: BookRejectionLogItem[];
  author_profile_image_path?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  published_at: string | null;
}

export interface CategoryAdminItem {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  total_books: number;
  created_at: string;
}

export interface PaginatedBookAdminResponse {
  items: AdminBookItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface AuthorStats {
  new_applications: number;
  total_authors: number;
  books_in_review: number;
  total_rejected: number;
}

export interface AuthorApplicationItem {
  id: number;
  user_id: number;
  full_name: string;
  pen_name: string;
  email: string;
  country: string | null;
  account_status: string;
  profile_image_path?: string | null;
  bio?: string | null;
  applied_date: string;
}

export interface MonthlyUploadItem {
  month: string;
  dark: number;
  light: number;
}

export interface MonthlyRegistrationItem {
  month: string;
  val: number;
}

export interface TopCategoryStatItem {
  name: string;
  pct: number;
}

export interface MostReadBookItem {
  id: number;
  title: string;
  author: string;
  category: string;
  totalReads: string;
  rating: string;
  trend: string;
  cover?: string | null;
}

export interface ActiveAuthorItem {
  name: string;
  booksCount: number;
  score: string;
  avatar?: string | null;
}

export interface ActiveReaderItem {
  name: string;
  joined: string;
  totalReads: number;
  initials: string;
}

export interface PlatformStatistics {
  total_books: number;
  total_readers: number;
  total_authors: number;
  total_downloads: string;
  total_views: string;
  monthly_uploads: MonthlyUploadItem[];
  monthly_registrations: MonthlyRegistrationItem[];
  top_categories: TopCategoryStatItem[];
  most_read_books: MostReadBookItem[];
  active_authors: ActiveAuthorItem[];
  active_readers: ActiveReaderItem[];
}

export interface AdminStaffStats {
  total_admin_accounts: number;
  super_admins: number;
  two_fa_protected_count: number;
  two_fa_total: number;
  pending_invites: number;
}

export interface AdminUserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  role_badge_class: string;
  department: string;
  last_active: string;
  two_factor: boolean;
  status: string;
  avatar: string;
}

export interface ReaderItem {
  id: number;
  full_name: string;
  username: string;
  email: string;
  account_status: string;
  joined_at: string;
}

export interface RecentBookItem {
  id: number;
  title: string;
  author_name: string;
  category_name: string;
  status: string;
  cover_image_path: string | null;
  created_at: string;
}

export interface RecentReaderItem {
  id: number;
  full_name: string;
  username: string;
  joined_at: string;
}

export interface RecentAuthorRequestItem {
  id: number;
  user_id: number;
  full_name: string;
  pen_name: string;
  country: string | null;
  created_at?: string;
}

export interface DashboardRecent {
  recent_books: RecentBookItem[];
  recent_readers: RecentReaderItem[];
  pending_author_requests: RecentAuthorRequestItem[];
}

export interface SystemLogItem {
  timestamp: string;
  level: string;
  module: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private readonly http = inject(HttpClient);

  // Cached so RecentBooks, RecentAuthors, RecentRequests all share one HTTP call
  private dashboardRecentCache$: Observable<DashboardRecent> | null = null;

  // ─── Dashboard ────────────────────────────────────────────────────────────

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>('/api/admin/dashboard/stats');
  }

  getDashboardRecent(): Observable<DashboardRecent> {
    if (!this.dashboardRecentCache$) {
      this.dashboardRecentCache$ = this.http
        .get<DashboardRecent>('/api/admin/dashboard/recent')
        .pipe(shareReplay(1));
    }
    return this.dashboardRecentCache$;
  }

  /** Call this to force a fresh fetch next time (e.g., after approve/reject) */
  invalidateDashboardRecent(): void {
    this.dashboardRecentCache$ = null;
  }

  // ─── Books ────────────────────────────────────────────────────────────────

  getBooks(params?: {
    search_query?: string;
    category_filter?: string;
    status_filter?: string;
    language_filter?: string;
    timeframe_filter?: string;
    sort_by?: string;
    page?: number;
    page_size?: number;
  }): Observable<PaginatedBookAdminResponse> {
    let queryParts: string[] = [];
    if (params?.search_query) queryParts.push(`search_query=${encodeURIComponent(params.search_query)}`);
    if (params?.category_filter) queryParts.push(`category_filter=${encodeURIComponent(params.category_filter)}`);
    if (params?.status_filter) queryParts.push(`status_filter=${encodeURIComponent(params.status_filter)}`);
    if (params?.language_filter) queryParts.push(`language_filter=${encodeURIComponent(params.language_filter)}`);
    if (params?.timeframe_filter) queryParts.push(`timeframe_filter=${encodeURIComponent(params.timeframe_filter)}`);
    if (params?.sort_by) queryParts.push(`sort_by=${encodeURIComponent(params.sort_by)}`);
    if (params?.page) queryParts.push(`page=${params.page}`);
    if (params?.page_size) queryParts.push(`page_size=${params.page_size}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return this.http.get<PaginatedBookAdminResponse>(`/api/admin/books${queryString}`);
  }

  approveBook(bookId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`/api/admin/books/${bookId}/approve`, {});
  }

  rejectBook(bookId: number, rejectionReason?: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`/api/admin/books/${bookId}/reject`, { status: 'REJECTED', rejection_reason: rejectionReason });
  }

  updateBookStatus(bookId: number, status: string, rejectionReason?: string): Observable<{ message: string }> {
    this.invalidateDashboardRecent();
    return this.http.put<{ message: string }>(`/api/admin/books/${bookId}/status`, { status, rejection_reason: rejectionReason });
  }

  // ─── Admin Governance Staff ────────────────────────────────────────────────

  getAdminStaffStats(): Observable<AdminStaffStats> {
    return this.http.get<AdminStaffStats>('/api/admin/staff/stats');
  }

  getAdminStaff(): Observable<AdminUserItem[]> {
    return this.http.get<AdminUserItem[]>('/api/admin/staff');
  }

  createAdminStaff(data: { name: string; username: string; email: string; password: string; role: string; department: string }): Observable<AdminUserItem> {
    return this.http.post<AdminUserItem>('/api/admin/staff/create', data);
  }

  toggleAdminStaffStatus(userId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`/api/admin/staff/${userId}/toggle-status`, {});
  }

  deleteAdminStaff(userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/admin/staff/${userId}`);
  }

  // ─── Platform Statistics ──────────────────────────────────────────────────

  getPlatformStatistics(): Observable<PlatformStatistics> {
    return this.http.get<PlatformStatistics>('/api/admin/statistics');
  }

  // ─── Authors ──────────────────────────────────────────────────────────────

  getAuthorStats(): Observable<AuthorStats> {
    return this.http.get<AuthorStats>('/api/admin/authors/stats');
  }

  getAuthorApplications(statusFilter?: string): Observable<AuthorApplicationItem[]> {
    const url = statusFilter
      ? `/api/admin/author-applications?status_filter=${encodeURIComponent(statusFilter)}`
      : '/api/admin/author-applications';
    return this.http.get<AuthorApplicationItem[]>(url);
  }

  approveAuthor(userId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`/api/admin/authors/${userId}/approve`, {});
  }

  rejectAuthor(userId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`/api/admin/authors/${userId}/reject`, {});
  }

  // ─── Readers ──────────────────────────────────────────────────────────────

  getReaders(): Observable<ReaderItem[]> {
    return this.http.get<ReaderItem[]>('/api/admin/readers');
  }

  // ─── System Logs ──────────────────────────────────────────────────────────

  getSystemLogs(): Observable<SystemLogItem[]> {
    return this.http.get<SystemLogItem[]>('/api/admin/system-logs');
  }

  // ─── Categories ───────────────────────────────────────────────────────────

  getCategories(): Observable<CategoryAdminItem[]> {
    return this.http.get<CategoryAdminItem[]>('/api/admin/categories');
  }

  createCategory(data: { name: string; description?: string }): Observable<CategoryAdminItem> {
    return this.http.post<CategoryAdminItem>('/api/admin/categories', data);
  }

  toggleCategoryStatus(categoryId: number): Observable<{ message: string; is_active: boolean }> {
    return this.http.put<{ message: string; is_active: boolean }>(`/api/admin/categories/${categoryId}/toggle-status`, {});
  }

  deleteCategory(categoryId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/admin/categories/${categoryId}`);
  }
}

