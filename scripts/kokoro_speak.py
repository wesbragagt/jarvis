#!/usr/bin/env python3
import sys
import argparse
import io
import numpy as np
import soundfile as sf
from kokoro import KPipeline

DEFAULT_VOICE = 'af_heart'

def main():
    parser = argparse.ArgumentParser(description='Kokoro TTS - reads text from stdin, writes WAV to stdout')
    parser.add_argument('--voice', default=DEFAULT_VOICE, help='Kokoro voice name (default: af_heart)')
    args = parser.parse_args()

    text = sys.stdin.read().strip()
    if not text:
        sys.exit(1)

    pipeline = KPipeline(lang_code='a')

    chunks = []
    for _, _, audio in pipeline(text, voice=args.voice, speed=1.0):
        chunks.append(audio)

    if not chunks:
        sys.stderr.write('No audio generated\n')
        sys.exit(1)

    combined = np.concatenate(chunks)
    buf = io.BytesIO()
    sf.write(buf, combined, 24000, format='WAV')
    buf.seek(0)
    sys.stdout.buffer.write(buf.read())

if __name__ == '__main__':
    main()
