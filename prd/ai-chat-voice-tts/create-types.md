# Task: Create Types

## Objective
Define TypeScript types and interfaces for TTS client, audio player, and CLI configuration.

## Implementation

**File: `src/types.ts`**

```typescript
/**
 * Configuration for TTS client
 */
export interface TTSConfig {
  apiKey: string;
  voiceId?: string;
  stability?: number;      // 0-1, default 0.5
  similarityBoost?: number; // 0-1, default 0.75
  modelId?: string;        // elevenlabs model
}

/**
 * CLI arguments
 */
export interface CLIArgs {
  text?: string;           // Direct text input
  file?: string;           // File path to read
  voice?: string;          // Voice ID override
  stdin?: boolean;         // Read from stdin
  help?: boolean;          // Show help
}

/**
 * TTS Client errors
 */
export class TTSError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'TTSError';
  }
}

/**
 * Audio Player errors
 */
export class AudioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AudioError';
  }
}

/**
 * Input handler errors
 */
export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InputError';
  }
}
```

## Acceptance Criteria
- [ ] TTSConfig interface with all required fields
- [ ] CLIArgs for argument parsing
- [ ] Custom error classes for TTS, Audio, and Input
- [ ] All types exported
- [ ] JSDoc comments for clarity
- [ ] No `any` types used

## Usage Example

```typescript
import { TTSConfig, TTSError, CLIArgs } from './types';

const config: TTSConfig = {
  apiKey: process.env.ELEVENLABS_API_KEY!,
  voiceId: '21m00Tcm4TlvDq8ikWAM',
  stability: 0.5,
  similarityBoost: 0.75,
  modelId: 'eleven_turbo_v2',
};

const args: CLIArgs = {
  text: 'Hello, world!',
  voice: '21m00Tcm4TlvDq8ikWAM',
};
```

## Notes
- Keep types minimal and focused on hook functionality
- Use strict type checking (no optional chaining abuse)
- Error classes help with specific error handling
