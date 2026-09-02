import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { CategoriesComponent } from './categories';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let adminApi: AdminApiService;
  let toastService: ToastService;

  const sampleCategories = [
    {
      id: 1,
      name: 'Philosophy',
      description: 'Philosophical texts and essays',
      is_active: true,
      total_books: 4,
      created_at: '2026-08-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Science',
      description: 'Scientific publications',
      is_active: false,
      total_books: 2,
      created_at: '2026-08-02T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        AdminApiService,
        ToastService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    adminApi = TestBed.inject(AdminApiService);
    toastService = TestBed.inject(ToastService);
  });

  it('should create and load categories on init', () => {
    vi.spyOn(adminApi, 'getCategories').mockReturnValue(of(sampleCategories));
    component.ngOnInit();

    expect(adminApi.getCategories).toHaveBeenCalled();
    expect(component.categoriesSignal().length).toBe(2);
    expect(component.categoriesSignal()[0].name).toBe('Philosophy');
  });

  it('should filter categories correctly', () => {
    vi.spyOn(adminApi, 'getCategories').mockReturnValue(of(sampleCategories));
    component.ngOnInit();

    component.searchQuery.set('Science');
    expect(component.filteredCategories.length).toBe(1);
    expect(component.filteredCategories[0].name).toBe('Science');

    component.searchQuery.set('');
    component.filterStatus.set('active');
    expect(component.filteredCategories.length).toBe(1);
    expect(component.filteredCategories[0].name).toBe('Philosophy');
  });

  it('should create new category successfully', () => {
    vi.spyOn(adminApi, 'getCategories').mockReturnValue(of(sampleCategories));
    vi.spyOn(adminApi, 'createCategory').mockReturnValue(
      of({
        id: 3,
        name: 'Technology',
        description: 'Tech books',
        is_active: true,
        total_books: 0,
        created_at: '2026-08-05T00:00:00Z',
      })
    );
    vi.spyOn(toastService, 'success');

    component.ngOnInit();
    component.newCatName = 'Technology';
    component.newCatDesc = 'Tech books';
    component.saveCategory();

    expect(adminApi.createCategory).toHaveBeenCalledWith({
      name: 'Technology',
      description: 'Tech books',
    });
    expect(toastService.success).toHaveBeenCalled();
  });

  it('should show error toast on duplicate category name', () => {
    vi.spyOn(adminApi, 'getCategories').mockReturnValue(of(sampleCategories));
    vi.spyOn(adminApi, 'createCategory').mockReturnValue(
      throwError(() => ({ error: { detail: "Category 'Philosophy' already exists." } }))
    );
    vi.spyOn(toastService, 'error');

    component.ngOnInit();
    component.newCatName = 'Philosophy';
    component.saveCategory();

    expect(toastService.error).toHaveBeenCalledWith(
      "Category 'Philosophy' already exists.",
      'Creation Failed'
    );
  });

  it('should show error toast on category deletion conflict', () => {
    vi.spyOn(adminApi, 'getCategories').mockReturnValue(of(sampleCategories));
    vi.spyOn(adminApi, 'deleteCategory').mockReturnValue(
      throwError(() => ({
        error: { detail: "Cannot delete category 'Philosophy' because 4 book(s) reference it." },
      }))
    );
    vi.spyOn(toastService, 'error');

    component.ngOnInit();
    const cat = component.categoriesSignal()[0];
    component.promptDelete(cat);
    component.confirmDelete();

    expect(toastService.error).toHaveBeenCalledWith(
      "Cannot delete category 'Philosophy' because 4 book(s) reference it.",
      'Delete Error'
    );
  });
});
