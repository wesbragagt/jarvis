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
  async play(audioStream: ReadableStream<Uint8Array>, fallbackText?: string): Promise<void> {
    try {
      await this.playWithMpv(audioStream);
    } catch (error) {
      console.warn('⚠️  mpv playback failed, using say fallback');
      await this.fallbackToSay(fallbackText);
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

      const reader = audioStream.getReader();

      // Stream audio chunks to mpv stdin
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          proc.stdin.write(value);
        }
      } finally {
        proc.stdin.end();
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
  private async fallbackToSay(text?: string): Promise<void> {
    try {
      const message = text || 'Audio playback failed. Using system voice instead.';
      const proc = Bun.spawn(['say', '-v', 'Daniel', message]);
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
