# Task: Add Error Handling

## Objective
Implement comprehensive error handling and retry logic for network failures, API errors, and graceful degradation.

## Implementation

**File: `src/utils/retry.ts`**

```typescript
export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
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
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
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
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
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
    message.includes('enotfound')
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
```

**File: `src/utils/error-formatter.ts`**

```typescript
import {
  AIClientError,
  TTSClientError,
  AudioPlayerError,
} from '../types';

/**
 * Format errors for user-friendly display
 */
export function formatError(error: unknown): string {
  if (error instanceof AIClientError) {
    if (error.code === '401') {
      return 'Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY.';
    }
    if (error.code === '429') {
      return 'Rate limit reached. Please wait a moment and try again.';
    }
    return `AI Error: ${error.message}`;
  }

  if (error instanceof TTSClientError) {
    if (error.code === '401') {
      return 'Invalid ElevenLabs API key. Please check your ELEVENLABS_API_KEY.';
    }
    if (error.code === '429') {
      return 'TTS rate limit reached. Please wait and try again.';
    }
    return `TTS Error: ${error.message}`;
  }

  if (error instanceof AudioPlayerError) {
    return 'Audio playback failed. Check your audio settings.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}
```

**File: `src/services/chat-service.ts` (updated)**

```typescript
import { retry, isRetryableError } from '../utils/retry';
import { formatError } from '../utils/error-formatter';
// ... other imports

export class ChatService {
  // ... existing code

  async processMessage(userMessage: string): Promise<void> {
    try {
      chatStore.clearError();

      const userMsg: Message = {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };
      chatStore.addMessage(userMsg);

      chatStore.setThinking(true);

      // Retry AI request with backoff
      const responseChunks: string[] = [];
      await retry(
        async () => {
          for await (const chunk of this.aiClient.streamResponse(
            chatStore.getMessages()
          )) {
            responseChunks.push(chunk);
            chatStore.updateLastMessage(responseChunks.join(''));
          }
        },
        {
          maxAttempts: 3,
          shouldRetry: isRetryableError,
        }
      );

      const fullResponse = responseChunks.join('');
      chatStore.setThinking(false);

      // Retry TTS request with backoff
      chatStore.setPlaying(true);
      const audioBuffer = await retry(
        () => this.ttsClient.getAudioBuffer(fullResponse),
        {
          maxAttempts: 3,
          shouldRetry: isRetryableError,
        }
      );

      // Audio playback - don't retry, fail gracefully
      try {
        await this.audioPlayer.play(audioBuffer);
      } catch (audioError) {
        // Log but don't throw - degraded mode
        console.error('Audio playback failed:', audioError);
        chatStore.setError('Audio playback failed (response shown above)');
      }

      chatStore.setPlaying(false);
    } catch (error) {
      chatStore.setThinking(false);
      chatStore.setPlaying(false);

      const errorMessage = formatError(error);
      chatStore.setError(errorMessage);

      // Don't re-throw - keep app running
    }
  }
}
```

## Acceptance Criteria
- [ ] retry() utility with exponential backoff
- [ ] isRetryableError() identifies network/5xx/rate limit errors
- [ ] formatError() provides user-friendly messages
- [ ] AI requests retry up to 3 times
- [ ] TTS requests retry up to 3 times
- [ ] Audio failures handled gracefully (degraded mode)
- [ ] Errors displayed in UI, don't crash app

## Error Categories

**Retryable:**
- Network failures (ECONNREFUSED, timeout)
- 5xx server errors
- 429 rate limits (with backoff)

**Non-retryable:**
- 401 invalid API keys
- 400 bad requests
- Audio playback issues (graceful degradation)

## Testing Notes
- Test retry logic with mock failures
- Verify exponential backoff timing
- Test graceful degradation for audio failures
- Test error message formatting

## Research Reference
- See research.md "Key Technical Considerations" - Error Handling
