export function mockSpeak(word: string): void {
  if (typeof window === "undefined") return;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.75;
  utterance.pitch = 1.0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
