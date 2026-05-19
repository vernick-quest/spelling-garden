import { mockSpeak } from "./mock";

export interface TTSOptions {
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
}

export async function speakWord(word: string, options: TTSOptions = {}): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    mockSpeak(word);
    return;
  }

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: word, ...options }),
    });

    if (!res.ok) throw new Error(`TTS request failed: ${res.status}`);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    await audio.play();
  } catch (err) {
    console.warn("ElevenLabs TTS failed, falling back to mock:", err);
    mockSpeak(word);
  }
}
