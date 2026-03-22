# Task: Documentation

## Objective
Create comprehensive README with setup instructions, usage guide, and troubleshooting.

## Implementation

**File: `README.md`**

```markdown
# AI Chat Voice TTS

A command-line Text User Interface (TUI) for conversational AI chat with text-to-speech responses powered by Claude and ElevenLabs.

## Features

- **Interactive CLI**: Clean terminal interface with real-time streaming responses
- **AI Chat**: Powered by Anthropic's Claude for intelligent conversations
- **Voice Responses**: Text-to-speech using ElevenLabs for audio playback
- **Real-time Feedback**: Visual indicators for AI thinking and audio playback
- **Error Handling**: Automatic retry logic with graceful degradation

## Prerequisites

- [Bun](https://bun.sh/) runtime
- Anthropic API key ([Get one here](https://console.anthropic.com/))
- ElevenLabs API key ([Get one here](https://elevenlabs.io/))

## Installation

```bash
# Clone and install
git clone <repo-url>
cd ai-chat-voice-tts
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

## Configuration

Create a `.env` file with the following variables:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-xxxxx
ELEVENLABS_API_KEY=xxxxx

# Optional
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Default: Rachel
AI_MODEL=claude-3-5-sonnet-20241022       # Default: claude-3-5-sonnet
```

## Usage

### Development Mode

```bash
bun run chat
```

### Install Globally

```bash
bun link
ai-chat
```

### Build Binary

```bash
bun run build
./ai-chat
```

## How It Works

1. Type your message in the input field
2. Press Enter to send
3. AI response streams to the conversation area in real-time
4. Once complete, the response is converted to speech
5. Audio plays through your system speakers
6. Type your next message or press Ctrl+C to exit

## Architecture

```
src/
├── ui/              # Ink React components (TUI)
├── clients/         # API clients (Anthropic, ElevenLabs)
├── audio/           # Audio playback handler
├── state/           # State management
├── services/        # Integration layer
├── utils/           # Helpers (retry, errors)
├── types/           # TypeScript definitions
└── index.tsx        # Main entry point
```

## Technology Stack

- **Runtime**: Bun
- **UI Framework**: Ink (React for CLIs)
- **AI**: Anthropic Claude API
- **TTS**: ElevenLabs API
- **Audio**: speaker package
- **Language**: TypeScript

## Troubleshooting

### Audio Not Playing

- **macOS**: Ensure system audio is not muted
- **Linux**: Install `alsa-utils` (`sudo apt install alsa-utils`)
- **Fallback**: Check console logs for audio errors (app continues in degraded mode)

### API Errors

- **401 Unauthorized**: Check your API keys in `.env`
- **429 Rate Limit**: Wait a moment and try again (automatic retry with backoff)
- **Network Errors**: Check internet connection (automatic retry up to 3 times)

### Installation Issues

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lock
bun install
```

## Development

### Run Tests

```bash
bun test
```

### Project Structure

- **Clients**: Isolated API clients with error handling
- **State**: Simple observer pattern for state management
- **UI**: React components using Ink primitives
- **Services**: Integration layer orchestrating the pipeline

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run `bun test` to ensure tests pass
6. Submit a pull request

## License

MIT

## Acknowledgments

- [Anthropic](https://anthropic.com/) for Claude API
- [ElevenLabs](https://elevenlabs.io/) for TTS API
- [Ink](https://github.com/vadimdemedes/ink) for the TUI framework
```

**File: `.env.example`**

```bash
# Anthropic API Key (required)
# Get yours at: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-xxxxx

# ElevenLabs API Key (required)
# Get yours at: https://elevenlabs.io/
ELEVENLABS_API_KEY=xxxxx

# ElevenLabs Voice ID (optional)
# Default: 21m00Tcm4TlvDq8ikWAM (Rachel)
# Browse voices at: https://elevenlabs.io/voice-library
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# AI Model (optional)
# Default: claude-3-5-sonnet-20241022
AI_MODEL=claude-3-5-sonnet-20241022
```

## Acceptance Criteria
- [ ] README.md with comprehensive setup instructions
- [ ] Usage examples for dev, global install, and binary
- [ ] Architecture overview and tech stack documented
- [ ] Troubleshooting section for common issues
- [ ] .env.example with all configuration options
- [ ] Contributing guidelines
- [ ] Links to API key registration pages

## Additional Documentation (optional)

**File: `ARCHITECTURE.md`** (if needed for complex details)
- Detailed component interactions
- State flow diagrams
- Error handling strategy

## Notes
- Keep README concise and scannable
- Include links to external resources
- Provide clear setup steps for beginners
- Document known limitations
