#!/usr/bin/env bun
import { parseArgs } from 'node:util';
import { TTSClient } from './clients/tts';
import { AudioPlayer } from './audio/player';
import { InputHandler } from './input';
import type { CLIArgs } from './types';

/**
 * Main CLI entry point
 */
async function main() {
  try {
    // Parse CLI arguments
    const { values } = parseArgs({
      args: Bun.argv.slice(2),
      options: {
        text: { type: 'string', short: 't' },
        file: { type: 'string', short: 'f' },
        voice: { type: 'string', short: 'v' },
        help: { type: 'boolean', short: 'h' },
      },
      allowPositionals: true,
    });

    // Show help
    if (values.help) {
      showHelp();
      process.exit(0);
    }

    // Build CLI args
    const cliArgs: CLIArgs = {
      text: values.text,
      file: values.file,
      voice: values.voice,
      stdin: !values.text && !values.file,
      help: values.help,
    };

    // Get input text
    const text = await InputHandler.getText(cliArgs);
    InputHandler.validateText(text);

    const voice = values.voice || process.env.KOKORO_VOICE || 'af_heart';
    const ttsClient = new TTSClient({ voice });
    const audioPlayer = new AudioPlayer();

    console.log('🎙️  Generating speech with Kokoro...');
    const audioStream = await ttsClient.streamTTS(text);

    console.log('🔊 Playing audio...');
    await audioPlayer.play(audioStream, text);

    console.log('✅ Done');
    process.exit(0);

  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`);
    } else {
      console.error('❌ Unknown error occurred');
    }
    process.exit(1);
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║         JARVIS TTS - Claude Code Voice Hook             ║
╚══════════════════════════════════════════════════════════╝

Convert text to speech using Kokoro (local, offline).

USAGE:
  bun run tts [OPTIONS]

OPTIONS:
  -t, --text <text>     Text to speak
  -f, --file <path>     Read text from file
  -v, --voice <name>    Kokoro voice name (default: af_heart)
  -h, --help            Show this help

EXAMPLES:
  echo "Hello, world" | bun run tts
  bun run tts --text "Hello, world"
  bun run tts --file response.txt
  bun run tts --voice am_adam --text "Different voice"

ENVIRONMENT:
  KOKORO_VOICE    Default voice name (default: af_heart)

VOICES (American English):
  af_heart        Warm female (default)
  af_bella        Expressive female
  am_adam         Male
  am_michael      Male

SETUP:
  pip install kokoro>=0.9.4 soundfile
  brew install espeak-ng
`);
}

// Run main
main();
