import React, { useState, useRef, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Video, FileText, Copy, Check, FileJson, Sparkles, Download, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExportPanel({ open, onClose, captions, videoUrl, captionStyle, fileId, userId, onCreditsUpdate }) {
  const [copied, setCopied] = useState(false);
  const [exportingVideo, setExportingVideo] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState('');

  const generateSRT = () => {
    if (!captions || captions.length === 0) return '';
    return captions.filter(cap => cap && cap.text && !cap.isTextElement).map((caption, index) => {
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

  const generateVTT = () => {
    if (!captions || captions.length === 0) return '';
    let vtt = 'WEBVTT\n\n';
    captions.filter(cap => cap && cap.text && !cap.isTextElement).forEach((caption, index) => {
      const formatTime = (seconds) => {
        const hrs = Math.floor((seconds || 0) / 3600);
        const mins = Math.floor(((seconds || 0) % 3600) / 60);
        const secs = Math.floor((seconds || 0) % 60);
        const ms = Math.floor(((seconds || 0) % 1) * 1000);
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
      };
      vtt += `${index + 1}\n${formatTime(caption.start_time)} --> ${formatTime(caption.end_time)}\n${caption.text}\n\n`;
    });
    return vtt;
  };

  const generatePlainText = () => {
    if (!captions || captions.length === 0) return '';
    return captions.filter(cap => cap && cap.text && !cap.isTextElement).map(c => c.text).join('\n');
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

  const handleDownloadVTT = () => {
    const vtt = generateVTT();
    downloadFile(vtt, 'captions.vtt', 'text/vtt');
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
    if (!videoUrl || !fileId || !userId) {
      setExportError('Missing video data. Please upload a video first.');
      return;
    }

    setExportingVideo(quality);
    setExportError('');
    setExportProgress(10);

    try {
      const backendUrl = 'http://localhost:8000';

      setExportProgress(20);
      const exportRes = await fetch(`${backendUrl}/api/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: fileId.split('/').pop()?.split('-')[0] || fileId,
          captions: captions.filter(c => c && c.text && !c.isTextElement).map(c => ({
            id: c.id,
            text: c.text,
            start_time: c.start_time,
            end_time: c.end_time
          })),
          style: captionStyle,
          user_id: userId,
          export_quality: quality
        })
      });

      setExportProgress(80);
      const data = await exportRes.json();

      if (!exportRes.ok) {
        throw new Error(data.detail || 'Export failed');
      }

      if (data.success && data.video_url) {
        setExportProgress(100);
        const downloadUrl = `${backendUrl}${data.video_url}`;
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `captioned_video_${quality}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (onCreditsUpdate) {
          onCreditsUpdate();
        }
      } else {
        throw new Error(data.error || 'Export failed');
      }
    } catch (err) {
      console.error('Export error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setExportError('Video export requires the Python backend server. Download the SRT file to use with your video editor.');
      } else if (err.message.includes('Insufficient credits')) {
        setExportError('Insufficient credits. Please purchase more credits to export videos.');
      } else {
        setExportError(err.message || 'Export failed. Try downloading the SRT file instead.');
      }
    } finally {
      setExportingVideo(null);
      setExportProgress(0);
    }
  };

  const handleDownloadVideoWithSubs = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = 'original_video.mp4';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportOptions = [
    {
      icon: Video,
      title: 'Export Video (1080p)',
      description: 'High quality MP4 with burned-in captions',
      action: () => handleExportVideo('1080p'),
      gradient: 'from-orange-500 to-red-500',
      loading: exportingVideo === '1080p',
      requiresBackend: true
    },
    {
      icon: Video,
      title: 'Export Video (720p)',
      description: 'Standard HD MP4 with burned-in captions',
      action: () => handleExportVideo('720p'),
      gradient: 'from-blue-500 to-cyan-500',
      loading: exportingVideo === '720p',
      requiresBackend: true
    },
    {
      icon: Download,
      title: 'Download Original Video',
      description: 'Download source video without captions',
      action: handleDownloadVideoWithSubs,
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      icon: FileText,
      title: 'SRT Subtitle File',
      description: 'Standard subtitle format for all players',
      action: handleDownloadSRT,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: FileJson,
      title: 'VTT Subtitle File',
      description: 'Web-optimized subtitle format',
      action: handleDownloadVTT,
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      icon: FileJson,
      title: 'Plain Text',
      description: 'Just the caption text',
      action: handleDownloadText,
      gradient: 'from-amber-500 to-orange-500'
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

        {exportError && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{exportError}</p>
          </div>
        )}

        {exportingVideo && exportProgress > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Exporting {exportingVideo}...</span>
              <span className="text-white">{exportProgress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
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
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <option.icon className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
              <div className="text-left flex-1">
                <p className="text-white font-medium">{option.title}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
              {option.requiresBackend && (
                <span className="text-xs text-gray-600 bg-white/5 px-2 py-1 rounded">Backend</span>
              )}
            </motion.button>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
          <h4 className="text-sm font-medium text-cyan-400 mb-2">Pro Tip</h4>
          <p className="text-xs text-gray-400">
            Download the SRT file and import it into your video editor (CapCut, Premiere Pro, DaVinci Resolve)
            for full control over caption styling and positioning.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Coming Soon</h4>
          <div className="space-y-3">
            {['CapCut Project Export', 'Premiere Pro XML', 'Direct Social Upload'].map((feature, idx) => (
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
