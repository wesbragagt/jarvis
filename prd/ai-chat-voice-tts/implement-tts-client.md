# Task: Implement TTS Client

## Objective
Create ElevenLabs TTS API client to convert text responses into audio streams.

## Implementation

**File: `src/clients/tts.ts`**

```typescript
import { TTSClientConfig, TTSClientError, TTSOptions } from '../types';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel

export class TTSClient {
  private apiKey: string;
  private voiceId: string;

  constructor(config: TTSClientConfig) {
    if (!config.apiKey) {
      throw new TTSClientError('API key is required');
    }

    this.apiKey = config.apiKey;
    this.voiceId = config.voiceId || DEFAULT_VOICE_ID;
  }

  /**
   * Convert text to speech and return audio stream
   */
  async streamTTS(text: string, voiceId?: string): Promise<ReadableStream<Uint8Array>> {
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
          model_id: 'eleven_turbo_v2', // Low latency model (~300ms)
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new TTSClientError(
          `TTS API error: ${response.statusText} - ${errorText}`,
          response.status.toString()
        );
      }

      if (!response.body) {
        throw new TTSClientError('No response body received');
      }

      return response.body;
    } catch (error) {
      if (error instanceof TTSClientError) {
        throw error;
      }
      throw new TTSClientError(
        `Failed to convert text to speech: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get audio buffer from text (convenience method)
   */
  async getAudioBuffer(text: string): Promise<Uint8Array> {
    const stream = await this.textToSpeech({ text });
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine chunks into single buffer
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const buffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    return buffer;
  }
}
```

## Acceptance Criteria
- [ ] TTSClient class created with config validation
- [ ] textToSpeech returns audio stream
- [ ] getAudioBuffer returns complete audio data
- [ ] Errors wrapped in TTSClientError
- [ ] Uses ElevenLabs REST API
- [ ] Configurable voice ID

## Testing Notes
- Mock fetch for unit tests
- Test error scenarios (invalid key, rate limits)
- Verify audio stream is readable

## Research Reference
- See research.md "ElevenLabs TTS Integration"
- ElevenLabs API docs: https://elevenlabs.io/docs/api-reference/text-to-speech
