# Claude Code Skills for JARVIS TTS

This directory contains Claude Code skills for controlling the TTS feature.

## Available Skills

### `/tts-toggle`
Toggle TTS on/off. Flips the current state.

```bash
/tts-toggle
```

### `/tts-on`
Enable TTS for all Claude responses.

```bash
/tts-on
```

### `/tts-off`
Disable TTS. Claude responses will be silent.

```bash
/tts-off
```

### `/tts-status`
Check whether TTS is currently enabled or disabled.

```bash
/tts-status
```

## How It Works

1. Skills write to a state file at `~/.jarvis-tts-state`
2. The wrapper script `scripts/tts-with-check.sh` checks this state before running TTS
3. Use the keybinding with the wrapper to respect the toggle state

## Recommended Setup

Add this keybinding to `~/.claude/keybindings.json`:

```json
{
  "keybindings": [
    {
      "key": "ctrl+shift+s",
      "command": "cd /Users/wesbragagt/dev/jarvis && ./scripts/tts-with-check.sh",
      "description": "Speak last response (if TTS enabled)"
    }
  ]
}
```

Then control TTS with:
- `/tts-on` when you want audio
- `/tts-off` when you want silence
- `/tts-toggle` to flip the state
- Press `Ctrl+Shift+S` to speak (only works if enabled)

## State File Location

`~/.jarvis-tts-state` - Contains either "enabled" or "disabled"
