# PRD: Claude Code TTS Hook

## Overview

A Claude Code hook that enables on-demand text-to-speech playback of Claude's responses using ElevenLabs. Users can trigger TTS via a command or keybinding to hear Claude's last response spoken aloud.

## Goals

1. **Primary**: Create a hook that converts Claude Code responses to speech
2. **User Experience**: Quick, on-demand audio playback with minimal latency
3. **Integration**: Seamless integration with Claude Code workflow
4. **Simplicity**: Single command/keybinding to trigger TTS

## Functional Requirements

### Core Features

1. **TTS Command**
   - Executable command: `bun run tts` or `jarvis-tts`
   - Reads last Claude response from stdin or file
   - Converts text to speech via ElevenLabs API
   - Plays audio through system speakers
   - Returns immediately after starting playback

2. **Hook Integration**
   - Configurable as Claude Code hook
   - Can be triggered via keybinding or slash command
   - Accesses Claude's last response text
   - Works in background without blocking Claude Code

3. **Audio Playback**
   - Stream audio directly to speakers
   - Visual feedback (optional spinner/progress)
   - Cancellable (Ctrl+C)
   - No temporary files (stream directly)

4. **Configuration**
   - Load ElevenLabs API key from environment
   - Configurable voice ID
   - Optional voice speed/stability settings
   - No additional setup required (Bun auto-loads .env)

### User Flow

```
1. User asks Claude a question
2. Claude responds with text
3. User presses keybinding or types /tts
4. Hook executes: bun run tts
5. Audio plays through speakers while user continues working
6. (Optional) User can cancel with Ctrl+C
```

### Out of Scope

- Voice input (speech-to-text)
- Automatic TTS for every response
- TUI interface (just CLI command)
- Conversation history management
- Multiple voice selection UI
- Response caching/persistence

## Technical Considerations

### Architecture

**Components:**
1. **CLI Entry** (`src/index.ts`) - Main entry point, handles args
2. **TTS Client** (`src/clients/tts.ts`) - ElevenLabs API integration
3. **Audio Player** (`src/audio/player.ts`) - Stream audio to speakers
4. **Input Handler** (`src/input.ts`) - Read response text from stdin/file
5. **Types** (`src/types.ts`) - TypeScript interfaces

### Technology Stack

**Runtime:** Bun (per CLAUDE.md)

**Core Approach:**
- Direct ElevenLabs API streaming (no SDK needed)
- `mpv` for audio playback (via shell)
- Fallback to macOS `say` command
- TypeScript for type safety
- Asynchronous execution (don't block)

**Model:** `eleven_turbo_v2` (low latency ~300ms)

**No Dependencies on:**
- ❌ Ink (no TUI needed)
- ❌ AI client libraries (reads text, doesn't generate)
- ❌ State management (stateless command)
- ❌ Heavy npm packages (keep it minimal)

### Hook Integration

**Option 1: Keybinding Hook**
```json
// ~/.claude/keybindings.json
{
  "keybindings": [
    {
      "key": "ctrl+shift+s",
      "command": "cd /Users/wesbragagt/dev/jarvis && bun run tts"
    }
  ]
}
```

**Option 2: User Prompt Submit Hook**
```json
// ~/.claude/settings.json
{
  "hooks": {
    "user-prompt-submit": "cd /Users/wesbragagt/dev/jarvis && bun run tts"
  }
}
```

### Input Methods

**Primary: STDIN**
```bash
echo "Hello, this is Claude's response" | bun run tts
```

**Alternative: File Argument**
```bash
bun run tts --file /path/to/response.txt
```

**Alternative: Direct Text**
```bash
bun run tts --text "Hello, world"
```

### API Integration

**ElevenLabs:**
- Endpoint: `POST /v1/text-to-speech/{voice_id}/stream`
- Model: `eleven_turbo_v2` (optimized for latency)
- Default voice: `21m00Tcm4TlvDq8ikWAM` (Rachel)
- Authentication: `ELEVENLABS_API_KEY` env var
- Voice settings: `stability: 0.5`, `similarity_boost: 0.75`
- Response format: Audio stream (MP3)
- Streaming: True (low latency ~300ms)

**Audio Pipeline:**
```
Text → ElevenLabs API → MP3 Stream → mpv → Speakers
```

**Fallback Pipeline:**
```
Text → macOS say command → Speakers
```

### Environment Variables

Required:
- `ELEVENLABS_API_KEY` - ElevenLabs API authentication

Optional:
- `ELEVENLABS_VOICE_ID` - Custom voice ID (defaults to Rachel)
- `TTS_VOICE_STABILITY` - Voice stability 0-1 (default 0.5)
- `TTS_VOICE_SIMILARITY` - Voice similarity 0-1 (default 0.75)

### Error Handling

- **Missing API Key**: Show clear error, exit with code 1
- **Network Failures**: Retry once, then fail gracefully
- **API Rate Limits**: Show user-friendly error message
- **Audio Playback Errors**: Log error, exit gracefully
- **Empty Input**: Show usage help, exit
- **Invalid Voice ID**: Fall back to default voice

### Performance Targets

- TTS API request: ~300ms to first audio chunk (eleven_turbo_v2)
- Audio playback start: < 100ms after first chunk
- Total latency: ~400ms from command to audio start
- Memory footprint: < 20MB during playback
- Asynchronous execution: Non-blocking (runs in background)

## Success Metrics

1. **Functional**: User can trigger TTS and hear Claude's response
2. **Latency**: Audio starts within 1 second
3. **Reliability**: Handles API errors gracefully
4. **Integration**: Works seamlessly with Claude Code keybindings

## Implementation Notes

### Package Structure

```
jarvis/
├── src/
│   ├── index.ts           # CLI entry point
│   ├── input.ts           # Read text from stdin/args
│   ├── types.ts           # TypeScript types
│   ├── clients/
│   │   └── tts.ts         # ElevenLabs client
│   └── audio/
│       └── player.ts      # Audio playback
├── package.json
├── tsconfig.json
└── .env                   # ELEVENLABS_API_KEY
```

### CLI Usage

```bash
# Install dependencies
bun install

# Run directly
echo "Hello world" | bun run tts

# Or use as script
bun run tts --text "Hello world"

# With options
bun run tts --voice 21m00Tcm4TlvDq8ikWAM --text "Custom voice"
```

### Example Hook Setup

```bash
# Add to Claude Code keybindings
mkdir -p ~/.claude
cat > ~/.claude/keybindings.json <<EOF
{
  "keybindings": [
    {
      "key": "ctrl+shift+s",
      "command": "cd /Users/wesbragagt/dev/jarvis && echo '{last_response}' | bun run tts",
      "description": "Speak Claude's last response"
    }
  ]
}
EOF
```

## Research Citations

- Hook integration: Claude Code hooks documentation
- ElevenLabs streaming: See research.md "ElevenLabs TTS Integration"
- Audio playback: See research.md "Audio Playback"
