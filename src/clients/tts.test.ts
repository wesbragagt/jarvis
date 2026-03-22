import { test, expect } from 'bun:test';
import { TTSClient } from './tts';

test('TTSClient - constructor sets default voice', () => {
  const client = new TTSClient();
  expect(client['voice']).toBe('af_heart');
});

test('TTSClient - constructor accepts custom voice', () => {
  const client = new TTSClient({ voice: 'am_adam' });
  expect(client['voice']).toBe('am_adam');
});
