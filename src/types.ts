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
