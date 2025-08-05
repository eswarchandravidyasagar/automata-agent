import { ApiResponse } from '@/types';

/**
 * Utility function to create standardized API responses
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    message,
  };
}

/**
 * Utility function to handle API errors
 */
export function handleApiError(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
    };
  }

  return {
    message: 'An unexpected error occurred',
    status: 500,
  };
}

/**
 * Utility function for validating email addresses
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Utility function for validating required fields
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): string[] {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && (data[field] as string).trim() === '')) {
      missingFields.push(field);
    }
  }

  return missingFields;
}
