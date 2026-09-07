export interface ApiErrorDetailItem {
  loc?: Array<string | number>;
  msg?: string;
  message?: string;
  type?: string;
}

export interface ApiErrorPayload {
  detail?: string | ApiErrorDetailItem[] | Record<string, any>;
  message?: string;
  errors?: Array<string | ApiErrorDetailItem>;
}

export interface ApiHttpErrorLike {
  status?: number;
  error?: string | ApiErrorPayload | any;
  message?: string;
}

/**
 * Extracts a clean, human-readable error message from HTTP errors, FastAPI validation
 * responses, or generic Error objects.
 * Prevents displaying "[object Object]" when server returns validation arrays or structured objects.
 */
export function extractErrorMessage(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred. Please try again.'
): string {
  if (!error) {
    return fallbackMessage;
  }

  // If passed directly as a string
  if (typeof error === 'string') {
    const trimmed = error.trim();
    if (!trimmed || trimmed === '[object Object]') {
      return fallbackMessage;
    }
    return trimmed;
  }

  const errObj = error as ApiHttpErrorLike;

  // Network or server unreachable (status 0)
  if (errObj.status === 0) {
    return 'Unable to connect to the BookHive server. Please check your internet connection.';
  }

  // Get payload from HttpErrorResponse.error or use the object itself
  const payload = errObj.error !== undefined ? errObj.error : error;

  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (trimmed && trimmed !== '[object Object]') {
      return trimmed;
    }
  }

  if (payload && typeof payload === 'object') {
    // 1. Check detail property (standard FastAPI format)
    const detail = (payload as ApiErrorPayload).detail;
    if (typeof detail === 'string' && detail.trim() && detail.trim() !== '[object Object]') {
      return detail.trim();
    }

    // FastAPI 422 validation error: detail is an array of error objects [{ loc, msg, type }]
    if (Array.isArray(detail) && detail.length > 0) {
      const messages = detail
        .map((item: unknown) => {
          if (typeof item === 'string') return item.trim();
          if (item && typeof item === 'object') {
            const detailItem = item as ApiErrorDetailItem;
            return detailItem.msg || detailItem.message || '';
          }
          return '';
        })
        .filter((msg) => !!msg && msg !== '[object Object]');

      if (messages.length > 0) {
        return messages.join('. ');
      }
    } else if (detail && typeof detail === 'object') {
      const record = detail as Record<string, any>;
      const msg = record['msg'] || record['message'] || record['detail'];
      if (typeof msg === 'string' && msg.trim() && msg.trim() !== '[object Object]') {
        return msg.trim();
      }
    }

    // 2. Check message property
    const message = (payload as ApiErrorPayload).message;
    if (typeof message === 'string' && message.trim() && message.trim() !== '[object Object]') {
      return message.trim();
    }

    // 3. Check errors array (e.g., standard REST validation errors)
    const errors = (payload as ApiErrorPayload).errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const messages = errors
        .map((item: unknown) => {
          if (typeof item === 'string') return item.trim();
          if (item && typeof item === 'object') {
            const detailItem = item as ApiErrorDetailItem;
            return detailItem.msg || detailItem.message || '';
          }
          return '';
        })
        .filter((msg) => !!msg && msg !== '[object Object]');

      if (messages.length > 0) {
        return messages.join('. ');
      }
    }
  }

  // If HttpErrorResponse has a top-level message that isn't the generic Angular HTTP wrapper
  if (
    typeof errObj.message === 'string' &&
    errObj.message.trim() &&
    !errObj.message.startsWith('Http failure response for') &&
    errObj.message !== '[object Object]'
  ) {
    return errObj.message.trim();
  }

  return fallbackMessage;
}
