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

    const { segments, target_language = 'hindi' } = await req.json();

    if (!segments || !Array.isArray(segments)) {
      return Response.json({ error: 'segments array is required' }, { status: 400 });
    }

    const translatedSegments = [];

    // Batch translate for efficiency (groups of 5)
    const batchSize = 5;
    for (let i = 0; i < segments.length; i += batchSize) {
      const batch = segments.slice(i, i + batchSize);
      
      const batchPrompt = batch.map((seg, idx) => `${idx + 1}. "${seg.text}"`).join('\n');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert Hindi translator for viral social media content. 
Translate English text to Hindi. Make translations:
- SHORT and punchy (max 8-10 words each)
- High-energy and engaging
- Use simple, conversational Hindi (Hinglish OK for impact)
- Perfect for Reels/Shorts captions

Reply with ONLY numbered translations, one per line. Example:
1. हिंदी ट्रांसलेशन
2. दूसरा ट्रांसलेशन`
          },
          {
            role: "user",
            content: `Translate these to ${target_language}:\n${batchPrompt}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const translations = response.choices[0].message.content.trim().split('\n');
      
      batch.forEach((seg, idx) => {
        let hindiText = translations[idx] || seg.text;
        // Remove numbering if present
        hindiText = hindiText.replace(/^\d+\.\s*/, '').trim();
        
        translatedSegments.push({
          start: seg.start,
          end: seg.end,
          text: hindiText,
          original: seg.text
        });
      });
    }

    return Response.json({
      success: true,
      segments: translatedSegments,
      count: translatedSegments.length
    });

  } catch (error) {
    console.error('Translation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});