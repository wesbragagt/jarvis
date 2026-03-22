#!/bin/bash
# Wrapper script that checks TTS state before running

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Check if TTS is enabled
"$SCRIPT_DIR/tts-state.sh" is-enabled

if [ $? -eq 0 ]; then
  # TTS is enabled, run it
  cd "$PROJECT_DIR" && bun run tts "$@"
else
  # TTS is disabled, exit silently
  exit 0
fi
