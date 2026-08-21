import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Storage {
  set(key: string, value: string, persistent: boolean): void {
    this.remove(key);
    const target = persistent ? localStorage : sessionStorage;
    target.setItem(key, value);
  }

  get(key: string): string | null {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}
