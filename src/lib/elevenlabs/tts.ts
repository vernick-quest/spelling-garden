import { mockSpeak } from "./mock";

export interface TTSOptions {
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
}

export async function speakWord(word: string, options: TTSOptions = {}): Promise<void> {
  const isMock =
    process.env.NODE_ENV !== "production" ||
    !process.env.NEXT_PUBLIC_ELEVENLABS_CONFIGURED;

  if (isMock) {
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
