import os
import subprocess
import tempfile
import json
import re
from openai import OpenAI

class VideoProcessor:
    def __init__(self, fonts_dir):
        self.fonts_dir = os.path.abspath(fonts_dir)
        self.client = OpenAI()

    def _get_video_dimensions(self, video_path):
        try:
            cmd = [
                "ffprobe", "-v", "error",
                "-select_streams", "v:0",
                "-show_entries", "stream=width,height",
                "-of", "json",
                video_path
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            data = json.loads(result.stdout)
            width = int(data['streams'][0]['width'])
            height = int(data['streams'][0]['height'])
            return width, height
        except Exception as e:
            print(f"Error getting video dimensions: {e}")
            return 1080, 1920

    async def generate_captions_only(self, input_p, target_language="English"):
        print(f"Processing: {input_p} -> Target: {target_language}")
        try:
            audio_p = tempfile.mktemp(suffix=".mp3")
            subprocess.run(["ffmpeg", "-y", "-i", input_p, "-vn", "-ar", "16000", "-ac", "1", audio_p], check=True)

            with open(audio_p, "rb") as f:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=f,
                    response_format="verbose_json",
                    timestamp_granularities=["segment", "word"]
                )

            final_captions = []

            for seg in transcript.segments:
                original_text = getattr(seg, 'text', '').strip()
                start = getattr(seg, 'start', 0.0)
                end = getattr(seg, 'end', 0.0)

                if not original_text:
                    continue

                translated_text = original_text
                if target_language.lower() != "english":
                    try:
                        system_prompt = (
                            f"You are a professional subtitle translator specializing in {target_language}. "
                            f"Translate the following English text to {target_language}. "
                            "For regional Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Punjabi, Gujarati, Kannada, Malayalam, Odia, Urdu), "
                            "use natural, conversational language that matches the speaking style. "
                            "Keep translations concise and subtitle-friendly (max 2 lines). "
                            "Preserve the emotional tone and cultural context. "
                            "Return ONLY the translated text without quotes, explanations, or meta-commentary."
                        )

                        res = self.client.chat.completions.create(
                            model="gpt-4o",
                            messages=[
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": original_text}
                            ],
                            temperature=0.3
                        )
                        translated_text = res.choices[0].message.content.strip()
                        translated_text = translated_text.strip('"').strip("'")
                    except Exception as e:
                        print(f"GPT Translation Error: {e}")
                        translated_text = original_text

                words = translated_text.split()
                duration = end - start
                words_per_minute = (len(words) / duration) * 60 if duration > 0 else 0

                if words_per_minute > 180 or len(words) > 5:
                    words_per_caption = min(5, max(3, len(words) // 2))
                elif words_per_minute < 60 and len(words) == 1:
                    words_per_caption = 1
                else:
                    words_per_caption = min(3, len(words))

                if len(words) <= words_per_caption:
                    final_captions.append({
                        "id": str(getattr(seg, 'id', len(final_captions))),
                        "text": translated_text,
                        "start_time": start,
                        "end_time": end
                    })
                else:
                    time_per_word = duration / len(words)
                    for i in range(0, len(words), words_per_caption):
                        chunk = words[i:i + words_per_caption]
                        chunk_text = ' '.join(chunk)
                        chunk_start = start + (i * time_per_word)
                        chunk_end = start + ((i + len(chunk)) * time_per_word)

                        final_captions.append({
                            "id": str(len(final_captions)),
                            "text": chunk_text,
                            "start_time": chunk_start,
                            "end_time": min(chunk_end, end)
                        })

            if os.path.exists(audio_p):
                os.remove(audio_p)

            return {"success": True, "captions": final_captions}

        except Exception as e:
            print(f"Generation Error: {e}")
            return {"success": False, "error": str(e)}

    async def burn_only(self, input_p, output_p, captions, style):
        print(f"🎨 BURNING STYLES: {style}")
        try:
            width, height = self._get_video_dimensions(input_p)
            ass_path = self._create_inline_ass(captions, style, width, height)

            cmd = [
                "ffmpeg", "-y", "-i", input_p,
                "-vf", f"ass={ass_path}",
                "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                "-c:a", "aac", "-b:a", "192k",
                output_p
            ]

            print(f"🚀 Running FFmpeg with dimensions {width}x{height}...")
            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode != 0:
                print(f"FFmpeg stderr: {result.stderr}")
                raise Exception(f"FFmpeg failed: {result.stderr}")

            if os.path.exists(ass_path):
                os.remove(ass_path)

            return {"success": True}

        except Exception as e:
            print(f"Export Error: {e}")
            return {"success": False, "error": str(e)}

    def _hex_to_ass(self, hex_c, alpha=1.0):
        if not hex_c:
            return "&H00FFFFFF"
        hex_c = hex_c.lstrip('#')
        if len(hex_c) != 6:
            return "&H00FFFFFF"
        r, g, b = hex_c[:2], hex_c[2:4], hex_c[4:]
        a_val = int((1 - alpha) * 255)
        return f"&H{a_val:02X}{b.upper()}{g.upper()}{r.upper()}"

    def _fmt(self, s):
        h, m, sec = int(s // 3600), int((s % 3600) // 60), s % 60
        return f"{h}:{m:02d}:{sec:05.2f}"

    def _create_inline_ass(self, captions, style, width, height):
        ass_path = tempfile.mktemp(suffix=".ass")

        font_family = style.get('font_family', 'Arial')
        base_font_size = int(style.get('font_size', 24))

        scale_factor = min(width, height) / 540
        font_size = int(base_font_size * scale_factor * 1.5)

        text_color = self._hex_to_ass(style.get('text_color', '#FFFFFF'))

        has_bg = style.get('has_background', False)
        bg_opacity = float(style.get('background_opacity', 0.8))
        bg_hex = style.get('highlight_color', '#000000') or '#000000'
        bg_color = self._hex_to_ass(bg_hex, bg_opacity)

        pos_y = float(style.get('position_y', 15))
        y_position = int(height * (1 - pos_y / 100))

        x_center = width // 2

        if has_bg:
            border_style = "4"
            border = "8"
            shadow = "0"
            back_color = bg_color
            style_tags = f"\\fnArial\\fs{font_size}\\1c{text_color}\\3c{bg_color}\\4c{bg_color}\\bord{border}\\shad{shadow}"
        else:
            border_style = "1"
            border = "3"
            shadow = "2"
            outline_color = "&H80000000"
            back_color = "&H80000000"
            style_tags = f"\\fn{font_family}\\fs{font_size}\\1c{text_color}\\3c{outline_color}\\4c{back_color}\\bord{border}\\shad{shadow}"

        if style.get('has_animation', False):
            style_tags += r"\t(0,150,\fscx110\fscy110)\t(150,300,\fscx100\fscy100)"

        with open(ass_path, "w", encoding="utf-8") as f:
            f.write(f"""[Script Info]
ScriptType: v4.00+
PlayResX: {width}
PlayResY: {height}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_family},{font_size},{text_color},&H000000FF,{outline_color},{back_color},0,0,0,0,100,100,0,0,{border_style},{border},{shadow},2,10,10,20,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""")
            for c in captions:
                start = self._fmt(float(c['start_time']))
                end = self._fmt(float(c['end_time']))
                text = str(c['text']).replace('\n', ' ').replace('|', ' ')

                text = text.replace('{', '').replace('}', '')

                line = f"Dialogue: 0,{start},{end},Default,,0,0,0,,{{{style_tags}\\pos({x_center},{y_position})}}{text}\n"
                f.write(line)

        print(f"✅ ASS file created at {ass_path}")
        return ass_path
