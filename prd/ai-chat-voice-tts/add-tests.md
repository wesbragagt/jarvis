# Task: Add Tests

## Objective
Write unit tests for clients, state management, and integration flows using bun:test.

## Implementation

**File: `src/clients/ai.test.ts`**

```typescript
import { test, expect, mock } from 'bun:test';
import { AIClient } from './ai';
import { AIClientError } from '../types';

test('AIClient - constructor validates API key', () => {
  expect(() => {
    new AIClient({ apiKey: '' });
  }).toThrow(AIClientError);
});

test('AIClient - streamResponse yields chunks', async () => {
  const client = new AIClient({ apiKey: 'test-key' });

  // Mock Anthropic client
  const mockStream = {
    async *[Symbol.asyncIterator]() {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } };
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: ' world' } };
    },
  };

  client['client'].messages.stream = mock(() => Promise.resolve(mockStream));

  const chunks: string[] = [];
  for await (const chunk of client.streamResponse([])) {
    chunks.push(chunk);
  }

  expect(chunks).toEqual(['Hello', ' world']);
});

test('AIClient - getResponse returns full text', async () => {
  const client = new AIClient({ apiKey: 'test-key' });

  const mockStream = {
    async *[Symbol.asyncIterator]() {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } };
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: ' world' } };
    },
  };

  client['client'].messages.stream = mock(() => Promise.resolve(mockStream));

  const response = await client.getResponse([]);
  expect(response).toBe('Hello world');
});
```

**File: `src/clients/tts.test.ts`**

```typescript
import { test, expect, mock } from 'bun:test';
import { TTSClient } from './tts';
import { TTSClientError } from '../types';

test('TTSClient - constructor validates API key', () => {
  expect(() => {
    new TTSClient({ apiKey: '' });
  }).toThrow(TTSClientError);
});

test('TTSClient - textToSpeech returns audio stream', async () => {
  const client = new TTSClient({ apiKey: 'test-key' });

  // Mock fetch
  const mockStream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array([1, 2, 3]));
      controller.close();
    },
  });

  global.fetch = mock(() =>
    Promise.resolve({
      ok: true,
      body: mockStream,
    } as Response)
  );

  const stream = await client.textToSpeech({ text: 'Hello' });
  expect(stream).toBeDefined();
});

test('TTSClient - handles API errors', async () => {
  const client = new TTSClient({ apiKey: 'test-key' });

  global.fetch = mock(() =>
    Promise.resolve({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: () => Promise.resolve('Invalid API key'),
    } as Response)
  );

  await expect(client.textToSpeech({ text: 'Hello' })).rejects.toThrow(
    TTSClientError
  );
});
```

**File: `src/state/store.test.ts`**

```typescript
import { test, expect } from 'bun:test';
import { ChatStore } from './store';

test('ChatStore - initial state', () => {
  const store = new ChatStore();
  const state = store.getState();

  expect(state.messages).toEqual([]);
  expect(state.isThinking).toBe(false);
  expect(state.isPlaying).toBe(false);
  expect(state.error).toBe(null);
});

test('ChatStore - addMessage updates messages', () => {
  const store = new ChatStore();

  store.addMessage({
    role: 'user',
    content: 'Hello',
    timestamp: new Date(),
  });

  const state = store.getState();
  expect(state.messages).toHaveLength(1);
  expect(state.messages[0].content).toBe('Hello');
});

test('ChatStore - updateLastMessage updates assistant message', () => {
  const store = new ChatStore();

  store.addMessage({
    role: 'user',
    content: 'Hello',
    timestamp: new Date(),
  });

  store.updateLastMessage('Hi there');
  store.updateLastMessage('Hi there!');

  const state = store.getState();
  expect(state.messages).toHaveLength(2);
  expect(state.messages[1].role).toBe('assistant');
  expect(state.messages[1].content).toBe('Hi there!');
});

test('ChatStore - subscribe notifies listeners', () => {
  const store = new ChatStore();
  let notified = false;

  const unsubscribe = store.subscribe(() => {
    notified = true;
  });

  store.setThinking(true);
  expect(notified).toBe(true);

  unsubscribe();
});

test('ChatStore - setThinking updates state', () => {
  const store = new ChatStore();
  store.setThinking(true);

  expect(store.getState().isThinking).toBe(true);

  store.setThinking(false);
  expect(store.getState().isThinking).toBe(false);
});
```

**File: `src/utils/retry.test.ts`**

```typescript
import { test, expect, mock } from 'bun:test';
import { retry, isRetryableError } from './retry';

test('retry - succeeds on first attempt', async () => {
  const fn = mock(() => Promise.resolve('success'));
  const result = await retry(fn);

  expect(result).toBe('success');
  expect(fn).toHaveBeenCalledTimes(1);
});

test('retry - retries on failure', async () => {
  let attempts = 0;
  const fn = mock(() => {
    attempts++;
    if (attempts < 3) {
      return Promise.reject(new Error('Network error'));
    }
    return Promise.resolve('success');
  });

  const result = await retry(fn, { maxAttempts: 3, delayMs: 10 });
  expect(result).toBe('success');
  expect(fn).toHaveBeenCalledTimes(3);
});

test('retry - throws after max attempts', async () => {
  const fn = mock(() => Promise.reject(new Error('Permanent error')));

  await expect(retry(fn, { maxAttempts: 3, delayMs: 10 })).rejects.toThrow(
    'Permanent error'
  );
  expect(fn).toHaveBeenCalledTimes(3);
});

test('isRetryableError - identifies network errors', () => {
  expect(isRetryableError(new Error('network timeout'))).toBe(true);
  expect(isRetryableError(new Error('ECONNREFUSED'))).toBe(true);
  expect(isRetryableError(new Error('500 Server Error'))).toBe(true);
  expect(isRetryableError(new Error('429 Rate Limit'))).toBe(true);
  expect(isRetryableError(new Error('Invalid input'))).toBe(false);
});
```

**Run tests:**

```bash
bun test
```

## Acceptance Criteria
- [ ] Unit tests for AIClient (streaming, errors)
- [ ] Unit tests for TTSClient (API calls, errors)
- [ ] Unit tests for ChatStore (state management)
- [ ] Unit tests for retry logic
- [ ] All tests pass with `bun test`
- [ ] Mocks used for external dependencies
- [ ] Error scenarios covered

## Testing Strategy

**Unit Tests:**
- Client initialization and validation
- State management operations
- Utility functions (retry, error formatting)

**Integration Tests (optional):**
- Full pipeline with mocked APIs
- State transitions during message flow

**Manual Testing:**
- Real API calls with valid keys
- Audio playback verification
- Error handling in production

## Notes
- Use Bun's built-in test runner (per CLAUDE.md)
- Mock external APIs to avoid rate limits
- Focus on critical paths and error handling

## Research Reference
- See CLAUDE.md "Testing" section for Bun test syntax
