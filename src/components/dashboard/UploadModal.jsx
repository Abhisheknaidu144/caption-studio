import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Film, Sparkles, Globe, Palette, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi (हिंदी)' },
  { value: 'hinglish', label: 'Hinglish' },
  { value: 'tamil', label: 'Tamil (தமிழ்)' },
  { value: 'telugu', label: 'Telugu (తెలుగు)' },
  { value: 'kannada', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'malayalam', label: 'Malayalam (മലയാളം)' },
  { value: 'marathi', label: 'Marathi (मराठी)' },
  { value: 'bengali', label: 'Bengali (বাংলা)' },
  { value: 'gujarati', label: 'Gujarati (ગુજરાતી)' },
  { value: 'punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { value: 'urdu', label: 'Urdu (اردو)' },
];

const styles = [
  { value: 'viral_hook', label: 'Viral Hook', description: 'Punchy, attention-grabbing' },
  { value: 'explainer', label: 'Explainer', description: 'Clear, educational' },
  { value: 'motivational', label: 'Motivational', description: 'Inspiring, powerful' },
  { value: 'podcast', label: 'Podcast / Talking Head', description: 'Conversational, natural' },
  { value: 'spiritual', label: 'Spiritual / Calm', description: 'Peaceful, mindful' },
  { value: 'business', label: 'Business / Authority', description: 'Professional, confident' },
];

export default function UploadModal({ 
  open, 
  onClose, 
  onUpload,
  isUploading 
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [language, setLanguage] = useState('english');
  const [style, setStyle] = useState('viral_hook');
  const [step, setStep] = useState(1);
  const [fileSizeError, setFileSizeError] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        // Check file size (100MB = 104857600 bytes)
        const maxSize = 100 * 1024 * 1024;
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        
        if (file.size > maxSize) {
          setFileSizeError(`File size (${fileSizeMB}MB) exceeds 100MB limit.`);
          return;
        }
        
        setFileSizeError(null);
        setSelectedFile(file);
        setStep(2);
      }
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (100MB = 104857600 bytes)
      const maxSize = 100 * 1024 * 1024;
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      
      if (file.size > maxSize) {
        setFileSizeError(`File size (${fileSizeMB}MB) exceeds 100MB limit.`);
        return;
      }
      
      setFileSizeError(null);
      setSelectedFile(file);
      setStep(2);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile, { language, style });
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setStep(1);
    setLanguage('english');
    setStyle('viral_hook');
    setFileSizeError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetModal();
        onClose();
      }
    }}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {step === 1 ? 'Upload Video' : 'Caption Settings'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Drop zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-white/10 hover:border-white/20'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-7 h-7 text-purple-400" />
                </div>
                
                <p className="text-white font-medium mb-1">
                  Drop your video here
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  or click to browse
                </p>
                
                <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Film className="w-3 h-3" />
                    MP4, MOV, WebM
                  </span>
                  <span>15-90 seconds</span>
                  <span>Max 100MB</span>
                </div>
              </div>
              
              {fileSizeError && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{fileSizeError}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Selected file preview */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <Film className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{selectedFile?.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="text-gray-400 hover:text-white"
                >
                  Change
                </Button>
              </div>
              
              {/* Language selection */}
              <div>
                <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-zinc-800 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-white/10">
                    {languages.map(lang => (
                      <SelectItem 
                        key={lang.value} 
                        value={lang.value}
                        className="text-white hover:bg-white/10"
                      >
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Style selection */}
              <div>
                <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Caption Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {styles.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(s.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        style === s.value
                          ? 'bg-purple-600/20 border-purple-500'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <p className="text-sm text-white font-medium">{s.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Captions
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}