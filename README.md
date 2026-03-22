# Jarvis TTS

Local text-to-speech for Claude Code using [Kokoro](https://github.com/hexgrad/kokoro) — offline, no API key required.

## Prerequisites

- [Bun](https://bun.sh)
- [uv](https://github.com/astral-sh/uv)
- `mpv` for audio playback: `brew install mpv`
- `espeak-ng` for Kokoro phoneme fallback: `brew install espeak-ng`

## Setup

```bash
bun install
uv sync
```

## Usage

```bash
# From stdin
echo "Hello world" | bun run tts

# Direct text
bun run tts --text "Hello world"

# Custom voice
bun run tts --voice am_adam --text "Hello world"
```

### Voices

Set a default via env: `KOKORO_VOICE=am_adam`

**American English** (`lang_code='a'`)

| Voice | Gender | Grade |
|-------|--------|-------|
| `af_heart` | F | A (default) |
| `af_bella` | F | A- |
| `af_aoede` | F | C+ |
| `af_kore` | F | C+ |
| `af_sarah` | F | C+ |
| `af_nova` | F | C+ |
| `af_sky` | F | C- |
| `af_alloy` | F | C |
| `af_jessica` | F | D |
| `af_nicole` | F | B- |
| `am_puck` | M | C+ |
| `am_michael` | M | C+ |
| `am_fenrir` | M | C+ |
| `am_echo` | M | D |
| `am_eric` | M | D |
| `am_onyx` | M | D |
| `am_adam` | M | F+ |
| `am_liam` | M | C |
| `am_santa` | M | D- |

**British English** (`lang_code='b'`)

| Voice | Gender | Grade |
|-------|--------|-------|
| `bf_emma` | F | B- |
| `bf_isabella` | F | C |
| `bf_alice` | F | D |
| `bf_lily` | F | D |
| `bm_george` | M | B- |
| `bm_fable` | M | C |
| `bm_lewis` | M | C |
| `bm_daniel` | M | D |

**Other languages**

| Voice | Language |
|-------|----------|
| `jf_alpha`, `jf_gongitsune`, `jf_nezuko`, `jf_tebukuro`, `jm_kumo` | Japanese |
| `zf_xiaobei`, `zf_xiaoni`, `zf_xiaoxiao`, `zf_xiaoyi`, `zm_yunjian`, `zm_yunxi`, `zm_yunxia`, `zm_yunyang` | Mandarin Chinese |
| `ef_dora`, `em_alex`, `em_santa` | Spanish |
| `ff_siwis` | French |
| `hf_alpha`, `hf_beta`, `hm_omega`, `hm_psi` | Hindi |
| `if_sara`, `im_nicola` | Italian |
| `pf_dora`, `pm_alex`, `pm_santa` | Brazilian Portuguese |

## Claude Code Integration

### Skills

Use these slash commands in any Claude Code session:

- `/tts-on` — enable TTS (Kokoro speaks each response)
- `/tts-off` — disable TTS
- `/tts-toggle` — flip current state
- `/tts-status` — check current state

### Keybinding (speak on demand)

Add to `~/.claude/keybindings.json`:

```json
{
  "keybindings": [
    {
      "key": "ctrl+shift+s",
      "command": "cd /Users/wesbragagt/dev/jarvis && ./scripts/tts-with-check.sh",
      "description": "Speak last response (respects toggle state)"
    }
  ]
}
```

## Project Structure

```
src/
├── index.ts           # CLI entry point
├── clients/tts.ts     # Kokoro client (spawns Python via uv)
├── audio/player.ts    # Playback via mpv
└── input.ts           # stdin / file / text input

scripts/
├── kokoro_speak.py    # Python: Kokoro → WAV → stdout
├── tts-state.sh       # Read/write ~/.jarvis-tts-state
└── tts-with-check.sh  # Run TTS only if state is enabled

.claude/skills/        # Claude Code slash commands
```
