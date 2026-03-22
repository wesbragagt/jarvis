import type { TTSConfig } from '../types';
import { TTSError } from '../types';
import { retry } from '../utils/retry';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel

export class TTSClient {
  private apiKey: string;
  private voiceId: string;
  private stability: number;
  private similarityBoost: number;
  private modelId: string;

  constructor(config: TTSConfig) {
    if (!config.apiKey) {
      throw new TTSError('API key is required');
    }

    this.apiKey = config.apiKey;
    this.voiceId = config.voiceId || DEFAULT_VOICE_ID;
    this.stability = config.stability ?? 0.5;
    this.similarityBoost = config.similarityBoost ?? 0.75;
    this.modelId = config.modelId || 'eleven_turbo_v2';
  }

  /**
   * Convert text to speech and return audio stream (with retry)
   */
  async streamTTS(text: string, voiceId?: string): Promise<ReadableStream<Uint8Array>> {
    return retry(async () => {
      const voice = voiceId || this.voiceId;
      const url = `${ELEVENLABS_API_URL}/text-to-speech/${voice}/stream`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text: text,
            model_id: this.modelId,
            voice_settings: {
              stability: this.stability,
              similarity_boost: this.similarityBoost,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new TTSError(
            `TTS API error: ${response.statusText} - ${errorText}`,
            response.status.toString(),
            response.status
          );
        }

        if (!response.body) {
          throw new TTSError('No response body received');
        }

        return response.body;
      } catch (error) {
        if (error instanceof TTSError) {
          throw error;
        }
        throw new TTSError(
          `Failed to convert text to speech: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }, { maxAttempts: 2 });
  }
}
