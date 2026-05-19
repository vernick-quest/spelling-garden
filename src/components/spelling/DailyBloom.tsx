"use client";

import { useState, useEffect, useRef } from "react";
import { speakWord } from "@/lib/elevenlabs/tts";
import { createClient } from "@/lib/supabase/client";
import { useGameStore } from "@/store/game";
import { WORD_LISTS, TRAIT_FLOWER_HINT } from "@/lib/words";

interface Props {
  userId: string;
}

export function DailyBloom({ userId }: Props) {
  const supabase = createClient();
  const [wordIndex, setWordIndex] = useState(0);
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [traitHint, setTraitHint] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const grade = useGameStore((s) => s.grade);
  const { earnPollen, earnWater, showReward, clearReward, reward } = useGameStore();

  const wordList = WORD_LISTS[grade];
  const currentEntry = wordList[wordIndex % wordList.length];
  const currentWord = currentEntry.word;

  // Auto-play word when it changes
  useEffect(() => {
    setTraitHint(null);
    const timer = setTimeout(() => speakWord(currentWord), 600);
    return () => clearTimeout(timer);
  }, [wordIndex, grade]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset index when grade changes so we start at the beginning
  useEffect(() => {
    setWordIndex(0);
    setInput("");
    setAttempts(0);
  }, [grade]);

  async function handleSubmit() {
    if (!input.trim()) return;
    const isCorrect = input.trim().toLowerCase() === currentWord.toLowerCase();
    const isFirstTry = attempts === 0;

    if (isCorrect) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const pollenEarned = currentEntry.pollenReward;

      if (isFirstTry) {
        earnPollen(pollenEarned);
        earnWater(1);
        showReward({ text: `Flawless! +${pollenEarned} pollen & +1 drop!`, emoji: "✨", shimmer: true });
        await db.from("inventory").update({
          pollen: useGameStore.getState().pollen,
          water_drops: useGameStore.getState().waterDrops,
        }).eq("user_id", userId);
      } else {
        earnPollen(pollenEarned);
        showReward({ text: `Well done! +${pollenEarned} pollen!`, emoji: "🌱", shimmer: false });
        await db.from("inventory").update({
          pollen: useGameStore.getState().pollen,
        }).eq("user_id", userId);
      }

      await db.from("spelling_progress").upsert(
        { user_id: userId, word: currentWord,
          word_list: `grade${grade}`, attempts: attempts + 1,
          correct_first_try_count: isFirstTry ? 1 : 0,
          mastery_level: isFirstTry ? 3 : 2,
          last_practiced_at: new Date().toISOString() },
        { onConflict: "user_id,word" }
      );

      // Show the secret trait hint briefly
      const hint = TRAIT_FLOWER_HINT[currentEntry.trait];
      if (hint) setTraitHint(hint);

      setTimeout(clearReward, 2000);
      setTimeout(() => {
        setWordIndex((i) => i + 1);
        setInput("");
        setAttempts(0);
        setTraitHint(null);
        inputRef.current?.focus();
      }, 1800);

    } else {
      setAttempts((a) => a + 1);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => speakWord(currentWord), 300);
    }
  }

  const borderColor = shake
    ? "border-red-500"
    : "border-[var(--panel-border)]";

  return (
    <div className="relative border-t border-[var(--panel-border)] bg-[var(--panel-bg)] px-6 py-4">

      {/* Reward overlay */}
      {reward && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          style={{ animation: "rewardFadeUp 2s ease-out forwards" }}
        >
          <div className={`flex flex-col items-center gap-1 rounded-2xl px-8 py-4 ${reward.shimmer ? "bg-violet-900/80 border border-violet-400" : "bg-emerald-900/80 border border-emerald-400"}`}>
            <span style={{ fontSize: 40 }}>{reward.emoji}</span>
            <span className={`text-sm font-bold ${reward.shimmer ? "text-violet-200" : "text-emerald-200"}`}>
              {reward.text}
            </span>
            {traitHint && (
              <span className="text-xs text-[var(--text-muted)] mt-1 italic">
                🌿 {traitHint}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-6 max-w-2xl mx-auto">

        {/* Attempt + reward indicator */}
        <div className="text-center shrink-0">
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-colors ${attempts === 0 ? "border-[var(--accent-shimmer)]" : "border-amber-500"}`}>
            {attempts === 0 ? "🌟" : "🔄"}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {attempts === 0 ? `+${currentEntry.pollenReward}🌿` : `Try ${attempts + 1}`}
          </p>
        </div>

        {/* Input */}
        <div className="flex-1">
          <p className="text-xs text-[var(--accent-gold)] font-semibold uppercase tracking-widest mb-2">
            Daily Bloom — Listen &amp; Spell
          </p>
          <div className="flex gap-2 mb-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Type the word and press Enter..."
              className={`flex-1 rounded-lg border ${borderColor} bg-transparent px-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-shimmer)] transition-colors`}
              style={{ animation: shake ? "shake 0.4s ease-in-out" : undefined }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              onClick={handleSubmit}
              className="rounded-lg bg-[var(--accent-shimmer)]/20 border border-[var(--accent-shimmer)] px-4 py-2 text-sm text-[var(--accent-shimmer)] hover:bg-[var(--accent-shimmer)]/30 transition-colors"
            >
              Check
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => speakWord(currentWord)}
              className="flex items-center gap-1.5 rounded-full bg-cyan-900/50 border border-cyan-700 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-800/50 transition-colors"
            >
              🔊 Read Aloud
            </button>
            <button
              onClick={() => speakWord(`Here is ${currentWord} in a sentence.`)}
              className="flex items-center gap-1.5 rounded-full bg-emerald-900/50 border border-emerald-700 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-800/50 transition-colors"
            >
              ▶ Play Sentence
            </button>
          </div>
        </div>

        {/* Live currency */}
        <div className="text-center shrink-0 flex flex-col gap-2">
          <CurrencyBadge emoji="🌿" label="Pollen" />
          <CurrencyBadge emoji="💧" label="Drops" />
        </div>
      </div>
    </div>
  );
}

function CurrencyBadge({ emoji, label }: { emoji: string; label: string }) {
  const value = useGameStore((s) => label === "Pollen" ? s.pollen : s.waterDrops);
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-[var(--panel-border)] bg-[var(--garden-bg)] px-3 py-1">
      <span>{emoji}</span>
      <span className="text-sm font-bold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}
