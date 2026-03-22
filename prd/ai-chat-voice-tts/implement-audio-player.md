# Task: Implement Audio Player

## Objective
Create audio playback handler using the speaker package to play TTS audio through system speakers.

## Implementation

**File: `src/audio/player.ts`**

```typescript
import Speaker from 'speaker';
import { Writable } from 'stream';
import { AudioPlayerConfig, AudioPlayerError, PlaybackStatus } from '../types';

export class AudioPlayer {
  private speaker: Speaker | null = null;
  private currentStatus: PlaybackStatus = { isPlaying: false };

  constructor(private config: AudioPlayerConfig = {}) {}

  /**
   * Play audio from buffer
   */
  async play(audioBuffer: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create speaker instance for MP3 playback
        // ElevenLabs returns MP3, need to decode first
        // For simplicity, we'll use PCM format from ElevenLabs
        this.speaker = new Speaker({
          channels: this.config.channels || 1,
          bitDepth: 16,
          sampleRate: this.config.sampleRate || 24000,
        });

        this.currentStatus = { isPlaying: true };

        this.speaker.on('error', (error) => {
          this.currentStatus = { isPlaying: false };
          reject(new AudioPlayerError('Playback error', error));
        });

        this.speaker.on('close', () => {
          this.currentStatus = { isPlaying: false };
          this.speaker = null;
          resolve();
        });

        // Write audio buffer to speaker
        this.speaker.write(Buffer.from(audioBuffer));
        this.speaker.end();
      } catch (error) {
        this.currentStatus = { isPlaying: false };
        reject(
          new AudioPlayerError(
            'Failed to initialize playback',
            error instanceof Error ? error : undefined
          )
        );
      }
    });
  }

  /**
   * Play audio from stream
   */
  async playStream(stream: ReadableStream<Uint8Array>): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        this.speaker = new Speaker({
          channels: this.config.channels || 1,
          bitDepth: 16,
          sampleRate: this.config.sampleRate || 24000,
        });

        this.currentStatus = { isPlaying: true };

        this.speaker.on('error', (error) => {
          this.currentStatus = { isPlaying: false };
          reject(new AudioPlayerError('Playback error', error));
        });

        this.speaker.on('close', () => {
          this.currentStatus = { isPlaying: false };
          this.speaker = null;
          resolve();
        });

        // Read from stream and write to speaker
        const reader = stream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          this.speaker.write(Buffer.from(value));
        }
        this.speaker.end();
      } catch (error) {
        this.currentStatus = { isPlaying: false };
        reject(
          new AudioPlayerError(
            'Failed to play stream',
            error instanceof Error ? error : undefined
          )
        );
      }
    });
  }

  /**
   * Stop current playback
   */
  stop(): void {
    if (this.speaker) {
      this.speaker.end();
      this.speaker = null;
      this.currentStatus = { isPlaying: false };
    }
  }

  /**
   * Get current playback status
   */
  getStatus(): PlaybackStatus {
    return { ...this.currentStatus };
  }
}
```

## Recommended: mpv Streaming Player

**File: `src/audio/player.ts`** (Updated for mpv)

```typescript
import { AudioError } from '../types';

/**
 * Audio player using mpv for streaming playback
 * Falls back to macOS say command
 */
export class AudioPlayer {
  /**
   * Play audio stream using mpv
   * If mpv fails, fallback to macOS say command
   */
  async play(audioStream: ReadableStream<Uint8Array>): Promise<void> {
    try {
      await this.playWithMpv(audioStream);
    } catch (error) {
      console.warn('mpv playback failed, using fallback:', error);
      await this.fallbackToSay();
    }
  }

  /**
   * Stream audio directly to mpv
   */
  private async playWithMpv(audioStream: ReadableStream<Uint8Array>): Promise<void> {
    try {
      // Spawn mpv process with stdin input
      const proc = Bun.spawn(['mpv', '--no-video', '--no-terminal', '-'], {
        stdin: 'pipe',
      });

      const writer = proc.stdin.getWriter();
      const reader = audioStream.getReader();

      // Stream audio chunks to mpv
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } finally {
        writer.close();
      }

      await proc.exited;
    } catch (error) {
      throw new AudioError(
        `mpv playback failed: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  }

  /**
   * Fallback to macOS say command
   */
  private async fallbackToSay(): Promise<void> {
    try {
      const proc = Bun.spawn([
        'say',
        '-v', 'Daniel',
        'ElevenLabs is currently unavailable. Using system voice instead.'
      ]);
      await proc.exited;
    } catch (error) {
      throw new AudioError('All audio playback methods failed');
    }
  }

  /**
   * Play text directly with say command (for announcements)
   */
  async playText(text: string, voice: string = 'Daniel'): Promise<void> {
    try {
      const proc = Bun.spawn(['say', '-v', voice, text]);
      await proc.exited;
    } catch (error) {
      throw new AudioError(`say command failed: ${error instanceof Error ? error.message : 'unknown'}`);
    }
  }
}
```

## Acceptance Criteria
- [ ] AudioPlayer class created
- [ ] play() method plays audio from buffer
- [ ] playStream() method plays from ReadableStream
- [ ] stop() method stops playback
- [ ] getStatus() returns current state
- [ ] Errors wrapped in AudioPlayerError
- [ ] System fallback player implemented (optional)

## Notes
- **MP3 Decoding**: speaker package expects PCM. Consider requesting PCM format from ElevenLabs or use a decoder like `@flat/mp3-decoder`
- **Alternative**: Use system commands via Bun.spawn for simplicity
- Handle cleanup properly to avoid resource leaks

## Research Reference
- See research.md "Audio Playback"
- Consider using Bun.spawn with afplay/aplay as simpler alternative
