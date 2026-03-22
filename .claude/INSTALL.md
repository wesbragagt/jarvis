# TTS Skills Installation

## ✅ Skills Installed

The following skills have been installed:

- **`/tts-on`** - Enable TTS
- **`/tts-off`** - Disable TTS
- **`/tts-toggle`** - Toggle TTS
- **`/tts-status`** - Check status

## Installation Locations

Skills are available in **two** locations:

1. **Local (project)**: `./.claude/skills/tts-*`
2. **Global (symlinked)**: `~/.claude/skills/tts-*` → project

## How to Use

### Option 1: Try the skills now

```
/tts-status
/tts-on
/tts-toggle
```

### Option 2: If skills don't appear, restart Claude Code

Skills should auto-load from `.claude/skills/` but may require:
- Restart Claude Code
- Reload window
- Or wait a moment for skills to be picked up

### Option 3: Test manually

```bash
cd /Users/wesbragadt/dev/jarvis
./scripts/tts-state.sh status
./scripts/tts-state.sh toggle
./scripts/tts-state.sh enable
```

## Verification

Check skills are symlinked correctly:

```bash
ls -la ~/.claude/skills/tts-*
```

Should show:
```
tts-off -> /Users/wesbragagt/dev/jarvis/.claude/skills/tts-off
tts-on -> /Users/wesbragagt/dev/jarvis/.claude/skills/tts-on
tts-status -> /Users/wesbragagt/dev/jarvis/.claude/skills/tts-status
tts-toggle -> /Users/wesbragagt/dev/jarvis/.claude/skills/tts-toggle
```

## Keybinding Setup

Add to `~/.claude/keybindings.json`:

```json
{
  "keybindings": [
    {
      "key": "ctrl+shift+s",
      "command": "cd /Users/wesbragagt/dev/jarvis && ./scripts/tts-with-check.sh",
      "description": "Speak Claude's response (if TTS enabled)"
    }
  ]
}
```

## Workflow

1. **Enable TTS**: `/tts-on`
2. **Get a response from Claude**
3. **Press `Ctrl+Shift+S`** to hear it spoken
4. **Disable when done**: `/tts-off`

Or use `/tts-toggle` to flip back and forth!

## Troubleshooting

**Skills not showing up?**
- Restart Claude Code
- Check skills exist: `cat ~/.claude/skills/tts-status/skill.json`
- Run manually: `./scripts/tts-state.sh status`

**TTS not working?**
- Check status: `./scripts/tts-state.sh status`
- Enable it: `./scripts/tts-state.sh enable`
- Test: `echo "test" | bun run tts`
