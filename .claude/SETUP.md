# JARVIS TTS - Claude Code Setup Guide

## Quick Setup

1. **Add the keybinding** to `~/.claude/keybindings.json`:

```json
{
  "keybindings": [
    {
      "key": "ctrl+shift+s",
      "command": "./scripts/tts-with-check.sh",
      "description": "Speak Claude's response (if TTS enabled)"
    }
  ]
}
```

2. **Enable TTS** in Claude Code:
```
/tts-on
```

3. **Test it**: Press `Ctrl+Shift+S` after Claude responds

## Skills Available

| Skill | Description |
|-------|-------------|
| `/tts-on` | Enable TTS |
| `/tts-off` | Disable TTS |
| `/tts-toggle` | Toggle TTS on/off |
| `/tts-status` | Check if enabled |

## How It Works

```
┌─────────────────┐
│ Claude responds │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ User presses Ctrl+Shift+S │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────┐
│ Check TTS state file │
└────────┬─────────────┘
         │
    ┌────┴────┐
    │ Enabled? │
    └─┬─────┬─┘
      │     │
     Yes   No
      │     │
      │     └──> Exit silently
      │
      ▼
┌──────────────┐
│  Run TTS     │
│  • Kokoro    │
└──────────────┘
```

## State Management

State stored in: `~/.jarvis-tts-state`

The wrapper script `scripts/tts-with-check.sh`:
1. Checks the state file
2. If enabled → runs TTS
3. If disabled → exits silently

## Customization

### Change Voice

```bash
# Set default in .env
KOKORO_VOICE=am_adam

# Or use --voice flag
bun run tts --voice am_adam --text "Hello"
```

### Auto-enable on startup

Add to your shell profile (`~/.zshrc` or `~/.bashrc`):
```bash
# Enable JARVIS TTS on terminal startup
/Users/wesbragagt/dev/jarvis/scripts/tts-state.sh enable > /dev/null 2>&1
```

## Troubleshooting

**Skills not showing up?**
- Make sure you're in the jarvis project directory
- Claude Code loads skills from `./.claude/skills/`

**TTS not running?**
- Check status: `/tts-status`
- Enable it: `/tts-on`
- Test directly: `echo "test" | bun run tts`

**Want to change keybinding?**
- Edit `~/.claude/keybindings.json`
- Popular alternatives: `ctrl+shift+v`, `ctrl+s`, `cmd+shift+s`
