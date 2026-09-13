import {
  ApiError,
} from '../api/apiClient';

export function getErrorMessage(
  error: unknown,
  fallback =
    'Something went wrong. Please try again.',
): string {
  if (error instanceof ApiError) {
    if (
      error.message
      && error.message.trim()
    ) {
      return error.message;
    }

    return fallback;
  }

  if (error instanceof Error) {
    if (
      error.message
      && error.message.trim()
    ) {
      return error.message;
    }

    return fallback;
  }

  if (
    typeof error === 'string'
    && error.trim()
  ) {
    return error;
  }

  return fallback;
}