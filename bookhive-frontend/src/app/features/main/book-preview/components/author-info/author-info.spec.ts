import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorInfoComponent } from './author-info';

describe('AuthorInfoComponent', () => {
  let component: AuthorInfoComponent;
  let fixture: ComponentFixture<AuthorInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorInfoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorInfoComponent);
    component = fixture.componentInstance;

    component.name = 'Jonathan Sterling';
    component.role = 'Professor of Logic, Cambridge';
    component.image = 'images/authors/jonathan-sterling.jpg';
    component.biography =
      'Jonathan Sterling is a renowned philosopher specializing in logic and human reasoning.';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive the author information', () => {
    expect(component.name).toBe('Jonathan Sterling');
    expect(component.role).toBe('Professor of Logic, Cambridge');
  });

  it('should activate the placeholder when image loading fails', () => {
    component.onImageError();

    expect(component.imageLoadFailed).toBe(true);
  });
});
