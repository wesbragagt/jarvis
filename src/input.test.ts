import { test, expect } from 'bun:test';
import { InputHandler } from './input';
import { InputError } from './types';
import { writeFileSync, unlinkSync } from 'node:fs';

test('InputHandler - getText returns direct text', async () => {
  const text = await InputHandler.getText({ text: 'Hello, world!' });
  expect(text).toBe('Hello, world!');
});

test('InputHandler - getText reads from file', async () => {
  const testFile = '/tmp/test-input.txt';
  writeFileSync(testFile, 'File content');

  try {
    const text = await InputHandler.getText({ file: testFile });
    expect(text).toBe('File content');
  } finally {
    unlinkSync(testFile);
  }
});

test('InputHandler - getText throws on missing file', async () => {
  await expect(
    InputHandler.getText({ file: '/nonexistent/file.txt' })
  ).rejects.toThrow(InputError);
});

test('InputHandler - getText throws when no input', async () => {
  await expect(
    InputHandler.getText({ stdin: false })
  ).rejects.toThrow(InputError);
});

test('InputHandler - validateText checks empty', () => {
  expect(() => {
    InputHandler.validateText('');
  }).toThrow(InputError);

  expect(() => {
    InputHandler.validateText('   ');
  }).toThrow(InputError);

  expect(() => {
    InputHandler.validateText('Valid text');
  }).not.toThrow();
});

test('InputHandler - validateText checks max length', () => {
  const longText = 'a'.repeat(6000);

  expect(() => {
    InputHandler.validateText(longText);
  }).toThrow(InputError);

  expect(() => {
    InputHandler.validateText('Short text');
  }).not.toThrow();
});
