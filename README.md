# JARVIS TTS - Claude Code Voice Hook

Convert text to speech using ElevenLabs TTS. Designed as an on-demand hook for Claude Code to speak responses aloud.

## Features

- 🎙️ **Dual TTS modes**: High-quality ElevenLabs OR built-in macOS voices
- 🔊 **Works out of the box** - no API key required (uses macOS `say`)
- ⚡ **Fast**: ~400ms with ElevenLabs, instant with macOS voices
- 🎯 **Claude Code integration** via keybindings or commands
- 🛠️ **Built with Bun** for maximum performance
- 🔄 **Automatic fallback**: ElevenLabs → mpv → macOS say

## Prerequisites

- [Bun](https://bun.sh) installed
- macOS with `say` command (built-in)
- Optional: ElevenLabs API key for higher quality ([get one here](https://elevenlabs.io))
- Optional: `mpv` for better streaming (`brew install mpv`)

## Installation

```bash
# Navigate to project
cd /Users/wesbragagt/dev/jarvis

# Install dependencies (minimal - uses Bun built-ins)
bun install

# Setup environment
cp .env.example .env
# Add your ELEVENLABS_API_KEY to .env
```

## Configuration

Create `.env` file (optional):

```bash
# Optional: Use ElevenLabs for high-quality TTS
# If not set, uses macOS say command
# ELEVENLABS_API_KEY=your_api_key_here
# ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Rachel (default)

# Optional: Default macOS voice
# MACOS_VOICE=Daniel  # Default
```

### Available Voices

**macOS Voices (built-in, no API key needed):**
- `Daniel` - Male, clear (default)
- `Samantha` - Female, friendly
- `Alex` - Male, natural
- `Karen` - Female, Australian
- `Moira` - Female, Irish
- `Fiona` - Female, Scottish

List all: `say -v ?`

**ElevenLabs Voices (requires API key):**
- `21m00Tcm4TlvDq8ikWAM` - Rachel (calm female)
- `EXAVITQu4vr4xnSDxMaL` - Bella (soft female)
- `ErXwobaYiN019PkySvjV` - Antoni (well-rounded male)
- `VR6AewLTigWG4xSOukaG` - Arnold (crisp male)

Find more at [ElevenLabs Voice Library](https://elevenlabs.io/voice-library).

## Usage

### Command Line

```bash
# From stdin (uses macOS say by default)
echo "Hello, world" | bun run tts

# Direct text
bun run tts --text "Hello, world"

# From file
bun run tts --file response.txt

# Custom macOS voice
bun run tts --voice Samantha --text "Different voice"

# With ElevenLabs (if API key is set)
export ELEVENLABS_API_KEY=your_key
bun run tts --voice 21m00Tcm4TlvDq8ikWAM --text "High quality"

# Show help
bun run tts --help
```

### As Claude Code Hook

**Option 1: Keybinding with Toggle (Recommended)**

Add to `~/.claude/keybindings.json`:

```json
{
  "keybindings": [
    {
      "key": "ctrl+shift+s",
      "command": "cd /Users/wesbragagt/dev/jarvis && ./scripts/tts-with-check.sh",
      "description": "Speak last response with TTS (respects toggle state)"
    }
  ]
}
```

Then use the skills to control TTS:
- `/tts-on` - Enable TTS
- `/tts-off` - Disable TTS
- `/tts-toggle` - Toggle TTS on/off
- `/tts-status` - Check current status

**Option 2: Always-On Keybinding**

```json
{
  "keybindings": [
    {
      "key": "ctrl+shift+s",
      "command": "cd /Users/wesbragadt/dev/jarvis && bun run tts",
      "description": "Always speak last response"
    }
  ]
}
```

**Option 3: User Prompt Submit Hook**

Add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "user-prompt-submit": "cd /Users/wesbragagt/dev/jarvis && ./scripts/tts-with-check.sh"
  }
}
```

This will automatically speak every Claude response when TTS is enabled.

## Architecture

```
┌─────────────┐
│ User Input  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Input Handler   │
│  (stdin/file)    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   TTS Client     │
│  (ElevenLabs)    │
│  + Retry Logic   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Audio Player    │
│ (mpv or say)     │
└──────┬───────────┘
       │
       ▼
   🔊 Audio Out
```

## Development

```bash
# Run in dev mode (auto-reload)
bun --watch src/index.ts

# Run tests
bun test

# Type check
bunx tsc --noEmit
```

## Troubleshooting

### No API key needed!
- The tool works out of the box with macOS `say` voices
- ElevenLabs is optional for higher quality TTS
- If you want ElevenLabs, set `ELEVENLABS_API_KEY` in `.env`

### No audio output
- Check system volume
- Verify speaker is not muted
- Test with: `echo "test" | bun run tts`
- Check audio output device in system settings

### "mpv not found" warning
- This is okay! The tool will automatically fall back to `say`
- To install mpv: `brew install mpv`

### Audio playback failed
- If mpv fails, falls back to `say` command
- Verify `say` works: `say "test"`
- On Linux, may need: `sudo apt-get install mpv`

### API rate limits
- ElevenLabs free tier: 10,000 characters/month
- If exceeded, upgrade plan or wait for monthly reset
- Tool automatically retries with exponential backoff

### Network errors
- Tool retries automatically (up to 2 attempts)
- Check internet connection
- Verify ElevenLabs API status: https://status.elevenlabs.io

## Performance

- **TTS API latency**: ~300ms (using `eleven_turbo_v2` model)
- **Audio playback start**: < 100ms after first chunk
- **Total latency**: ~400ms from command to audio
- **Memory footprint**: < 20MB during playback
- **Dependencies**: Zero npm packages (Bun built-ins only)

## API Documentation

- [ElevenLabs API Docs](https://elevenlabs.io/docs)
- [Bun Documentation](https://bun.sh/docs)
- [Claude Code Hooks](https://docs.anthropic.com/claude/docs/claude-code)

## Project Structure

```
src/
├── index.ts           # CLI entry point
├── types.ts           # TypeScript types
├── input.ts           # Input handler (stdin/file/text)
├── clients/
│   └── tts.ts         # ElevenLabs client
├── audio/
│   └── player.ts      # Audio playback (mpv/say)
└── utils/
    └── retry.ts       # Retry logic

tests:
├── clients/tts.test.ts
└── input.test.ts
```

## License

MIT

## Credits

- Inspired by [Charles Sieg's article](https://www.charlessieg.com/articles/giving-claude-code-a-voice-with-elevenlabs.html)
- Built with [Bun](https://bun.sh)
- Powered by [ElevenLabs](https://elevenlabs.io)
