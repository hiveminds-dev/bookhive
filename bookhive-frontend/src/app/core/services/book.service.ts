import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface PublicReview {
  id: number;
  book_id?: number;
  user_id?: number;
  reader_name?: string;
  user_name?: string;
  avatar_letter?: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateReviewPayload {
  rating: number;
  comment?: string | null;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string | null;
}

export interface ReviewResult {
  message: string;
  data: PublicReview;
}

export interface ReviewListResult {
  message: string;
  data: PublicReview[];
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

type MaybeWrapped<T> = T | { data: T; message?: string };
type CatalogueResponseLike = Partial<PaginatedCatalogue> & {
  data?: CatalogueBook[] | Partial<PaginatedCatalogue>;
  books?: CatalogueBook[];
  total?: number;
};

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
      .get<MaybeWrapped<BookDetails>>(`/api/books/${bookId}`)
      .pipe(map((response) => this.unwrapResponse(response)));
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

    return this.http
      .get<MaybeWrapped<CatalogueResponseLike>>('/api/catalogue/books', {
        params: httpParams,
      })
      .pipe(map((response) => this.normalizeCatalogue(this.unwrapResponse(response))));
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
      .get<MaybeWrapped<AuthorBookItem[]>>('/api/books/mine', { params })
      .pipe(map((res) => this.unwrapResponse(res) ?? []));
  }

  getAuthorBookById(bookId: number): Observable<AuthorBookItem> {
    return this.http
      .get<AuthorBookResult>(`/api/books/mine/${bookId}`)
      .pipe(map((res) => res.data));
  }

  deleteAuthorBook(bookId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/books/${bookId}`);
  }

  createReview(bookId: number, payload: CreateReviewPayload): Observable<PublicReview> {
    return this.http
      .post<ReviewResult>(`/api/books/${bookId}/reviews`, payload)
      .pipe(map((res) => res.data));
  }

  updateReview(reviewId: number, payload: UpdateReviewPayload): Observable<PublicReview> {
    return this.http
      .patch<ReviewResult>(`/api/reviews/${reviewId}`, payload)
      .pipe(map((res) => res.data));
  }

  deleteReview(reviewId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/reviews/${reviewId}`);
  }

  getMyBookReview(bookId: number): Observable<PublicReview | null> {
    return this.http
      .get<ReviewResult>(`/api/books/${bookId}/reviews/mine`)
      .pipe(map((res) => res?.data ?? null));
  }

  getBookReviews(bookId: number): Observable<PublicReview[]> {
    return this.http
      .get<ReviewListResult>(`/api/books/${bookId}/reviews`)
      .pipe(map((res) => res.data));
  }

  private unwrapResponse<T>(response: MaybeWrapped<T>): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data;
    }

    return response as T;
  }

  private normalizeCatalogue(catalogue: CatalogueResponseLike): PaginatedCatalogue {
    const payload =
      catalogue?.data && !Array.isArray(catalogue.data)
        ? catalogue.data
        : catalogue;
    const itemsSource = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(catalogue?.data)
        ? catalogue.data
        : Array.isArray(catalogue?.books)
          ? catalogue.books
          : [];
    const items = itemsSource;
    const totalItems = Number(payload?.total_items ?? catalogue?.total ?? items.length);
    const pageSize = Number(catalogue?.page_size ?? (items.length || 1));

    return {
      total_items: totalItems,
      total_pages: Number(payload?.total_pages ?? (Math.ceil(totalItems / pageSize) || 1)),
      current_page: Number(payload?.current_page ?? 1),
      page_size: pageSize,
      items,
    };
  }
}
