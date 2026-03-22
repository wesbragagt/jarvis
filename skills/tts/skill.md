Manage the Jarvis TTS (text-to-speech) state. Resolve the project root from the skill symlink, then run the appropriate script.

## Resolving the project root

The skill directory is symlinked: `~/.claude/skills/tts` -> `<project>/skills/tts`.
Resolve the project root with:
```bash
PROJECT_ROOT=$(dirname $(dirname $(readlink -f ~/.claude/skills/tts)))
```

## Commands

When the user invokes `/tts <subcommand>`, run:

```bash
PROJECT_ROOT=$(dirname $(dirname $(readlink -f ~/.claude/skills/tts)))
"$PROJECT_ROOT/scripts/tts-state.sh" <subcommand>
```

Supported subcommands: `on` (alias for `enable`), `off` (alias for `disable`), `toggle`, `status`.

Map `on` → `enable` and `off` → `disable` before passing to the script.

After running the command, report the output to the user.

## Auto-speak on response

When TTS is enabled, append the following to the stop hook so every Claude response is spoken:

```bash
PROJECT_ROOT=$(dirname $(dirname $(readlink -f ~/.claude/skills/tts)))
"$PROJECT_ROOT/scripts/tts-with-check.sh"
```

Do not re-add the hook if it already exists.
