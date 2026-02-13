import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { FileText, Copy, Check, FileJson, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
export default function ExportPanel({ open, onClose, captions }) {
  const [copied, setCopied] = useState(false);

  // --- HELPER FUNCTIONS FOR TEXT EXPORT ---
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

  const exportOptions = [
    {
      icon: FileText,
      title: 'SRT File',
      description: 'Standard subtitle format for video editors',
      action: handleDownloadSRT,
      gradient: 'from-purple-500 to-blue-500'
    },
    {
      icon: FileJson,
      title: 'Plain Text',
      description: 'Just the caption text',
      action: handleDownloadText,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: copied ? Check : Copy,
      title: copied ? 'Copied!' : 'Copy to Clipboard',
      description: 'Quick paste anywhere',
      action: handleCopyText,
      gradient: 'from-green-500 to-emerald-500'
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-zinc-900 border-white/10 text-white w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold text-white">
            Export Captions
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {exportOptions.map((option, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={option.action}
              className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center gap-4 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.gradient} p-0.5`}>
                <div className="w-full h-full rounded-xl bg-zinc-900 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                  <option.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{option.title}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Coming Soon</h4>
          <div className="space-y-3">
            {['Video Export (MP4 with captions)', 'CapCut Export', 'Premiere Pro Export', 'Direct Upload'].map((feature, idx) => (
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

        <div className="mt-8 p-4 rounded-xl bg-purple-600/10 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Total Captions</span>
            <span className="text-lg font-bold text-white">{captions?.length || 0}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}