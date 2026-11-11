import * as Speech from 'expo-speech';

/** Text-to-speech. Interruptible: a new utterance stops the previous one. */
export const tts = {
  speak(text: string) {
    if (!text?.trim()) return;
    Speech.stop();
    Speech.speak(text, { rate: 1.0, pitch: 1.0 });
  },
  stop() {
    Speech.stop();
  },
};
