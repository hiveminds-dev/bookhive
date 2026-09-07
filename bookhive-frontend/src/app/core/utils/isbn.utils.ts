import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function normalizeIsbn(value: string | number): string {
  return String(value).replace(/[\s-]/g, '').toUpperCase();
}

export function isValidIsbn(value: string | number | null | undefined): boolean {
  if (!value) {
    return true;
  }

  const normalized = normalizeIsbn(value);

  if (/^\d{9}[\dX]$/.test(normalized)) {
    return isValidIsbn10(normalized);
  }

  if (/^\d{13}$/.test(normalized)) {
    return isValidIsbn13(normalized);
  }

  return false;
}

export function isbnValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    isValidIsbn(control.value) ? null : { isbn: true };
}

function isValidIsbn10(isbn: string): boolean {
  const sum = isbn
    .split('')
    .reduce((total, char, index) => {
      const value = char === 'X' ? 10 : Number(char);
      return total + value * (10 - index);
    }, 0);

  return sum % 11 === 0;
}

function isValidIsbn13(isbn: string): boolean {
  const sum = isbn
    .split('')
    .reduce((total, char, index) => {
      const multiplier = index % 2 === 0 ? 1 : 3;
      return total + Number(char) * multiplier;
    }, 0);

  return sum % 10 === 0;
}
