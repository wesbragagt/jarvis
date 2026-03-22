#!/bin/bash
# TTS state management script

STATE_FILE="$HOME/.jarvis-tts-state"

case "$1" in
  enable)
    echo "enabled" > "$STATE_FILE"
    echo "✅ TTS enabled"
    ;;
  disable)
    echo "disabled" > "$STATE_FILE"
    echo "🔇 TTS disabled"
    ;;
  toggle)
    if [ -f "$STATE_FILE" ] && [ "$(cat "$STATE_FILE")" = "disabled" ]; then
      echo "enabled" > "$STATE_FILE"
      echo "✅ TTS enabled"
    else
      echo "disabled" > "$STATE_FILE"
      echo "🔇 TTS disabled"
    fi
    ;;
  status)
    if [ -f "$STATE_FILE" ] && [ "$(cat "$STATE_FILE")" = "disabled" ]; then
      echo "🔇 TTS is currently disabled"
    else
      echo "✅ TTS is currently enabled"
    fi
    ;;
  is-enabled)
    # Silent check, exits 0 if enabled, 1 if disabled
    if [ -f "$STATE_FILE" ] && [ "$(cat "$STATE_FILE")" = "disabled" ]; then
      exit 1
    else
      exit 0
    fi
    ;;
  *)
    echo "Usage: $0 {enable|disable|toggle|status|is-enabled}"
    exit 1
    ;;
esac
