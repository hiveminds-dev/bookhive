import { Component, OnDestroy, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { Loading } from './shared/components/loading/loading';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loading],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnDestroy {
  protected readonly title = signal('bookhive-frontend');
  protected readonly isNavigating = signal(false);
  protected readonly showInitialLoader = signal(!this.isSkeletonPreviewEnabled());

  private readonly minimumLoaderTime = 1200;
  private readonly loaderPreviewEnabled = this.isLoaderPreviewEnabled();
  private readonly initialLoaderTime = this.loaderPreviewEnabled ? 5000 : 700;
  private readonly routerEventsSubscription: Subscription;
  private readonly initialLoaderTimer: ReturnType<typeof setTimeout>;
  private navigationStartedAt = 0;
  private navigationLoaderTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly router: Router) {
    this.routerEventsSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.navigationStartedAt = Date.now();
        this.clearNavigationTimer();
        this.isNavigating.set(true);
        return;
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        const elapsed = Date.now() - this.navigationStartedAt;
        const remaining = Math.max(this.minimumLoaderTime - elapsed, 0);

        this.clearNavigationTimer();
        this.navigationLoaderTimer = setTimeout(() => {
          this.isNavigating.set(false);
          this.navigationLoaderTimer = null;
        }, remaining);

        if (!this.loaderPreviewEnabled) {
          this.showInitialLoader.set(false);
        }
      }
    });

    this.initialLoaderTimer = setTimeout(() => {
      this.showInitialLoader.set(false);
    }, this.initialLoaderTime);
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription.unsubscribe();
    clearTimeout(this.initialLoaderTimer);
    this.clearNavigationTimer();
  }

  private clearNavigationTimer(): void {
    if (this.navigationLoaderTimer) {
      clearTimeout(this.navigationLoaderTimer);
      this.navigationLoaderTimer = null;
    }
  }

  private isLoaderPreviewEnabled(): boolean {
    return new URLSearchParams(window.location.search).get('loaderPreview') === '1';
  }

  private isSkeletonPreviewEnabled(): boolean {
    return new URLSearchParams(window.location.search).get('skeletonPreview') === '1';
  }
}
