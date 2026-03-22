#!/usr/bin/env bun
import { parseArgs } from 'node:util';
import { TTSClient } from './clients/tts';
import { AudioPlayer } from './audio/player';
import { InputHandler } from './input';
import type { TTSConfig, CLIArgs } from './types';

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

    const audioPlayer = new AudioPlayer();
    const apiKey = process.env.ELEVENLABS_API_KEY;

    // Use ElevenLabs if API key is available, otherwise use macOS say
    if (apiKey) {
      // ElevenLabs TTS
      console.log('🎙️  Generating speech with ElevenLabs...');

      const ttsConfig: TTSConfig = {
        apiKey,
        voiceId: values.voice || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
        stability: 0.5,
        similarityBoost: 0.75,
        modelId: 'eleven_turbo_v2',
      };

      const ttsClient = new TTSClient(ttsConfig);
      const audioStream = await ttsClient.streamTTS(text);

      console.log('🔊 Playing audio...');
      await audioPlayer.play(audioStream, text);
    } else {
      // macOS say fallback
      console.log('🔊 Speaking with macOS voice...');
      const voice = values.voice || process.env.MACOS_VOICE || 'Daniel';
      await audioPlayer.playText(text, voice);
    }

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

Convert text to speech using ElevenLabs TTS.

USAGE:
  bun run tts [OPTIONS]

OPTIONS:
  -t, --text <text>     Text to speak
  -f, --file <path>     Read text from file
  -v, --voice <id>      Voice ID or name
  -h, --help            Show this help

EXAMPLES:
  # From stdin (uses macOS say by default)
  echo "Hello, world" | bun run tts

  # Direct text
  bun run tts --text "Hello, world"

  # From file
  bun run tts --file response.txt

  # Custom macOS voice
  bun run tts --voice Samantha --text "Different voice"

  # With ElevenLabs (if API key set)
  export ELEVENLABS_API_KEY=your_key
  bun run tts --voice 21m00Tcm4TlvDq8ikWAM --text "Hi"

ENVIRONMENT:
  ELEVENLABS_API_KEY      Optional: Use ElevenLabs TTS (high quality)
  ELEVENLABS_VOICE_ID     Optional: Default ElevenLabs voice
  MACOS_VOICE             Optional: Default macOS voice (default: Daniel)

MACOS VOICES:
  List available voices: say -v ?
  Popular: Daniel, Samantha, Alex, Karen, Moira, Fiona

HOOK SETUP:
  Add to ~/.claude/keybindings.json:
  {
    "key": "ctrl+shift+s",
    "command": "cd /Users/wesbragagt/dev/jarvis && bun run tts"
  }
`);
}

// Run main
main();
