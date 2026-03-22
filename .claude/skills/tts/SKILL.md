Manage text-to-speech using Kokoro.

Determine the action from the user's request (on, off, toggle, or status):

- on:     bun run tts:on
- off:    bun run tts:off
- toggle: bun run tts:toggle
- status: bun run tts:status

After running the command, report the current TTS state to the user.

For the rest of this conversation, apply the state:
- ENABLED: Before each text response, run `echo "<your response>" | bun run tts` via Bash. Strip markdown formatting, code blocks, and bullet symbols before speaking. Keep the spoken text concise.
- DISABLED: Do not run any bun run tts commands. Respond with text only.

Speak the confirmation message itself if TTS was just enabled.
