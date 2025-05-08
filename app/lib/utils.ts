import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// @ts-ignore
import { TextToSpeech } from "@capacitor-community/text-to-speech";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function speakText(text: string, options = {}) {
  try {
    await TextToSpeech.speak({
      text,
      lang: "en-US",
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0,
      ...options,
    });
  } catch (error) {
    console.error("Error speaking text:", error);
  }
}

export async function stopSpeaking() {
  try {
    await TextToSpeech.stop();
  } catch (error) {
    console.error("Error stopping speech:", error);
  }
}

export function playAudio(url: string): HTMLAudioElement {
  const audio = new window.Audio(url);
  audio.play();
  return audio;
}
