import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel — clear, neutral

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { text, voiceId, stability = 0.5, similarityBoost = 0.75 } = body;

  if (!text || typeof text !== "string" || text.length > 200) {
    return NextResponse.json({ error: "Invalid text" }, { status: 400 });
  }

  const voice = voiceId ?? process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID;

  const elRes = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voice}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: { stability, similarity_boost: similarityBoost },
    }),
  });

  if (!elRes.ok) {
    const msg = await elRes.text();
    return NextResponse.json({ error: msg }, { status: elRes.status });
  }

  const audioBuffer = await elRes.arrayBuffer();
  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
