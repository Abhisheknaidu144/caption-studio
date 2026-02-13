import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Video, FileText, Copy, Check, FileJson, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExportPanel({ open, onClose, captions, videoUrl, captionStyle }) {
  const [copied, setCopied] = useState(false);
  const [exportingVideo, setExportingVideo] = useState(null);

  const generateSRT = () => {
    if (!captions || captions.length === 0) return '';
    return captions.filter(cap => cap && cap.text).map((caption, index) => {
      const formatTime = (seconds) => {
        const hrs = Math.floor((seconds || 0) / 3600);
        const mins = Math.floor(((seconds || 0) % 3600) / 60);
        const secs = Math.floor((seconds || 0) % 60);
        const ms = Math.floor(((seconds || 0) % 1) * 1000);
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
      };
      return `${index + 1}\n${formatTime(caption.start_time)} --> ${formatTime(caption.end_time)}\n${caption.text}\n`;
    }).join('\n');
  };

  const generatePlainText = () => {
    if (!captions || captions.length === 0) return '';
    return captions.filter(cap => cap && cap.text).map(c => c.text).join('\n');
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSRT = () => {
    const srt = generateSRT();
    downloadFile(srt, 'captions.srt', 'text/plain');
  };

  const handleDownloadText = () => {
    const text = generatePlainText();
    downloadFile(text, 'captions.txt', 'text/plain');
  };

  const handleCopyText = async () => {
    const text = generatePlainText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportVideo = async (quality) => {
    setExportingVideo(quality);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/process-export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          videoUrl,
          captions,
          captionStyle,
          quality
        })
      });

      const data = await res.json();
      if (data.success && data.exportUrl) {
        const a = document.createElement('a');
        a.href = data.exportUrl;
        a.download = `captions_${quality}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert(data.error || 'Export failed. Video export with burned-in captions requires server-side FFmpeg processing.');
      }
    } catch (err) {
      alert('Video export is not yet available. Download the SRT file and use it in your video editor.');
    } finally {
      setExportingVideo(null);
    }
  };

  const exportOptions = [
    {
      icon: Video,
      title: 'Export Video (1080p)',
      description: 'High quality MP4 render',
      action: () => handleExportVideo('1080p'),
      gradient: 'from-orange-500 to-red-500',
      loading: exportingVideo === '1080p'
    },
    {
      icon: Video,
      title: 'Export Video (720p)',
      description: 'Standard HD MP4 render',
      action: () => handleExportVideo('720p'),
      gradient: 'from-blue-500 to-cyan-500',
      loading: exportingVideo === '720p'
    },
    {
      icon: FileText,
      title: 'SRT File',
      description: 'Standard subtitle format',
      action: handleDownloadSRT,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: FileJson,
      title: 'Plain Text',
      description: 'Just the caption text',
      action: handleDownloadText,
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      icon: copied ? Check : Copy,
      title: copied ? 'Copied!' : 'Copy to Clipboard',
      description: 'Quick paste anywhere',
      action: handleCopyText,
      gradient: 'from-sky-500 to-blue-500'
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-zinc-900 border-white/10 text-white w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold text-white">
            Export Captions
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-3">
          {exportOptions.map((option, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={option.action}
              disabled={option.loading}
              className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center gap-4 group disabled:opacity-50"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.gradient} p-0.5 shrink-0`}>
                <div className="w-full h-full rounded-xl bg-zinc-900 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                  {option.loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <option.icon className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{option.title}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Coming Soon</h4>
          <div className="space-y-3">
            {['CapCut Export', 'Premiere Pro Export', 'Direct Upload'].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 opacity-50"
              >
                <Sparkles className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
