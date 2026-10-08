export async function synthesizeSpeech(text: string) {
  const url = process.env.TTS_API_URL;
  const key = process.env.TTS_API_KEY;
  const voice = process.env.TTS_VOICE_ID;
  if (!url || !key || !voice) {
    throw new Error("TTS is not configured. Set TTS_API_URL, TTS_API_KEY and TTS_VOICE_ID.");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {"Content-Type":"application/json", "Authorization": `Bearer ${key}`},
    body: JSON.stringify({ text, voice_id: voice })
  });
  if (!response.ok) throw new Error(`TTS failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
