export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 2,
    delayMs = 1000,
    shouldRetry = isRetryableError,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry if shouldRetry returns false
      if (!shouldRetry(lastError)) {
        throw lastError;
      }

      // Don't wait after last attempt
      if (attempt < maxAttempts) {
        const delay = delayMs * attempt; // Linear backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Determine if error is retryable (network errors, 5xx, rate limits)
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Network errors
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('fetch failed')
  ) {
    return true;
  }

  // API errors with status codes
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return true;
  }

  // Rate limit (429)
  if (message.includes('429') || message.includes('rate limit')) {
    return true;
  }

  return false;
}
