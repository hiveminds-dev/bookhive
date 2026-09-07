import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { isbnValidator, isValidIsbn, normalizeIsbn } from './isbn.utils';

describe('ISBN utilities', () => {
  it('normalizes spaces and hyphens', () => {
    expect(normalizeIsbn('978-0-306-40615-7')).toBe('9780306406157');
    expect(normalizeIsbn('0 306 40615 2')).toBe('0306406152');
  });

  it('accepts valid ISBN-10 and ISBN-13 values', () => {
    expect(isValidIsbn('0-306-40615-2')).toBe(true);
    expect(isValidIsbn('0-8044-2957-X')).toBe(true);
    expect(isValidIsbn('978-0-306-40615-7')).toBe(true);
  });

  it('rejects values with invalid checksum or invalid characters', () => {
    expect(isValidIsbn('0-306-40615-3')).toBe(false);
    expect(isValidIsbn('978-0-306-40615-8')).toBe(false);
    expect(isValidIsbn('ISBN-978-0-306-40615-7')).toBe(false);
  });

  it('treats empty values as valid because ISBN is optional', () => {
    expect(isValidIsbn('')).toBe(true);
    expect(isbnValidator()(new FormControl(''))).toBeNull();
  });

  it('returns an isbn validation error for invalid form values', () => {
    expect(isbnValidator()(new FormControl('123'))).toEqual({ isbn: true });
    expect(isbnValidator()(new FormControl('978-0-306-40615-7'))).toBeNull();
  });
});
