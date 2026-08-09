import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authorGuard } from './author-guard';

describe('authorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
