import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TranscriptionSegment {
  id: number;
  text: string;
  start: number;
  end: number;
}

interface WhisperResponse {
  text: string;
  segments?: TranscriptionSegment[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { videoUrl, audioUrl, language = "English", userId } = await req.json();

    if (!videoUrl && !audioUrl) {
      return new Response(
        JSON.stringify({ success: false, error: "Video or audio URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let mediaBlob: Blob;
    let fileName: string;

    if (audioUrl) {
      console.log(`Downloading audio from: ${audioUrl}`);
      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) {
        throw new Error(`Failed to download audio: ${audioResponse.status}`);
      }
      mediaBlob = await audioResponse.blob();
      fileName = "audio.mp3";
      console.log(`Audio size: ${mediaBlob.size} bytes`);
    } else {
      console.log(`Downloading video from: ${videoUrl}`);
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.status}`);
      }
      mediaBlob = await videoResponse.blob();
      fileName = "video.mp4";
      console.log(`Video size: ${mediaBlob.size} bytes`);
    }

    const maxSize = 25 * 1024 * 1024;
    if (mediaBlob.size > maxSize) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `File is too large (${Math.round(mediaBlob.size / 1024 / 1024)}MB). Maximum size is 25MB. Please use a shorter video or try again.`
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formData = new FormData();
    formData.append("file", mediaBlob, fileName);
    formData.append("model", "whisper-1");
    formData.append("response_format", "verbose_json");
    formData.append("timestamp_granularities[]", "segment");

    console.log("Sending to Whisper API...");
    const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error("Whisper API error:", whisperResponse.status, errorText);
      let errorMessage = `Whisper API error: ${whisperResponse.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        if (errorText) {
          errorMessage = errorText.slice(0, 200);
        }
      }
      throw new Error(errorMessage);
    }

    const transcription: WhisperResponse = await whisperResponse.json();
    console.log("Transcription received");

    let captions: Array<{id: string; text: string; start_time: number; end_time: number}> = [];

    if (transcription.segments && transcription.segments.length > 0) {
      for (const seg of transcription.segments) {
        let text = seg.text.trim();

        if (language.toLowerCase() !== "english" && text) {
          try {
            const translationResponse = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${openaiApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                  {
                    role: "system",
                    content: `You are a professional subtitle translator. Translate the following English text to ${language}. Return ONLY the translated text without quotes or explanations.`
                  },
                  {
                    role: "user",
                    content: text
                  }
                ],
                temperature: 0.3
              }),
            });

            if (translationResponse.ok) {
              const translationData = await translationResponse.json();
              text = translationData.choices[0]?.message?.content?.trim() || text;
            }
          } catch (e) {
            console.error("Translation error:", e);
          }
        }

        const words = text.split(/\s+/);
        const duration = seg.end - seg.start;

        if (words.length <= 5) {
          captions.push({
            id: `${Date.now()}-${seg.id}`,
            text: text,
            start_time: seg.start,
            end_time: seg.end
          });
        } else {
          const chunks: string[][] = [];
          for (let i = 0; i < words.length; i += 4) {
            chunks.push(words.slice(i, i + 4));
          }

          const chunkDuration = duration / chunks.length;
          chunks.forEach((chunk, idx) => {
            captions.push({
              id: `${Date.now()}-${seg.id}-${idx}`,
              text: chunk.join(" "),
              start_time: seg.start + (idx * chunkDuration),
              end_time: seg.start + ((idx + 1) * chunkDuration)
            });
          });
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

    return new Response(
      JSON.stringify({
        success: true,
        captions,
        raw_text: transcription.text
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to transcribe video"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
