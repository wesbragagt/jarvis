# Task: Setup Project

## Objective
Initialize Bun project with TypeScript configuration and minimal dependencies for TTS hook.

## Implementation Steps

1. **Create directory structure:**
```bash
mkdir -p src/{clients,audio,utils}
touch src/index.ts
touch src/types.ts
touch src/input.ts
touch src/clients/tts.ts
touch src/audio/player.ts
```

2. **Install dependencies (minimal):**
```bash
# No external dependencies needed!
# Bun has built-in fetch, spawn, file I/O
# Will use system mpv for audio playback

# Optional: Add types if needed
bun add -d @types/node bun-types
```

3. **Update package.json:**
```json
{
  "name": "jarvis-tts",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "tts": "bun run src/index.ts",
    "dev": "bun --watch src/index.ts",
    "test": "bun test"
  },
  "devDependencies": {
    "@types/node": "latest",
    "bun-types": "latest"
  }
}
```

4. **Configure TypeScript:**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "types": ["bun-types"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

5. **Create .env.example:**
```bash
# ElevenLabs API Key (required)
ELEVENLABS_API_KEY=your_api_key_here

# Voice ID (optional, defaults to Rachel)
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

6. **Update .gitignore:**
```
node_modules/
.env
*.log
dist/
.DS_Store
```

## System Requirements

Install system dependencies:

```bash
# macOS (should have these by default)
# - say command (built-in)
# - mpv (optional, for better playback)
brew install mpv

# Verify installation
which mpv
which say
```

## Acceptance Criteria
- [x] Directory structure created
- [x] Zero npm dependencies (use Bun built-ins)
- [x] package.json configured with scripts
- [x] TypeScript configured for strict mode
- [x] .env.example created
- [x] .gitignore updated
- [x] System dependencies verified (mpv or say)

## Verification

```bash
# Check Bun version
bun --version

# Test TypeScript
echo 'console.log("Hello from Bun!")' > src/test.ts
bun run src/test.ts

# Verify system audio
echo "Testing audio" | say
mpv --version
```

## Notes
- **Zero npm dependencies**: Use Bun's built-in APIs for everything
- **System audio**: Prefer `mpv` for streaming, fallback to `say`
- **Minimal setup**: Fast installation, lightweight runtime
