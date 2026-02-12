import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import WordClickPopup from './WordClickPopup';


export default function VideoPlayer({ 
  videoUrl, 
  currentTime, 
  setCurrentTime, 
  isPlaying, 
  setIsPlaying,
  captions,
  captionStyle,
  duration,
  setDuration,
  setCaptionStyle,
  setCaptionStyleRaw,
  setCaptions,
  setCaptionsRaw,
  addToHistory,
  selectedCaptionId,
  wordPopup,
  setWordPopup,
  onVideoLoaded
}) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPos, setDragStartPos] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  
  // Custom Element State
  const [draggedElementId, setDraggedElementId] = useState(null);
  const [resizedElementId, setResizedElementId] = useState(null);
  const [elementDragStart, setElementDragStart] = useState({ x: 0, y: 0, initialTop: 0, initialLeft: 0 });
  const [elementResizeStart, setElementResizeStart] = useState({ x: 0, initialWidth: 0, initialFontSize: 0 });

  // const [wordPopup, setWordPopup] = useState(null); // Lifted to Dashboard
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [resizeStartFontSize, setResizeStartFontSize] = useState(18);
  const [captionWidth, setCaptionWidth] = useState(300);
  
  // Word dragging state (for both captions and text elements)
  const [draggingWord, setDraggingWord] = useState(null); // { captionId, wordIndex, startX, startY, initialX, initialY, isElement }

  const captionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Trigger waveform extraction callback
      if (onVideoLoaded) {
        onVideoLoaded(videoRef.current);
      }
    }
  };

  const handleSeek = (value) => {
    if (videoRef.current) {
      // Handle both array (from Slider) and scalar (from buttons) values
      const targetTime = Array.isArray(value) ? value[0] : value;
      
      // Don't modify playback state, just update time
      if (Math.abs(videoRef.current.currentTime - targetTime) > 0.1) {
        videoRef.current.currentTime = targetTime;
      }
      setCurrentTime(targetTime);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getActiveCaptions = () => {
    if (!captions || captions.length === 0) return [];
    return captions.filter(cap => 
      cap && 
      !cap.isTextElement &&
      typeof cap.start_time === 'number' && 
      typeof cap.end_time === 'number' &&
      currentTime >= cap.start_time && 
      currentTime <= cap.end_time
    );
  };

  const getActiveTextElements = () => {
    if (!captions || captions.length === 0) return [];
    return captions.filter(cap => 
      cap && 
      cap.isTextElement &&
      typeof cap.start_time === 'number' && 
      typeof cap.end_time === 'number' &&
      currentTime >= cap.start_time && 
      currentTime <= cap.end_time
    );
  };

  const getAnimationStyle = (animationType) => {
    const animations = {
      'rise': 'rise 0.4s ease-out',
      'pan': 'pan 0.5s ease-in-out',
      'fade': 'fade 0.5s ease-in',
      'pop': 'pop 0.3s ease-out',
      'wipe': 'wipe 0.4s ease-out',
      'blur': 'blur 0.5s ease-in-out',
      'succession': 'succession 0.4s ease-out',
      'breathe': 'breathe 1.5s ease-in-out infinite',
      'baseline': 'baseline 0.4s ease-out',
      'drift': 'drift 0.6s ease-in-out',
      'tectonic': 'tectonic 0.5s ease-out',
      'tumble': 'tumble 0.6s ease-in-out'
    };
    return animations[animationType] || 'none';
  };

  const activeCaptions = getActiveCaptions();
  const activeTextElements = getActiveTextElements();

  // Helper for single caption logic (for double click edit which we might need to scope to a specific one)
  // We'll use selectedCaptionId if active, or just the first active one
  const primaryCaption = selectedCaptionId 
    ? activeCaptions.find(c => c.id === selectedCaptionId) || activeCaptions[0] 
    : activeCaptions[0];

  // Dynamic word pacing: 1-3 words default, adapts to speech speed
  const getHighlightedWordIndex = (caption) => {
    if (!caption) return 0;
    const words = (caption.text || '').split(/(\s+)/).filter(w => w.trim().length > 0);
    if (words.length === 0) return 0;
    
    const captionDuration = caption.end_time - caption.start_time;
    const timeInCaption = Math.max(0, currentTime - caption.start_time);
    
    // Calculate words per second to detect speech speed
    const wordsPerSecond = words.length / captionDuration;
    
    // Adaptive pacing based on speech speed:
    // Slow speech (<2 wps): 1 word at a time (emphatic)
    // Normal speech (2-4 wps): 1-2 words at a time
    // Fast speech (>4 wps): 2-3 words, or full phrase if 4-5 words spoken quickly
    let wordsPerBeat = 1;
    if (wordsPerSecond < 2) {
      wordsPerBeat = 1; // Single word for slow/emphatic delivery
    } else if (wordsPerSecond < 3) {
      wordsPerBeat = 1.5; // 1-2 words
    } else if (wordsPerSecond < 4.5) {
      wordsPerBeat = 2; // 2 words for normal pace
    } else {
      wordsPerBeat = 3; // 3 words for fast speech (or show full 4-5 word phrase)
    }
    
    // Time per "beat" (group of words)
    const totalBeats = Math.ceil(words.length / wordsPerBeat);
    const beatDuration = captionDuration / totalBeats;
    
    // Find current beat
    const currentBeat = Math.floor(timeInCaption / beatDuration);
    const wordIndex = Math.min(Math.floor(currentBeat * wordsPerBeat), words.length - 1);
    
    return wordIndex;
  };

  // Get range of words to highlight (for multi-word display)
  const getHighlightedWordRange = (caption) => {
    if (!caption) return { start: 0, end: 0 };
    const words = (caption.text || '').split(/(\s+)/).filter(w => w.trim().length > 0);
    if (words.length === 0) return { start: 0, end: 0 };
    
    const captionDuration = caption.end_time - caption.start_time;
    const timeInCaption = Math.max(0, currentTime - caption.start_time);
    const wordsPerSecond = words.length / captionDuration;
    
    // Determine how many words to show at once
    let wordsToShow = 1;
    if (wordsPerSecond < 2) {
      wordsToShow = 1; // Emphatic single word
    } else if (wordsPerSecond < 3) {
      wordsToShow = Math.min(2, words.length); // 1-2 words
    } else if (wordsPerSecond < 4.5) {
      wordsToShow = Math.min(2, words.length); // 2 words
    } else {
      // Fast speech: show 3 words or full phrase if 4-5 words
      wordsToShow = words.length <= 5 ? words.length : Math.min(3, words.length);
    }
    
    const totalGroups = Math.ceil(words.length / wordsToShow);
    const groupDuration = captionDuration / totalGroups;
    const currentGroup = Math.min(Math.floor(timeInCaption / groupDuration), totalGroups - 1);
    
    const startIdx = currentGroup * wordsToShow;
    const endIdx = Math.min(startIdx + wordsToShow - 1, words.length - 1);
    
    return { start: startIdx, end: endIdx };
  };

  const handleCaptionDoubleClick = (e, caption) => {
    if (!setCaptions || !caption) return;
    e.stopPropagation();
    setIsEditing(caption.id);
    setEditText(caption.text || '');
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Place cursor at the end instead of selecting all
        const range = document.createRange();
        range.selectNodeContents(inputRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 0);
  };

  const handleEditComplete = (captionId) => {
    if (setCaptions && captionId) {
      setCaptions(prev => prev.map(cap => 
        cap.id === captionId ? { ...cap, text: editText } : cap
      ));
    }
    setIsEditing(false);
    setEditText('');
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText('');
    }
    // Allow all keys including backspace, Enter, etc.
  };

  const handleEditInput = (e) => {
    // Save cursor position before updating state
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(e.currentTarget);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const caretOffset = preCaretRange.toString().length;
    
    const newText = e.currentTarget.textContent;
    setEditText(newText);
    
    // Restore cursor position after state update
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const newRange = document.createRange();
        const newSelection = window.getSelection();
        
        let charCount = 0;
        let node = inputRef.current.firstChild;
        
        if (node && node.nodeType === Node.TEXT_NODE) {
          const offset = Math.min(caretOffset, node.textContent.length);
          newRange.setStart(node, offset);
          newRange.setEnd(node, offset);
          newSelection.removeAllRanges();
          newSelection.addRange(newRange);
        }
      }
    });
  };

  // Handle individual word OR element word style updates
  const handleWordStyleChange = (key, value, skipHistory = false) => {
    if (!wordPopup || !setCaptions) return;
    
    const updater = skipHistory && setCaptionsRaw ? setCaptionsRaw : setCaptions;

    // Handle Text Element WORD Style Update (per-word styling)
    if (wordPopup.type === 'element') {
      updater(prev => prev.map(c => {
        if (c.id !== wordPopup.elementId) return c;
        
        const wordStyles = c.wordStyles || {};
        const styleKey = `${c.id}-${wordPopup.wordIndex}`;
        const currentWordStyle = wordStyles[styleKey] || {};
        
        return {
          ...c,
          wordStyles: {
            ...wordStyles,
            [styleKey]: { ...currentWordStyle, [key]: value }
          }
        };
      }));
      return;
    }

    // Handle Individual Word Style Update for regular captions
    const { caption, wordIndex } = wordPopup;
    if (!caption) return;

    updater(prev => prev.map(c => {
      if (c.id !== caption.id) return c;
      
      const wordStyles = c.wordStyles || {};
      const styleKey = `${c.id}-${wordIndex}`;
      const currentWordStyle = wordStyles[styleKey] || {};
      
      return {
        ...c,
        wordStyles: {
          ...wordStyles,
          [styleKey]: { ...currentWordStyle, [key]: value }
        }
      };
    }));
  };

  const getPositionStyle = () => {
    const posY = captionStyle?.position_y || 75; // Default lowered for captions
    const posX = captionStyle?.position_x || 50;
    
    // Always center transform to prevent visual jumping when changing anchor
    // The anchor setting will strictly affect text growth direction via StyleControls
    return {
      top: `${posY}%`,
      left: `${posX}%`,
      transform: 'translate(-50%, -50%)'
    };
  };

  const handleMouseDown = (e) => {
    if (!setCaptionStyle || e.target.classList.contains('resize-handle')) return;
    // Don't trigger caption drag if we are dragging a word
    if (draggingWord) return;
    
    e.preventDefault();
    e.stopPropagation();
    if (addToHistory) addToHistory();
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartPos(captionStyle?.position_y || 50);
  };

  const handleTextElementMouseDown = (e, elementId, currentStyle) => {
    if (!setCaptions || e.target.classList.contains('text-resize-handle')) return;
    e.preventDefault();
    e.stopPropagation();
    if (addToHistory) addToHistory();
    setDraggedElementId(elementId);
    setElementDragStart({
      x: e.clientX,
      y: e.clientY,
      initialTop: currentStyle.top || 50,
      initialLeft: currentStyle.left || 50
    });
  };

  const handleTextElementResizeDown = (e, elementId, currentStyle) => {
    e.preventDefault();
    e.stopPropagation();
    if (addToHistory) addToHistory();
    setResizedElementId(elementId);
    setElementResizeStart({
      x: e.clientX,
      initialWidth: currentStyle.width || 300,
      initialFontSize: currentStyle.fontSize || 18
    });
  };

  const handleWordMouseDown = (e, caption, wordIndex, isElement = false) => {
    if (!setCaptions) return;
    e.preventDefault();
    e.stopPropagation();
    if (addToHistory) addToHistory();
    
    const customStyle = caption?.wordStyles?.[`${caption?.id}-${wordIndex}`] || {};
    
    setDraggingWord({
      captionId: caption.id,
      wordIndex,
      startX: e.clientX,
      startY: e.clientY,
      initialX: customStyle.x || 0,
      initialY: customStyle.y || 0,
      isElement
    });
  };

  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (addToHistory) addToHistory();
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setResizeStartWidth(captionWidth);
    setResizeStartFontSize(captionStyle?.font_size || 18);
  };

  // Global Mouse Move / Up for all dragging operations
  useEffect(() => {
    if ((!isDragging && !draggingWord && !draggedElementId && !resizedElementId) || (!setCaptionStyle && !setCaptions)) return;

    const handleMouseMove = (e) => {
      // 1. Handle Caption Vertical Drag
      if (isDragging) {
        const videoContainer = captionRef.current?.parentElement;
        if (!videoContainer) return;

        const containerHeight = videoContainer.offsetHeight;
        const deltaY = e.clientY - dragStartY;
        const deltaPercent = (deltaY / containerHeight) * 100;
        
        let newPos = dragStartPos + deltaPercent;
        newPos = Math.max(5, Math.min(95, newPos));
        
        const styleUpdater = setCaptionStyleRaw || setCaptionStyle;
        styleUpdater(prev => ({ ...prev, position_y: Math.round(newPos) }));
      }
      
      // 2. Handle Word Drag (for both captions and text elements)
      if (draggingWord) {
         const deltaX = e.clientX - draggingWord.startX;
         const deltaY = e.clientY - draggingWord.startY;
         
         // Only trigger movement logic if drag distance is significant
         if (Math.abs(deltaX) < 2 && Math.abs(deltaY) < 2) return;

         const newX = draggingWord.initialX + deltaX;
         const newY = draggingWord.initialY + deltaY;
         
         const captionUpdater = setCaptionsRaw || setCaptions;
         captionUpdater(prev => prev.map(c => {
            if (c.id !== draggingWord.captionId) return c;
            
            const wordStyles = c.wordStyles || {};
            const styleKey = `${c.id}-${draggingWord.wordIndex}`;
            const currentWordStyle = wordStyles[styleKey] || {};
            
            return {
              ...c,
              wordStyles: {
                ...wordStyles,
                [styleKey]: { 
                  ...currentWordStyle, 
                  x: newX,
                  y: newY
                }
              }
            };
            }));
            }

            // 3. Handle Text Element Drag
            if (draggedElementId && setCaptions) {
            const videoContainer = videoRef.current?.parentElement;
            if (!videoContainer) return;

            const containerWidth = videoContainer.offsetWidth;
            const containerHeight = videoContainer.offsetHeight;
            const deltaX = e.clientX - elementDragStart.x;
            const deltaY = e.clientY - elementDragStart.y;
            const deltaPercentX = (deltaX / containerWidth) * 100;
            const deltaPercentY = (deltaY / containerHeight) * 100;

            let newLeft = elementDragStart.initialLeft + deltaPercentX;
            let newTop = elementDragStart.initialTop + deltaPercentY;
            newLeft = Math.max(5, Math.min(95, newLeft));
            newTop = Math.max(5, Math.min(95, newTop));

            const captionUpdater = setCaptionsRaw || setCaptions;
            captionUpdater(prev => prev.map(c => {
            if (c.id !== draggedElementId) return c;
            return {
            ...c,
            customStyle: {
             ...c.customStyle,
             left: newLeft,
             top: newTop
            }
            };
            }));
            }

            // 4. Handle Text Element Resize
            if (resizedElementId && setCaptions) {
            const deltaX = e.clientX - elementResizeStart.x;
            let newWidth = elementResizeStart.initialWidth + deltaX;
            newWidth = Math.max(150, Math.min(600, newWidth));

            const widthRatio = newWidth / elementResizeStart.initialWidth;
            let newFontSize = Math.round(elementResizeStart.initialFontSize * widthRatio);
            newFontSize = Math.max(12, Math.min(60, newFontSize));

            const captionUpdater = setCaptionsRaw || setCaptions;
            captionUpdater(prev => prev.map(c => {
            if (c.id !== resizedElementId) return c;
            return {
            ...c,
            customStyle: {
             ...c.customStyle,
             width: newWidth,
             fontSize: newFontSize
            }
            };
            }));
            }
            };

            const handleMouseUp = () => {
            setIsDragging(false);
            setDraggingWord(null);
            setDraggedElementId(null);
            setResizedElementId(null);
            };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartY, dragStartPos, setCaptionStyle, draggingWord, setCaptions, draggedElementId, resizedElementId, elementDragStart, elementResizeStart]);

  useEffect(() => {
    if (!isResizing || !setCaptionStyle) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - resizeStartX;
      let newWidth = resizeStartWidth + deltaX;
      newWidth = Math.max(150, Math.min(600, newWidth));
      
      // Calculate proportional font size change
      const widthRatio = newWidth / resizeStartWidth;
      let newFontSize = Math.round(resizeStartFontSize * widthRatio);
      newFontSize = Math.max(12, Math.min(60, newFontSize));
      
      setCaptionWidth(newWidth);
      const styleUpdater = setCaptionStyleRaw || setCaptionStyle;
      styleUpdater(prev => ({ ...prev, font_size: newFontSize }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStartX, resizeStartWidth, resizeStartFontSize, setCaptionStyle]);

  return (
    <div className="flex flex-col h-full">
      {/* Video container with 9:16 aspect ratio for mobile preview */}
      <div className="relative flex-1 bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center min-h-0">
        <div className="relative w-full h-full max-h-full aspect-[9/16] bg-black shadow-2xl">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900/50">
              <p className="text-gray-500 text-sm text-center px-4">
                Upload a video to get started
              </p>
            </div>
          )}



          {/* Caption overlays */}
          {activeCaptions.map((caption) => {
            const isEditingThis = isEditing === caption.id;
            // Text elements are positioned higher or custom, but for now we'll use same style
            // We should probably allow separate positioning for text elements in future, but keeping simple for now
            // or we use captionStyle but offset it if it's a text element? 
            // The current request implies basic overlap support. 
            // We use the same getPositionStyle() which uses global captionStyle. This is a limitation.
            // Ideally text elements should have their own position in their data.
            // Since we don't have per-caption position yet, they will stack.
            // Let's at least render them so they are visible.
            
            return (
              <div 
                key={caption.id}
                ref={captionRef}
                className={`absolute px-3 flex justify-center ${setCaptionStyle && !isEditingThis ? 'cursor-move' : ''}`}
                style={{
                  ...getPositionStyle(),
                  // If it's a text element, maybe offset it slightly or allow it to be distinct?
                  // For now, they share the same position setting which allows dragging ONE changes ALL.
                  // This is "MVP" behavior.
                  zIndex: caption.isTextElement ? 20 : 10 
                }}
                onMouseDown={setCaptionStyle && !isEditingThis ? handleMouseDown : undefined}
                onDoubleClick={(e) => handleCaptionDoubleClick(e, caption)}
              >
                <div 
                  className={`rounded-lg border-2 border-solid ${selectedCaptionId === caption.id ? 'border-white/40' : 'border-transparent'} relative ${isDragging ? 'cursor-grabbing' : isEditingThis ? 'cursor-text' : setCaptionStyle ? 'cursor-grab' : ''} group`}
                  style={{
                    backgroundColor: captionStyle?.has_background 
                      ? `rgba(0,0,0,${captionStyle?.background_opacity || 0.7})` 
                      : 'transparent',
                    padding: captionStyle?.has_background ? `${captionStyle?.background_padding || 8}px` : '8px',
                    textAlign: captionStyle?.text_align || 'center',
                    width: `${captionWidth}px`,
                    maxWidth: '90vw'
                  }}
                >
                  {/* Resize handles for regular captions */}
                  {setCaptionStyle && !isEditingThis && (
                    <>
                      <div 
                        className="resize-handle absolute top-0 left-0 right-0 h-4 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={handleResizeMouseDown}
                        style={{ background: 'linear-gradient(to bottom, rgba(168, 85, 247, 0.4), transparent)' }}
                      />
                      <div 
                        className="resize-handle absolute left-0 top-0 bottom-0 w-4 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={handleResizeMouseDown}
                        style={{ background: 'linear-gradient(to right, rgba(168, 85, 247, 0.4), transparent)' }}
                      />
                      <div 
                        className="resize-handle absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={handleResizeMouseDown}
                        style={{ background: 'linear-gradient(to left, rgba(168, 85, 247, 0.4), transparent)' }}
                      />
                      <div 
                        className="resize-handle absolute bottom-0 right-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={handleResizeMouseDown}
                        style={{
                          borderRight: '3px solid rgba(168, 85, 247, 0.7)',
                          borderBottom: '3px solid rgba(168, 85, 247, 0.7)',
                          cursor: 'nwse-resize'
                        }}
                      />
                    </>
                  )}
                  
                  {isEditingThis ? (
                    <div
                      ref={inputRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleEditInput}
                      onBlur={() => handleEditComplete(caption.id)}
                      onKeyDown={handleEditKeyDown}
                      className="bg-transparent border-none outline-none text-center"
                      style={{
                        fontFamily: captionStyle?.font_family || 'Inter',
                        fontSize: `${captionStyle?.font_size || 18}px`,
                        lineHeight: captionStyle?.line_spacing || 1.4,
                        fontWeight: captionStyle?.font_weight || 'normal',
                        fontStyle: captionStyle?.font_style || 'normal',
                        textAlign: captionStyle?.text_align || 'center',
                        letterSpacing: `${captionStyle?.letter_spacing || 0}px`,
                        wordSpacing: `${captionStyle?.word_spacing || 1}px`,
                        textDecoration: captionStyle?.text_decoration || 'none',
                        opacity: captionStyle?.text_opacity || 1,
                        transform: `scale(${captionStyle?.scale || 1})`,
                        ...(captionStyle?.text_gradient ? {
                          backgroundImage: captionStyle.text_gradient,
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          color: 'transparent',
                          display: 'block', // Editor needs block to have size
                        } : {
                          color: captionStyle?.text_color || '#ffffff'
                        }),
                        textTransform: captionStyle?.text_case === 'uppercase' ? 'uppercase' : captionStyle?.text_case === 'lowercase' ? 'lowercase' : captionStyle?.text_case === 'capitalize' ? 'capitalize' : 'none',
                        width: '100%',
                        minWidth: '200px',
                        minHeight: '60px'
                      }}
                    >
                      {editText}
                    </div>
                  ) : (
                    <span
                      className={caption.animation ? `animate-${caption.animation}` : ''}
                      style={{
                        fontFamily: captionStyle?.font_family || 'Inter',
                        fontSize: `${captionStyle?.font_size || 18}px`,
                        lineHeight: `${(captionStyle?.font_size || 18) * (captionStyle?.line_spacing || 1.4)}px`,
                        fontWeight: captionStyle?.font_weight || 'normal',
                        fontStyle: captionStyle?.font_style || 'normal',
                        textAlign: captionStyle?.text_align || 'center',
                        display: 'block',
                        letterSpacing: `${captionStyle?.letter_spacing || 0}px`,
                        wordSpacing: `${captionStyle?.word_spacing || 1}px`,
                        textDecoration: captionStyle?.text_decoration || 'none',
                        opacity: captionStyle?.text_opacity || 1,
                        transform: `scale(${captionStyle?.scale || 1})`,
                        textStroke: (captionStyle?.has_stroke && !captionStyle?.text_gradient) ? '1px rgba(0,0,0,0.5)' : 'none',
                        WebkitTextStroke: (captionStyle?.has_stroke && !captionStyle?.text_gradient) ? '1px rgba(0,0,0,0.5)' : 'none',
                        filter: (captionStyle?.has_shadow && !captionStyle?.text_gradient) ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' : 'none',
                        whiteSpace: 'pre-wrap',
                        animation: caption.animation && caption.animation !== 'none' ? getAnimationStyle(caption.animation) : 'none',
                        color: captionStyle?.text_color || '#ffffff',
                        textTransform: captionStyle?.text_case === 'uppercase' ? 'uppercase' : captionStyle?.text_case === 'lowercase' ? 'lowercase' : captionStyle?.text_case === 'capitalize' ? 'capitalize' : 'none',
                        textShadow: captionStyle?.has_shadow ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                      }}
                    >
                      {(caption?.text || '').split(/(\s+|\n)/).map((part, i) => {
                        if (part === '\n') return <br key={i} />;
                        if (part.match(/^\s+$/)) return <span key={i}>{part}</span>;

                        const words = (caption?.text || '').split(/\s+/);
                        const wordIndex = words.indexOf(part);
                        const highlightRange = getHighlightedWordRange(caption);
                        const isHighlighted = wordIndex >= highlightRange.start && wordIndex <= highlightRange.end;
                        const customStyle = caption?.wordStyles?.[`${caption?.id}-${wordIndex}`] || {};
                        const isWordClicked = wordPopup?.wordIndex === wordIndex && wordPopup?.caption?.id === caption?.id;

                        // Separate transform from other styles to avoid conflict with animation
                        const { x = 0, y = 0, animation, ...restStyle } = customStyle;
                        const globalLineHeight = (captionStyle?.font_size || 18) * (captionStyle?.line_spacing || 1.4);

                        return (
                          <span
                            key={i}
                            style={{
                              display: 'inline-block',
                              position: 'relative',
                              transform: `translate(${x}px, ${y}px)`,
                              transition: draggingWord ? 'none' : 'transform 0.1s ease',
                              verticalAlign: 'top',
                              cursor: 'move',
                              height: `${globalLineHeight}px`,
                            }}
                            onMouseDown={(e) => handleWordMouseDown(e, caption, wordIndex)}
                            onClick={(e) => {
                              if (setWordPopup && wordIndex >= 0) {
                                e.stopPropagation();
                                setWordPopup({
                                  word: part,
                                  position: { x: e.clientX, y: e.clientY },
                                  caption: caption,
                                  wordIndex
                                });
                              }
                            }}
                          >
                            {/* Spacer: reserves original space */}
                            <span
                              style={{
                                visibility: 'hidden',
                                fontFamily: captionStyle?.font_family || 'Inter',
                                fontSize: `${captionStyle?.font_size || 18}px`,
                                lineHeight: `${globalLineHeight}px`,
                                fontWeight: captionStyle?.is_bold ? 'bold' : 'normal',
                                letterSpacing: `${captionStyle?.letter_spacing || 0}px`,
                                textTransform: captionStyle?.text_case === 'uppercase' ? 'uppercase' : captionStyle?.text_case === 'lowercase' ? 'lowercase' : captionStyle?.text_case === 'capitalize' ? 'capitalize' : 'none',
                                whiteSpace: 'pre',
                              }}
                            >
                              {part}
                            </span>

                            {/* Absolute centered container for custom sized word */}
                            <span
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                              }}
                            >
                                <span 
                                  className={animation ? `animate-${animation}` : ''}
                                  style={{
                                    pointerEvents: 'auto',
                                    position: 'relative',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    animation: animation && animation !== 'none' ? getAnimationStyle(animation) : 'none',
                                  }}
                                >
                                  {/* Background Layer */}
                                  <span 
                                    style={{
                                      position: 'absolute',
                                      inset: 0,
                                      zIndex: -1,
                                      borderRadius: (isHighlighted && !isWordClicked) || isWordClicked ? '4px' : '0',
                                      // Background Priority: Local Highlight Gradient -> Local BG Color -> Global Highlight (if highlighted)
                                      ...(restStyle.highlightGradient ? {
                                        backgroundImage: restStyle.highlightGradient
                                      } : restStyle.backgroundColor ? {
                                        backgroundColor: `rgba(${parseInt(restStyle.backgroundColor.slice(1, 3), 16)}, ${parseInt(restStyle.backgroundColor.slice(3, 5), 16)}, ${parseInt(restStyle.backgroundColor.slice(5, 7), 16)}, ${restStyle.backgroundOpacity ?? 1})`
                                      } : (isHighlighted && !isWordClicked && (captionStyle?.highlight_color || captionStyle?.highlight_gradient)) ? {
                                        backgroundImage: captionStyle.highlight_gradient || undefined,
                                        backgroundColor: captionStyle.highlight_gradient ? undefined : captionStyle.highlight_color
                                      } : {}),
                                      border: isWordClicked ? '1px solid #a855f7' : 'none',
                                    }}
                                  />

                                  {/* Text Layer */}
                                  <span
                                    style={{
                                     whiteSpace: 'pre',
                                     fontFamily: restStyle.fontFamily || captionStyle?.font_family || 'Inter',
                                     fontWeight: restStyle.fontWeight || (captionStyle?.is_bold ? 'bold' : 'normal'),
                                     fontStyle: restStyle.fontStyle || 'normal',
                                     fontSize: restStyle.fontSize ? `${restStyle.fontSize}px` : undefined,
                                     lineHeight: `${globalLineHeight}px`,
                                     textAlign: restStyle.textAlign || undefined,
                                     textDecoration: restStyle.textDecoration || captionStyle?.text_decoration || 'none',
                                     textTransform: restStyle.textTransform || (captionStyle?.text_case === 'uppercase' ? 'uppercase' : captionStyle?.text_case === 'lowercase' ? 'lowercase' : captionStyle?.text_case === 'capitalize' ? 'capitalize' : 'none'),
                                     padding: restStyle.backgroundPadding !== undefined 
                                       ? `${restStyle.backgroundPadding / 12}em ${Math.round(restStyle.backgroundPadding * 1.5) / 12}em`
                                       : ((isHighlighted && !isWordClicked) ? '0.2em 0.3em' : (isWordClicked ? '0.2em 0.3em' : '0.2em 0')),

                                      // Text Color Priority: Local Text Gradient -> Local Color -> Global Text Gradient -> Global Color
                                      ...(restStyle.textGradient ? {
                                          backgroundImage: restStyle.textGradient,
                                          WebkitBackgroundClip: 'text',
                                          backgroundClip: 'text',
                                          WebkitTextFillColor: 'transparent',
                                          color: 'transparent'
                                      } : restStyle.color ? {
                                          color: restStyle.color
                                      } : captionStyle?.text_gradient ? {
                                          backgroundImage: captionStyle.text_gradient,
                                          WebkitBackgroundClip: 'text',
                                          backgroundClip: 'text',
                                          WebkitTextFillColor: 'transparent',
                                          color: 'transparent'
                                      } : {
                                          color: captionStyle?.text_color || '#ffffff'
                                      }),

                                      // Stroke/Shadow - disable if text gradient active (either local or global)
                                      textShadow: restStyle.textShadow || ((captionStyle?.text_gradient || restStyle.textGradient) ? 'none' : undefined),
                                      WebkitTextStroke: restStyle.WebkitTextStroke || ((captionStyle?.text_gradient || restStyle.textGradient) ? 'none' : undefined),
                                    }}
                                  >
                                    {part}
                                  </span>
                                </span>
                            </span>
                          </span>
                        );
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Text Elements (render above captions) */}
          {activeTextElements.map((element) => {
            const style = element.customStyle || {};
            const isEditingThis = isEditing === element.id;
            const isSelected = selectedCaptionId === element.id;

            const handleDeleteElement = (e) => {
              e.stopPropagation();
              e.preventDefault();
              if (setCaptions) {
                setCaptions(prev => prev.filter(c => c.id !== element.id));
              }
            };

            return (
              <div
                key={element.id}
                className={`absolute ${isSelected ? 'ring-2 ring-purple-500' : ''} ${draggedElementId === element.id ? 'cursor-grabbing' : 'cursor-grab'} group`}
                style={{
                  top: `${style.top || 50}%`,
                  left: `${style.left || 50}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${style.width || 300}px`,
                  backgroundColor: style.backgroundColor ? `rgba(${parseInt(style.backgroundColor.slice(1, 3), 16)}, ${parseInt(style.backgroundColor.slice(3, 5), 16)}, ${parseInt(style.backgroundColor.slice(5, 7), 16)}, ${style.backgroundOpacity || 0.6})` : `rgba(0, 0, 0, ${captionStyle?.background_opacity || 0.7})`,
                  borderRadius: `${style.borderRadius || 8}px`,
                  padding: `${style.padding || 8}px`,
                  zIndex: style.zIndex || 50
                }}
                onMouseDown={(e) => !isEditingThis && handleTextElementMouseDown(e, element.id, style)}
                onDoubleClick={(e) => handleCaptionDoubleClick(e, element)}
              >
                {/* Delete button - always visible on hover */}
                {!isEditingThis && (
                  <button
                    className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-zinc-900 border border-white/20 hover:border-red-500/50 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all z-50 flex items-center justify-center shadow-xl text-gray-400 hover:text-red-500"
                    onClick={handleDeleteElement}
                    title="Delete text element"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Resize handles - show for all active text elements */}
                {!isEditingThis && (
                  <>
                    <div
                      className="text-resize-handle absolute -right-1 -bottom-1 w-6 h-6 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-nwse-resize flex items-center justify-center shadow-lg"
                      onMouseDown={(e) => handleTextElementResizeDown(e, element.id, style)}
                    >
                      <div className="w-3 h-3 border-r-2 border-b-2 border-white"></div>
                    </div>
                  </>
                )}

                {isEditingThis ? (
                  <div
                    ref={inputRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleEditInput}
                    onBlur={() => handleEditComplete(element.id)}
                    onKeyDown={handleEditKeyDown}
                    className="bg-transparent border-none outline-none"
                    style={{
                      fontFamily: style.fontFamily || 'Inter',
                      fontSize: `${style.fontSize || 18}px`,
                      color: style.color || '#ffffff',
                      textAlign: style.textAlign || 'center',
                      fontWeight: style.fontWeight || 'normal',
                      fontStyle: style.fontStyle || 'normal',
                      textDecoration: style.textDecoration || 'none',
                      textTransform: style.textTransform || 'none',
                      lineHeight: 1.4,
                      minHeight: '40px'
                    }}
                  >
                    {editText}
                  </div>
                ) : (
                  <div
                    style={{
                      fontFamily: style.fontFamily || 'Inter',
                      fontSize: `${style.fontSize || 18}px`,
                      textAlign: style.textAlign || 'center',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {/* Render words individually with per-word styling */}
                    {(element.text || '').split(/(\s+|\n)/).map((part, i) => {
                      if (part === '\n') return <br key={i} />;
                      if (part.match(/^\s+$/)) return <span key={i}>{part}</span>;
                      
                      const words = (element.text || '').split(/\s+/);
                      const wordIndex = words.indexOf(part);
                      const wordStyle = element.wordStyles?.[`${element.id}-${wordIndex}`] || {};
                      const isWordClicked = wordPopup?.type === 'element' && wordPopup?.elementId === element.id && wordPopup?.wordIndex === wordIndex;
                      const { x = 0, y = 0, animation, ...restWordStyle } = wordStyle;
                      
                      return (
                        <span
                          key={i}
                          style={{
                            display: 'inline-block',
                            position: 'relative',
                            transform: `translate(${x}px, ${y}px)`,
                            transition: draggingWord ? 'none' : 'transform 0.1s ease',
                            cursor: 'move',
                          }}
                          onMouseDown={(e) => handleWordMouseDown(e, element, wordIndex, true)}
                          onClick={(e) => {
                            if (setWordPopup) {
                              e.stopPropagation();
                              setWordPopup({
                                type: 'element',
                                word: part,
                                elementId: element.id,
                                position: { x: e.clientX, y: e.clientY },
                                caption: null,
                                wordIndex
                              });
                            }
                          }}
                        >
                          <span
                            className={animation ? `animate-${animation}` : ''}
                            style={{
                              display: 'inline-block',
                              fontFamily: restWordStyle.fontFamily || style.fontFamily || 'Inter',
                              fontSize: restWordStyle.fontSize ? `${restWordStyle.fontSize}px` : undefined,
                              fontWeight: restWordStyle.fontWeight || style.fontWeight || 'normal',
                              fontStyle: restWordStyle.fontStyle || style.fontStyle || 'normal',
                              textDecoration: restWordStyle.textDecoration || style.textDecoration || 'none',
                              textTransform: restWordStyle.textTransform || style.textTransform || 'none',
                              color: restWordStyle.color || style.color || '#ffffff',
                              backgroundColor: restWordStyle.backgroundColor 
                                ? `rgba(${parseInt(restWordStyle.backgroundColor.slice(1, 3), 16)}, ${parseInt(restWordStyle.backgroundColor.slice(3, 5), 16)}, ${parseInt(restWordStyle.backgroundColor.slice(5, 7), 16)}, ${restWordStyle.backgroundOpacity ?? 0.6})`
                                : (isWordClicked ? 'rgba(168, 85, 247, 0.3)' : undefined),
                              borderRadius: restWordStyle.backgroundColor ? '4px' : undefined,
                              padding: restWordStyle.backgroundPadding ? `${restWordStyle.backgroundPadding}px` : (isWordClicked ? '2px 4px' : undefined),
                              border: isWordClicked ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid transparent',
                              animation: animation && animation !== 'none' ? getAnimationStyle(animation) : 'none',
                              ...(restWordStyle.textGradient ? {
                                backgroundImage: restWordStyle.textGradient,
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              } : {})
                            }}
                          >
                            {part}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Word Click Popup */}
          {wordPopup && (
            <WordClickPopup
              word={wordPopup.word}
              position={wordPopup.position}
              onEdit={() => {
                setWordPopup(null);
                if (wordPopup.type === 'element') {
                  const element = captions.find(c => c.id === wordPopup.elementId);
                  if (element) handleCaptionDoubleClick(new Event('dblclick'), element);
                } else {
                  handleCaptionDoubleClick(new Event('dblclick'), wordPopup.caption);
                }
              }}
              onClose={() => setWordPopup(null)}
              currentStyle={(() => {
                if (wordPopup.type === 'element') {
                  const element = captions.find(c => c.id === wordPopup.elementId);
                  return element?.wordStyles?.[`${wordPopup.elementId}-${wordPopup.wordIndex}`] || {};
                }
                const freshCaption = captions.find(c => c.id === wordPopup.caption?.id);
                return freshCaption?.wordStyles?.[`${wordPopup.caption?.id}-${wordPopup.wordIndex}`] || {};
              })()}
              onStyleChange={handleWordStyleChange}
              onHistoryRecord={addToHistory}
              isElementWord={wordPopup.type === 'element'}
            />
          )}

        </div>
      </div>
      
      {/* Animation keyframes */}
      <style>{`
        @keyframes rise {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pan {
          0% { transform: translateX(-30px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes wipe {
          0% { clip-path: inset(0 100% 0 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
        @keyframes blur {
          0% { filter: blur(10px); opacity: 0; }
          100% { filter: blur(0); opacity: 1; }
        }
        @keyframes succession {
          0% { transform: translateY(-10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes baseline {
          0% { transform: translateY(5px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes drift {
          0% { transform: translate(-10px, -10px); opacity: 0; }
          100% { transform: translate(0, 0); opacity: 1; }
        }
        @keyframes tectonic {
          0% { transform: translateX(-20px) rotate(-5deg); opacity: 0; }
          100% { transform: translateX(0) rotate(0); opacity: 1; }
        }
        @keyframes tumble {
          0% { transform: rotate(-180deg) scale(0.5); opacity: 0; }
          100% { transform: rotate(0) scale(1); opacity: 1; }
        }
      `}</style>
      
      {/* Video controls */}
      <div className="mt-4 space-y-3 px-2">
        {/* Progress bar */}
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        
        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>
            
            <div className="flex items-center gap-2 group">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="h-8 w-8 text-gray-400 hover:text-white"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <div className="w-0 overflow-hidden group-hover:w-24 pl-2 transition-all duration-300 ease-in-out">
                 <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.05}
                  onValueChange={([val]) => {
                    setVolume(val);
                    if (val > 0) setIsMuted(false);
                  }}
                  className="w-20 cursor-pointer py-4"
                />
              </div>
            </div>
          </div>
          
          <span className="text-sm text-gray-400 font-mono">
            {formatTime(currentTime)} / {formatTime(duration || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}