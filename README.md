# Jarvis TTS

Inspired by Iron Man's AI assistant, Jarvis gives [Claude Code](https://claude.ai/code) a voice. It uses [Kokoro](https://github.com/hexgrad/kokoro) — a high-quality neural TTS engine — to speak Claude's responses aloud, entirely offline with no API keys required.

## How it works

```
Claude Code response
        |
        v
  bun run tts        <- TypeScript CLI (Bun)
        |
        v
 kokoro_speak.py     <- Python: Kokoro model generates WAV audio
        |
        v
      mpv            <- Streams WAV to speakers
```

The TypeScript CLI handles input (stdin, file, or `--text`), spawns the Python script via `uv run`, and streams the resulting WAV to `mpv` for playback. If `mpv` is unavailable it falls back to macOS `say`.

## Getting started

### 1. Clone

```bash
git clone https://github.com/wesbragagt/jarvis.git
cd jarvis
```

### 2. Enter the dev environment

Requires [Nix](https://determinate.systems/nix-installer/) and [direnv](https://direnv.net). The `flake.nix` installs all prerequisites (Bun, uv, mpv, espeak-ng) and runs `bun install` + `uv sync` automatically.

```bash
direnv allow
```

> `uv sync` downloads Kokoro model weights (~300 MB) on first run. Subsequent runs load from cache.

### 3. Test it

```bash
echo "Hello, I am Jarvis" | bun run tts
```

### 4. Integrate with Claude Code

Install the `/tts` skill to control Jarvis from inside Claude Code:

```bash
mkdir -p ~/.claude/skills/tts
cp skills/tts/skill.json ~/.claude/skills/tts/
```

Then use `/tts on` inside Claude Code to enable TTS. Jarvis will speak every response automatically.

---

## CLI reference

```
USAGE
  bun run tts [OPTIONS]
  echo "text" | bun run tts

OPTIONS
  -t, --text <text>    Text to speak directly
  -f, --file <path>    Read text from a file
  -v, --voice <name>   Kokoro voice name (default: af_heart)
  -h, --help           Show help

ENVIRONMENT
  KOKORO_VOICE         Set a persistent default voice
```

### Examples

```bash
# From stdin
echo "Deployment complete" | bun run tts

# Inline text
bun run tts --text "Tests are passing"

# From file
bun run tts --file output.txt

# Different voice
bun run tts --voice am_adam --text "Hello"

# Set a persistent default voice
export KOKORO_VOICE=am_adam
echo "This will use Adam" | bun run tts
```

---

## Voices

### American English

| Voice | Gender | Quality |
|-------|--------|---------|
| `af_heart` | F | A (default) |
| `af_bella` | F | A- |
| `af_nicole` | F | B- |
| `af_sarah` | F | C+ |
| `af_aoede` | F | C+ |
| `af_kore` | F | C+ |
| `af_nova` | F | C+ |
| `af_sky` | F | C- |
| `af_alloy` | F | C |
| `af_jessica` | F | D |
| `am_puck` | M | C+ |
| `am_michael` | M | C+ |
| `am_fenrir` | M | C+ |
| `am_liam` | M | C |
| `am_echo` | M | D |
| `am_eric` | M | D |
| `am_onyx` | M | D |
| `am_adam` | M | F+ |
| `am_santa` | M | D- |

### British English

| Voice | Gender | Quality |
|-------|--------|---------|
| `bf_emma` | F | B- |
| `bf_isabella` | F | C |
| `bf_alice` | F | D |
| `bf_lily` | F | D |
| `bm_george` | M | B- |
| `bm_fable` | M | C |
| `bm_lewis` | M | C |
| `bm_daniel` | M | D |

### Other languages

| Voice(s) | Language |
|----------|----------|
| `jf_alpha`, `jf_gongitsune`, `jf_nezuko`, `jf_tebukuro`, `jm_kumo` | Japanese |
| `zf_xiaobei`, `zf_xiaoni`, `zf_xiaoxiao`, `zf_xiaoyi`, `zm_yunjian`, `zm_yunxi`, `zm_yunxia`, `zm_yunyang` | Mandarin Chinese |
| `ef_dora`, `em_alex`, `em_santa` | Spanish |
| `ff_siwis` | French |
| `hf_alpha`, `hf_beta`, `hm_omega`, `hm_psi` | Hindi |
| `if_sara`, `im_nicola` | Italian |
| `pf_dora`, `pm_alex`, `pm_santa` | Brazilian Portuguese |

---

## Project structure

```
jarvis/
├── src/
│   ├── index.ts           # CLI entry point
│   ├── types.ts           # Shared TypeScript types
│   ├── input.ts           # Input handler (stdin / file / --text)
│   ├── clients/
│   │   └── tts.ts         # TTSClient: spawns kokoro_speak.py via uv
│   └── audio/
│       └── player.ts      # AudioPlayer: streams WAV to mpv, falls back to say
│
├── scripts/
│   ├── kokoro_speak.py    # Python: text -> Kokoro -> WAV on stdout
│   ├── tts-state.sh       # Read/write ~/.jarvis-tts-state
│   └── tts-with-check.sh  # Run TTS only when state is enabled
│
├── skills/
│   └── tts/
│       └── skill.json     # Claude Code /tts slash command definition
│
├── pyproject.toml         # Python dependencies (managed by uv)
└── package.json           # Bun scripts and TypeScript dependencies
```

---

## Troubleshooting

**No audio output**
- Make sure direnv is active (`direnv allow` if not already done).
- Check system volume and output device.
- Test end-to-end: `echo "test" | bun run tts`

**`espeak-ng` not found warning**
- You're likely outside the direnv environment. Run `direnv reload`.

**First run is slow**
- Kokoro downloads model weights (~300 MB) on the first `uv sync`. After that, startup is fast.

**`nix: command not found`**
- Install [Determinate Nix](https://determinate.systems/nix-installer/): `curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install`

**TTS state is stuck**
- Check the state file: `cat ~/.jarvis-tts-state`
- Reset manually: `echo "enabled" > ~/.jarvis-tts-state`
