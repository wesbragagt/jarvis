import { TTSError } from '../types';
import { join } from 'node:path';

const SCRIPT_PATH = join(import.meta.dir, '../../scripts/kokoro_speak.py');
const DEFAULT_VOICE = 'af_heart';

export class TTSClient {
  private voice: string;

  constructor(config: { voice?: string } = {}) {
    this.voice = config.voice || DEFAULT_VOICE;
  }

  async streamTTS(text: string, voice?: string): Promise<ReadableStream<Uint8Array>> {
    const selectedVoice = voice || this.voice;

    try {
      const proc = Bun.spawn(['uv', 'run', SCRIPT_PATH, '--voice', selectedVoice], {
        stdin: 'pipe',
        stdout: 'pipe',
        stderr: 'pipe',
      });

      proc.stdin.write(text);
      proc.stdin.end();

      return proc.stdout;
    } catch (error) {
      if (error instanceof TTSError) throw error;
      throw new TTSError(
        `Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
