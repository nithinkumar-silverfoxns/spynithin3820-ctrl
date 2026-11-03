#!/usr/bin/env bash
# Narration for THE DIGITAL SHADOW: neural TTS (Piper, voice en_US-ryan-high) → deeper, broadcast-style chain.
# To use a human narrator instead, record the nine lines below as vo/l1.wav … vo/l9.wav and skip this script.
#   VOICE=/path/to/en_US-ryan-high.onnx ./voiceover.sh
set -euo pipefail
cd "$(dirname "$0")"; mkdir -p vo .vo-raw
VOICE=${VOICE:-voices/en_US-ryan-high.onnx}
i=0
while IFS= read -r line; do
  i=$((i+1))
  echo "$line" | python3 -m piper -m "$VOICE" -f ".vo-raw/l$i.wav" --length-scale 1.12 --sentence-silence 0.35 >/dev/null 2>&1
  ffmpeg -loglevel error -y -i ".vo-raw/l$i.wav" -af "aresample=48000,rubberband=pitch=0.94,highpass=f=70,equalizer=f=120:t=q:w=1:g=3,equalizer=f=330:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.4:g=2,deesser=i=0.4,acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=2" -ac 1 "vo/l$i.wav"
done <<'LINES'
The digital world never stops evolving. And neither do its threats.
In a world where everything is connected, security is no longer optional.
In a world of invisible threats, intelligence makes all the difference.
Introducing Silver Fox N S.
A cybersecurity and digital intelligence company, helping organizations understand threats, identify risks, and strengthen their digital defenses.
Through responsible security practices and innovative technology, we help businesses build with confidence.
See the threat.
Understand the risk.
Stay ahead of the future.
LINES
rm -rf .vo-raw
echo "narration written to vo/"
