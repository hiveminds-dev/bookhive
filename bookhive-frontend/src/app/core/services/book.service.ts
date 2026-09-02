import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface PublicReview {
  id: number;
  user_name: string;
  avatar_letter: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface BookAuthorDetails {
  id: number;
  display_name: string;
  username: string;
  biography: string | null;
  profile_image_url: string | null;
}

export interface BookCategoryDetails {
  id: number;
  name: string;
}

export interface BookDetails {
  id: number;
  title: string;
  description: string | null;
  language: string | null;
  reading_level: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  status: string;
  published_at: string | null;
  page_count?: number | null;
  estimated_reading_time?: string | null;
  can_read: boolean;
  can_download: boolean;
  average_rating: number;
  review_count: number;
  reviews: PublicReview[];
  author: BookAuthorDetails;
  category: BookCategoryDetails;
}

export interface BookDetailsResult {
  message: string;
  data: BookDetails;
}

export interface CatalogueBook {
  id: number;
  title: string;
  description: string | null;
  language: string | null;
  reading_level: string | null;
  page_count?: number | null;
  rating?: number | null;
  review_count?: number | null;
  published_at: string | null;
  cover_url: string | null;
  author_name: string;
  category_name: string;
}

export interface PaginatedCatalogue {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  items: CatalogueBook[];
}

export interface CategoryItem {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryListResponse {
  items: CategoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface CatalogueFilterParams {
  page?: number;
  size?: number;
  search?: string;
  category_id?: number;
  language?: string;
}

export interface AuthorBookItem {
  id: number;
  author_id: number;
  category_id: number;
  title: string;
  description: string | null;
  language: string | null;
  reading_level: string | null;
  pdf_path: string | null;
  cover_image_path: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  published_at: string | null;
  page_count?: number | null;
  category_name?: string | null;
  rejection_reason?: string | null;
  cover_url?: string | null;
  pdf_url?: string | null;
}

export interface AuthorBookResult {
  message: string;
  data: AuthorBookItem;
}

export interface AuthorBookListResult {
  message: string;
  data: AuthorBookItem[];
}

export interface AuthorBookStatusResult {
  message: string;
  data: {
    id: number;
    title: string;
    status: string;
    submitted_at?: string | null;
    published_at?: string | null;
    rejection_reason?: string | null;
  };
}

export interface BookCreatePayload {
  category_id: number;
  title: string;
  description?: string | null;
  language?: string | null;
  reading_level?: string | null;
}

export interface BookUpdatePayload {
  category_id?: number | null;
  title?: string | null;
  description?: string | null;
  language?: string | null;
  reading_level?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly http = inject(HttpClient);

  getBookDetails(bookId: number): Observable<BookDetails> {
    return this.http
      .get<BookDetailsResult>(`/api/books/${bookId}`)
      .pipe(map((response) => response.data));
  }

  getCatalogue(params?: CatalogueFilterParams): Observable<PaginatedCatalogue> {
    let httpParams = new HttpParams();

    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.size) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params?.search && params.search.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params?.category_id) {
      httpParams = httpParams.set('category_id', params.category_id.toString());
    }
    if (params?.language && params.language.trim()) {
      httpParams = httpParams.set('language', params.language.trim());
    }

    return this.http.get<PaginatedCatalogue>('/api/catalogue/books', {
      params: httpParams,
    });
  }

  getCategories(page = 1, pageSize = 50): Observable<CategoryListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    return this.http.get<CategoryListResponse>('/api/categories/', { params });
  }

  createDraftBook(payload: BookCreatePayload): Observable<AuthorBookItem> {
    return this.http
      .post<AuthorBookResult>('/api/books/', payload)
      .pipe(map((res) => res.data));
  }

  updateBook(bookId: number, payload: BookUpdatePayload): Observable<AuthorBookItem> {
    return this.http
      .patch<AuthorBookResult>(`/api/books/${bookId}`, payload)
      .pipe(map((res) => res.data));
  }

  uploadBookPdf(bookId: number, file: File): Observable<AuthorBookItem> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<AuthorBookResult>(`/api/books/${bookId}/upload/pdf`, formData)
      .pipe(map((res) => res.data));
  }

  uploadBookCover(bookId: number, file: File): Observable<AuthorBookItem> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<AuthorBookResult>(`/api/books/${bookId}/upload/cover`, formData)
      .pipe(map((res) => res.data));
  }

  submitBook(bookId: number): Observable<AuthorBookStatusResult['data']> {
    return this.http
      .patch<AuthorBookStatusResult>(`/api/books/${bookId}/submit`, {})
      .pipe(map((res) => res.data));
  }

  getAuthorBooks(status?: string, offset = 0, limit = 50): Observable<AuthorBookItem[]> {
    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    if (status && status !== 'All') {
      params = params.set('status', status.toUpperCase());
    }
    return this.http
      .get<AuthorBookListResult>('/api/books/mine', { params })
      .pipe(map((res) => res.data));
  }

  getAuthorBookById(bookId: number): Observable<AuthorBookItem> {
    return this.http
      .get<AuthorBookResult>(`/api/books/mine/${bookId}`)
      .pipe(map((res) => res.data));
  }

  deleteAuthorBook(bookId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/books/${bookId}`);
  }
}
