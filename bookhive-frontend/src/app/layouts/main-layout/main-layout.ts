import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, Subscription } from 'rxjs';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private routerSub?: Subscription;

  searchTerm = '';
  mobileMenuOpen = false;

  ngOnInit(): void {
    this.syncSearchTerm();

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.syncSearchTerm();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private syncSearchTerm(): void {
    let currentRoute = this.route;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    const searchParam = currentRoute.snapshot.queryParamMap.get('search');
    if (searchParam !== null) {
      this.searchTerm = searchParam;
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  searchBooks(): void {
    const search = this.searchTerm.trim();

    void this.router.navigate(['/explore'], {
      queryParams: { search: search || null },
      queryParamsHandling: 'merge'
    });
  }

  onSearchChange(): void {
    if (this.router.url.startsWith('/explore')) {
      this.searchBooks();
    }
  }

  logout(): void {
    this.closeMobileMenu();
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
