import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    // Fetch the audio/video file
    const response = await fetch(file_url);
    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch video file' }, { status: 400 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'audio/mp4' });
    const file = new File([blob], 'audio.mp4', { type: 'audio/mp4' });

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: file,
      language: "en",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"]
    });

    // Extract segments
    const segments = transcription.segments?.map(seg => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim()
    })) || [];

    return Response.json({
      success: true,
      text: transcription.text,
      segments: segments,
      language: transcription.language
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});