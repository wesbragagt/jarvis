# Research: AI Chat Voice TTS

## CLI TUI Frameworks

### Ink (Recommended)
- React-based TUI framework
- Component-driven architecture
- Built-in state management via React hooks
- Rich ecosystem: ink-text-input, ink-spinner, ink-box
- TypeScript support

**Pros:**
- Familiar React patterns
- Easy to test and maintain
- Active community

**Cons:**
- Heavier than low-level alternatives
- Requires React knowledge

### Blessed
- Low-level terminal manipulation
- More control over rendering
- Smaller footprint

**Cons:**
- Steeper learning curve
- More boilerplate

**Decision:** Use **ink** for faster development and better maintainability.

## AI Chat Integration

### Anthropic Claude API
- Streaming via Server-Sent Events (SSE)
- `@anthropic-ai/sdk` official package
- Message format: `{role: 'user'|'assistant', content: string}`
- Supports system prompts for behavior control

**Best Practices:**
- Stream responses for real-time feedback
- Maintain conversation history in memory
- Set reasonable max_tokens (1024-2048 for voice)
- Use claude-3-5-sonnet for quality/speed balance

## ElevenLabs TTS Integration

### API Options
1. **REST API** - `/v1/text-to-speech/{voice_id}`
   - Returns audio stream (mp3/pcm)
   - Simple to implement
   - 500 char limit per request

2. **WebSocket API** - Real-time streaming
   - Lower latency
   - Chunks as text arrives
   - More complex implementation

**Voice Selection:**
- Pre-built voices (Rachel, Adam, etc.)
- Voice ID required in API calls
- Consider making voice configurable

**Recommended Approach:**
- Use REST API for simplicity
- Stream audio chunks to player
- PCM format for direct playback

## Audio Playback

### Cross-Platform Options

1. **speaker package**
   - Pure Node.js PCM playback
   - Cross-platform
   - Streaming support

2. **System Tools**
   - macOS: `afplay`
   - Linux: `aplay` or `ffplay`
   - Windows: `powershell -c (New-Object Media.SoundPlayer 'file.wav').PlaySync()`

**Bun Consideration:**
- `Bun.spawn()` for system commands
- Native WebAudio API potential (browser-based fallback)

**Decision:** Use **speaker** package for consistency, fallback to system tools.

## Architecture Pattern

```
┌─────────────┐
│   CLI TUI   │ (ink components)
└──────┬──────┘
       │
┌──────┴──────────────────────┐
│                             │
▼                             ▼
┌──────────────┐      ┌──────────────┐
│  AI Client   │      │ Audio Player │
│  (Anthropic) │      │              │
└──────┬───────┘      └──────▲───────┘
       │                     │
       ▼                     │
┌──────────────┐             │
│  TTS Client  │─────────────┘
│ (ElevenLabs) │
└──────────────┘
```

### State Flow
1. User types message in TUI
2. Message sent to AI client (streaming)
3. Streamed response displayed in TUI
4. Complete response sent to TTS client
5. Audio stream sent to player
6. Audio plays while showing visual feedback

## Key Technical Considerations

### Environment Variables
- `ANTHROPIC_API_KEY`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID` (optional, default to preset)

### Error Handling
- Network failures (retry logic)
- API rate limits (backoff)
- Audio playback failures (graceful degradation)
- Invalid API keys (clear error messages)

### Performance
- Stream AI responses (don't wait for complete response)
- Queue audio chunks (prevent stuttering)
- Cleanup audio buffers after playback

### User Experience
- Show typing indicator while AI responds
- Show audio indicator while speaking
- Allow interruption (Ctrl+C gracefully stops audio)
- Conversation history visible in scrollable area

## Libraries Summary

**Required:**
- `ink` - TUI framework
- `ink-text-input` - User input
- `ink-spinner` - Loading states
- `@anthropic-ai/sdk` - Claude API
- `elevenlabs-node` or direct fetch - TTS API
- `speaker` - Audio playback
- `@types/node` - TypeScript types

**Optional:**
- `ink-box` - UI borders/containers
- `ink-gradient` - Visual polish
- `chalk` - Text coloring (if not using ink)

## Implementation Phases

1. **Foundation** - Basic TUI with input/output
2. **AI Integration** - Connect to Claude, stream responses
3. **TTS Integration** - Convert text to speech via ElevenLabs
4. **Audio Playback** - Play audio through speaker
5. **Polish** - Error handling, history, UX improvements
