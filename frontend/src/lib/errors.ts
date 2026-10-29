import axios, { AxiosError } from 'axios';

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  errors?: Array<{ field?: string; defaultMessage?: string }>;
}

export function parseApiError(error: unknown, fallbackMessage = 'An unexpected error occurred'): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse | string>;

    if (!axiosErr.response) {
      if (axiosErr.code === 'ERR_NETWORK') {
        return 'Unable to connect to the server. Please verify the backend service is running.';
      }
      return axiosErr.message || fallbackMessage;
    }

    const { status, data } = axiosErr.response;

    // Handle string response body
    if (typeof data === 'string' && data.trim().length > 0) {
      return data;
    }

    // Handle structured Spring error body
    if (typeof data === 'object' && data !== null) {
      // Spring validation errors list
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const first = data.errors[0];
        return first.defaultMessage || data.message || 'Validation error';
      }

      if (data.message && typeof data.message === 'string') {
        return data.message;
      }

      if (data.error && typeof data.error === 'string') {
        return data.error;
      }
    }

    switch (status) {
      case 400:
        return 'Invalid request details provided.';
      case 401:
        return 'Session expired or invalid credentials. Please log in again.';
      case 403:
        return 'Access denied. You do not have permissions for this action.';
      case 404:
        return 'Requested resource not found.';
      case 409:
        return 'Conflict detected. Please review and try again.';
      case 413:
        return 'File size too large. The uploaded image exceeds the maximum allowed upload limit.';
      case 500:
        if (typeof data === 'object' && data?.message?.includes('MaxUploadSizeExceeded')) {
          return 'Uploaded image is too large. Please select an image under 10MB.';
        }
        return 'Internal server error. Please try again later.';
      default:
        return `Request failed with status ${status}.`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
