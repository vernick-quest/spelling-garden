"use client";

import { useState } from "react";
import { speakWord } from "@/lib/elevenlabs/tts";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
}

const SAMPLE_WORDS = ["necessary", "beautiful", "definitely", "separate", "occurrence"];

export function DailyBloom({ userId }: Props) {
  const supabase = createClient();
  const [wordIndex, setWordIndex] = useState(0);
  const [input, setInput] = useState("");
  const [outcome, setOutcome] = useState<"idle" | "correct" | "incorrect">("idle");
  const [attempts, setAttempts] = useState(0);

  const currentWord = SAMPLE_WORDS[wordIndex % SAMPLE_WORDS.length];

  async function handleSubmit() {
    const isCorrect = input.trim().toLowerCase() === currentWord.toLowerCase();
    const isFirstTry = attempts === 0;
    setAttempts((a) => a + 1);

    if (isCorrect) {
      setOutcome("correct");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("spelling_progress") as any).upsert({
        user_id: userId,
        word: currentWord,
        word_list: "grade5-week1",
        attempts: attempts + 1,
        correct_first_try_count: isFirstTry ? 1 : 0,
        mastery_level: isFirstTry ? 2 : 1,
        last_practiced_at: new Date().toISOString(),
      }, { onConflict: "user_id,word" });
      setTimeout(() => {
        setWordIndex((i) => i + 1);
        setInput("");
        setOutcome("idle");
        setAttempts(0);
      }, 1200);
    } else {
      setOutcome("incorrect");
    }
  }

  const borderColor =
    outcome === "correct"
      ? "border-[var(--accent-green)]"
      : outcome === "incorrect"
        ? "border-red-500"
        : "border-[var(--panel-border)]";

  return (
    <div className="border-t border-[var(--panel-border)] bg-[var(--panel-bg)] px-6 py-4">
      <div className="flex items-center gap-6 max-w-2xl mx-auto">
        <div className="text-center shrink-0">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--accent-shimmer)] flex items-center justify-center text-xl">
            🎵
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {attempts === 0 ? "First try!" : `Attempt ${attempts}`}
          </p>
        </div>

        <div className="flex-1">
          <p className="text-xs text-[var(--accent-gold)] font-semibold uppercase tracking-widest mb-2">
            Daily Bloom
          </p>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setOutcome("idle"); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Spell the word..."
              className={`flex-1 rounded-lg border ${borderColor} bg-transparent px-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-shimmer)] transition-colors`}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => speakWord(currentWord)}
              className="flex items-center gap-1.5 rounded-full bg-cyan-900/50 border border-cyan-700 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-800/50 transition-colors"
            >
              🔊 Read Aloud
            </button>
            <button
              onClick={() => speakWord(`Use ${currentWord} in a sentence.`)}
              className="flex items-center gap-1.5 rounded-full bg-emerald-900/50 border border-emerald-700 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-800/50 transition-colors"
            >
              ▶ Play Sentence
            </button>
          </div>
        </div>

        <div className="text-center shrink-0">
          <p className="text-xs text-[var(--text-muted)] mb-1">Seed Energy Earned</p>
          <div className="flex gap-2 justify-center text-2xl">
            <span title="Water drops">💧</span>
            <span title="Standard seed">🌱</span>
          </div>
        </div>
      </div>
    </div>
  );
}
