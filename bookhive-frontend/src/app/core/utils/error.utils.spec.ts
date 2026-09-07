import { HttpErrorResponse } from '@angular/common/http';
import { extractErrorMessage } from './error.utils';

describe('extractErrorMessage', () => {
  const fallback = 'Default fallback message';

  it('returns fallback if error is null or undefined', () => {
    expect(extractErrorMessage(null, fallback)).toBe(fallback);
    expect(extractErrorMessage(undefined, fallback)).toBe(fallback);
  });

  it('returns string error directly', () => {
    expect(extractErrorMessage('Something went wrong', fallback)).toBe('Something went wrong');
  });

  it('handles network offline / status 0', () => {
    const error = new HttpErrorResponse({ status: 0 });
    expect(extractErrorMessage(error, fallback)).toContain('Unable to connect to the BookHive server');
  });

  it('extracts string detail from HttpErrorResponse', () => {
    const error = new HttpErrorResponse({
      error: { detail: 'Incorrect current password' },
      status: 400
    });
    expect(extractErrorMessage(error, fallback)).toBe('Incorrect current password');
  });

  it('extracts FastAPI validation error array from detail without showing [object Object]', () => {
    const error = new HttpErrorResponse({
      error: {
        detail: [
          {
            loc: ['body', 'new_password'],
            msg: 'String should have at least 8 characters',
            type: 'string_too_short'
          },
          {
            loc: ['body', 'confirm_password'],
            msg: 'Passwords do not match',
            type: 'value_error'
          }
        ]
      },
      status: 422
    });
    const result = extractErrorMessage(error, fallback);
    expect(result).toBe('String should have at least 8 characters. Passwords do not match');
    expect(result).not.toContain('[object Object]');
  });

  it('extracts detail when detail is an object with msg or message', () => {
    const error = {
      error: {
        detail: { msg: 'Account is locked' }
      }
    };
    expect(extractErrorMessage(error, fallback)).toBe('Account is locked');
  });

  it('extracts message property when detail is missing', () => {
    const error = {
      error: {
        message: 'Invalid authorization token'
      }
    };
    expect(extractErrorMessage(error, fallback)).toBe('Invalid authorization token');
  });

  it('ignores generic Http failure response message and uses fallback', () => {
    const error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error'
    });
    expect(extractErrorMessage(error, fallback)).toBe(fallback);
  });

  it('does not return [object Object] when string error literally contains it', () => {
    expect(extractErrorMessage('[object Object]', fallback)).toBe(fallback);
  });
});
