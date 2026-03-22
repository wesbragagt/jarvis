# Task: Create CLI Entry Point

## Objective
Create the main CLI entry point with environment validation, service initialization, and graceful shutdown handling.

## Implementation

**File: `src/config.ts`**

```typescript
export interface Config {
  anthropicApiKey: string;
  elevenLabsApiKey: string;
  voiceId?: string;
  aiModel?: string;
}

/**
 * Load and validate configuration from environment
 */
export function loadConfig(): Config {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

  if (!anthropicApiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is required.\n' +
      'Get your key from: https://console.anthropic.com/'
    );
  }

  if (!elevenLabsApiKey) {
    throw new Error(
      'ELEVENLABS_API_KEY environment variable is required.\n' +
      'Get your key from: https://elevenlabs.io/'
    );
  }

  return {
    anthropicApiKey,
    elevenLabsApiKey,
    voiceId: process.env.ELEVENLABS_VOICE_ID,
    aiModel: process.env.AI_MODEL,
  };
}
```

**File: `src/index.tsx`**

```typescript
#!/usr/bin/env bun
import React from 'react';
import { render } from 'ink';
import { App } from './ui/App';
import { createChatService } from './services/factory';
import { loadConfig } from './config';

async function main() {
  try {
    // Load and validate config
    const config = loadConfig();

    // Create chat service
    const chatService = createChatService({
      anthropicApiKey: config.anthropicApiKey,
      elevenLabsApiKey: config.elevenLabsApiKey,
      voiceId: config.voiceId,
      aiModel: config.aiModel,
    });

    // Handle message submission
    const handleSubmit = async (message: string) => {
      await chatService.processMessage(message);
    };

    // Handle exit
    const handleExit = () => {
      chatService.stop();
      process.exit(0);
    };

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      chatService.stop();
      process.exit(0);
    });

    // Render TUI
    const { waitUntilExit } = render(
      <App onSubmit={handleSubmit} onExit={handleExit} />
    );

    await waitUntilExit();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\n❌ Error: ${error.message}\n`);
    } else {
      console.error('\n❌ An unexpected error occurred\n');
    }
    process.exit(1);
  }
}

main();
```

**File: `src/ui/App.tsx` (updated for exit handling)**

```tsx
import React, { useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
// ... other imports

export function App({ onSubmit, onExit }: AppProps) {
  const state = useChatState();
  const { exit } = useApp();

  // Handle Ctrl+C
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      onExit();
      exit();
    }
  });

  // ... rest of component
}
```

**File: `package.json` (update bin field)**

```json
{
  "name": "ai-chat-voice-tts",
  "type": "module",
  "bin": {
    "ai-chat": "./src/index.tsx"
  },
  "scripts": {
    "chat": "bun --hot src/index.tsx",
    "test": "bun test",
    "build": "bun build src/index.tsx --compile --outfile ai-chat"
  }
}
```

## Usage

```bash
# Development mode
bun run chat

# Install globally
bun link

# Run from anywhere
ai-chat

# Compile to binary (optional)
bun run build
./ai-chat
```

## Acceptance Criteria
- [ ] Config loader validates environment variables
- [ ] Clear error messages for missing API keys
- [ ] CLI entry point initializes all services
- [ ] Graceful shutdown on Ctrl+C
- [ ] Stop audio playback on exit
- [ ] Shebang for direct execution
- [ ] bin field in package.json for global install

## Environment Setup Instructions

Create `.env` file:
```bash
ANTHROPIC_API_KEY=sk-ant-...
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Optional
AI_MODEL=claude-3-5-sonnet-20241022  # Optional
```

## Testing Notes
- Test missing API key scenarios
- Test Ctrl+C interruption during playback
- Verify clean shutdown without errors
- Test with invalid API keys

## Research Reference
- See prd.md "Configuration" section
- Bun automatically loads .env (per CLAUDE.md)
