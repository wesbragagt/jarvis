import { test, expect } from 'bun:test';
import { TTSClient } from './tts';
import { TTSError } from '../types';

test('TTSClient - constructor validates API key', () => {
  expect(() => {
    new TTSClient({ apiKey: '' });
  }).toThrow(TTSError);

  expect(() => {
    new TTSClient({ apiKey: 'valid-key' });
  }).not.toThrow();
});

test('TTSClient - constructor sets defaults', () => {
  const client = new TTSClient({ apiKey: 'test-key' });

  expect(client['voiceId']).toBe('21m00Tcm4TlvDq8ikWAM');
  expect(client['modelId']).toBe('eleven_turbo_v2');
  expect(client['stability']).toBe(0.5);
  expect(client['similarityBoost']).toBe(0.75);
});

test('TTSClient - constructor accepts custom config', () => {
  const client = new TTSClient({
    apiKey: 'test-key',
    voiceId: 'custom-voice',
    modelId: 'custom-model',
    stability: 0.8,
    similarityBoost: 0.9,
  });

  expect(client['voiceId']).toBe('custom-voice');
  expect(client['modelId']).toBe('custom-model');
  expect(client['stability']).toBe(0.8);
  expect(client['similarityBoost']).toBe(0.9);
});
