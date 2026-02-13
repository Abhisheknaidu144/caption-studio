import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { audioUrl, language = "English", userId } = await req.json();

    if (!audioUrl) {
      return jsonResponse({ success: false, error: "Audio URL is required" }, 400);
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return jsonResponse({ success: false, error: "OpenAI API key not configured" }, 500);
    }

    console.log(`Downloading audio from: ${audioUrl}`);
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status}`);
    }

    const audioArrayBuffer = await audioResponse.arrayBuffer();
    const audioSize = audioArrayBuffer.byteLength;
    console.log(`Audio downloaded: ${audioSize} bytes`);

    const maxSize = 25 * 1024 * 1024;
    if (audioSize > maxSize) {
      return jsonResponse({
        success: false,
        error: `Audio file is too large (${Math.round(audioSize / 1024 / 1024)}MB). Maximum is 25MB.`
      }, 400);
    }

    const audioBlob = new Blob([audioArrayBuffer], { type: "audio/wav" });
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");
    formData.append("model", "whisper-1");
    formData.append("response_format", "verbose_json");
    formData.append("timestamp_granularities[]", "word");
    formData.append("timestamp_granularities[]", "segment");

    console.log(`Sending WAV audio to Whisper: size=${audioSize}`);
    const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiApiKey}` },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error("Whisper error:", whisperResponse.status, errorText);
      let errorMessage = `Whisper API error: ${whisperResponse.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) errorMessage = errorJson.error.message;
      } catch (_) { /* use default */ }
      throw new Error(errorMessage);
    }

    const transcription = await whisperResponse.json();
    console.log(`Transcription received: ${transcription.segments?.length || 0} segments`);

    const captions: Array<{id: string; text: string; start_time: number; end_time: number}> = [];

    if (transcription.words && transcription.words.length > 0) {
      const words = transcription.words;
      const wordsPerCaption = 3;

      for (let i = 0; i < words.length; i += wordsPerCaption) {
        const captionWords = words.slice(i, i + wordsPerCaption);
        if (captionWords.length === 0) continue;

        let captionText = captionWords.map((w: any) => w.word).join(" ");
        const captionStart = captionWords[0].start;
        const captionEnd = captionWords[captionWords.length - 1].end;

        if (language.toLowerCase() !== "english") {
          try {
            const translationRes = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${openaiApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                  {
                    role: "system",
                    content: `You are a professional subtitle translator specializing in ${language}. Translate the following English text to ${language}. For regional Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Punjabi, Gujarati, Kannada, Malayalam, Odia, Urdu), use natural, conversational language that matches the speaking style. Keep translations concise and subtitle-friendly (max 2 lines). Preserve the emotional tone and cultural context. Return ONLY the translated text without quotes, explanations, or meta-commentary.`
                  },
                  { role: "user", content: captionText }
                ],
                temperature: 0.3
              }),
            });

            if (translationRes.ok) {
              const translationData = await translationRes.json();
              const translated = translationData.choices?.[0]?.message?.content?.trim();
              if (translated) {
                captionText = translated.replace(/^["']|["']$/g, "");
              }
            }
          } catch (e) {
            console.error("Translation error:", e);
          }
        }

        captions.push({
          id: `${Date.now()}-${i}`,
          text: captionText.trim(),
          start_time: captionStart,
          end_time: captionEnd
        });
      }
    } else if (transcription.segments && transcription.segments.length > 0) {
      for (const seg of transcription.segments) {
        let text = (seg.text || "").trim();
        if (!text) continue;

        const start: number = seg.start || 0;
        const end: number = seg.end || 0;

        if (language.toLowerCase() !== "english") {
          try {
            const translationRes = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${openaiApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                  {
                    role: "system",
                    content: `You are a professional subtitle translator specializing in ${language}. Translate the following English text to ${language}. For regional Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Punjabi, Gujarati, Kannada, Malayalam, Odia, Urdu), use natural, conversational language that matches the speaking style. Keep translations concise and subtitle-friendly (max 2 lines). Preserve the emotional tone and cultural context. Return ONLY the translated text without quotes, explanations, or meta-commentary.`
                  },
                  { role: "user", content: text }
                ],
                temperature: 0.3
              }),
            });

            if (translationRes.ok) {
              const translationData = await translationRes.json();
              const translated = translationData.choices?.[0]?.message?.content?.trim();
              if (translated) {
                text = translated.replace(/^["']|["']$/g, "");
              }
            }
          } catch (e) {
            console.error("Translation error:", e);
          }
        }

        const words = text.split(/\s+/);
        const duration = end - start;
        const wordsPerCaption = Math.min(4, Math.max(2, Math.ceil(words.length / 2)));

        if (words.length <= wordsPerCaption) {
          captions.push({
            id: `${Date.now()}-${seg.id || captions.length}`,
            text,
            start_time: start,
            end_time: end
          });
        } else {
          const timePerWord = duration / words.length;
          for (let i = 0; i < words.length; i += wordsPerCaption) {
            const chunk = words.slice(i, i + wordsPerCaption);
            const chunkStart = start + (i * timePerWord);
            const chunkEnd = start + ((i + chunk.length) * timePerWord);
            captions.push({
              id: `${Date.now()}-${seg.id || captions.length}-${i}`,
              text: chunk.join(" "),
              start_time: chunkStart,
              end_time: Math.min(chunkEnd, end)
            });
          }
        }
      }
    } else if (transcription.text) {
      captions.push({
        id: `${Date.now()}-0`,
        text: transcription.text,
        start_time: 0,
        end_time: 10
      });
    }

    return jsonResponse({
      success: true,
      captions,
      raw_text: transcription.text
    });

  } catch (error) {
    console.error("Error:", error);
    return jsonResponse({
      success: false,
      error: error.message || "Failed to transcribe audio"
    }, 500);
  }
});
