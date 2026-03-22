import { readFileSync } from 'node:fs';
import type { CLIArgs } from './types';
import { InputError } from './types';

/**
 * Read text input from various sources
 */
export class InputHandler {
  /**
   * Get text from CLI args, stdin, or file
   */
  static async getText(args: CLIArgs): Promise<string> {
    // Priority: --text > --file > stdin

    // 1. Direct text argument
    if (args.text) {
      return args.text.trim();
    }

    // 2. File argument
    if (args.file) {
      try {
        const content = readFileSync(args.file, 'utf-8');
        return content.trim();
      } catch (error) {
        throw new InputError(`Failed to read file: ${args.file}`);
      }
    }

    // 3. Stdin (default)
    if (args.stdin !== false) {
      const text = await this.readStdin();
      if (text) {
        return text.trim();
      }
    }

    throw new InputError('No input provided. Use --text, --file, or pipe to stdin');
  }

  /**
   * Read from stdin
   */
  private static async readStdin(): Promise<string> {
    const chunks: Uint8Array[] = [];

    for await (const chunk of Bun.stdin.stream()) {
      chunks.push(chunk);
    }

    if (chunks.length === 0) {
      return '';
    }

    const buffer = Buffer.concat(chunks);
    return buffer.toString('utf-8');
  }

  /**
   * Validate text length
   */
  static validateText(text: string): void {
    if (!text || text.trim().length === 0) {
      throw new InputError('Input text is empty');
    }

    if (text.length > 5000) {
      throw new InputError('Input text too long (max 5000 characters)');
    }
  }
}
