import React from 'react';
import { Button } from '@/components/ui/button';
import { Type, Heading1, Heading2 } from 'lucide-react';

export default function TextTab({ captions, setCaptions, currentTime }) {
  const addTextElement = (type) => {
    // Check limit
    const activeTextCount = captions.filter(c => c.isTextElement).length;
    if (activeTextCount >= 6) {
      alert("You can only add up to 6 text boxes.");
      return;
    }

    const defaultText = type === 'heading' ? 'Heading' : type === 'subheading' ? 'Subheading' : type === 'body' ? 'Body text' : 'Text Box';
    
    // Alignment Logic: Match speech caption below or default to 3s
    const activeSpeechCaption = captions.find(c => !c.isTextElement && currentTime >= c.start_time && currentTime < c.end_time);
    const startTime = activeSpeechCaption ? activeSpeechCaption.start_time : (currentTime || 0);
    const endTime = activeSpeechCaption ? activeSpeechCaption.end_time : (startTime + 3);

    const newCaption = {
      id: `text-${Date.now()}-${Math.random()}`,
      text: defaultText,
      start_time: startTime,
      end_time: endTime,
      type: type,
      isTextElement: true,
      // Professional default styling
      customStyle: {
        top: 50, // Percentage
        left: 50, // Percentage
        width: 300, // px
        fontSize: type === 'heading' ? 32 : type === 'subheading' ? 24 : type === 'body' ? 14 : 18,
        backgroundColor: '#000000',
        backgroundOpacity: 0.6,
        color: '#ffffff',
        borderRadius: 12,
        padding: 8,
        textAlign: 'center',
        fontWeight: type === 'heading' ? 'bold' : 'normal',
        zIndex: 50 // Ensure it overlaps existing captions
      }
    };

    setCaptions(prev => [...prev, newCaption]);
  };

  const addFontCombo = (preset) => {
    // Check limit
    const activeTextCount = captions.filter(c => c.isTextElement).length;
    if (activeTextCount >= 6) {
      alert("You can only add up to 6 text boxes.");
      return;
    }

    const activeSpeechCaption = captions.find(c => !c.isTextElement && currentTime >= c.start_time && currentTime < c.end_time);
    const startTime = activeSpeechCaption ? activeSpeechCaption.start_time : (currentTime || 0);
    const endTime = activeSpeechCaption ? activeSpeechCaption.end_time : (startTime + 3);

    const newCaption = {
      id: `text-${Date.now()}-${Math.random()}`,
      text: preset.text,
      start_time: startTime,
      end_time: endTime,
      type: 'combo',
      isTextElement: true,
      customStyle: {
        top: 50,
        left: 50,
        width: 300,
        fontSize: preset.fontSize,
        backgroundColor: preset.backgroundColor || '#000000',
        backgroundOpacity: preset.backgroundOpacity || 0.6,
        color: preset.color,
        borderRadius: 12,
        padding: 8,
        textAlign: 'center',
        fontFamily: preset.fontFamily,
        fontWeight: preset.fontWeight || 'normal',
        fontStyle: preset.fontStyle || 'normal',
        textTransform: preset.textTransform || 'none',
        zIndex: 50
      }
    };

    setCaptions(prev => [...prev, newCaption]);
  };

  const fontCombos = [
    { text: 'Thank you!', fontFamily: 'Pacifico', fontSize: 28, color: '#4A90E2', fontStyle: 'italic' },
    { text: 'Coffee Break', fontFamily: 'Satisfy', fontSize: 24, color: '#4CAF50' },
    { text: 'FIRE\naway', fontFamily: 'Bebas Neue', fontSize: 32, color: '#FF5722', fontWeight: 'bold' },
    { text: 'GOLDEN\nHOUR', fontFamily: 'Playfair Display', fontSize: 28, color: '#FFD700', textTransform: 'uppercase' },
    { text: 'love you', fontFamily: 'Dancing Script', fontSize: 26, color: '#E91E63', fontStyle: 'italic' },
    { text: 'HAPPY\nBIRTHDAY', fontFamily: 'Bebas Neue', fontSize: 30, color: '#FFFFFF', fontWeight: 'bold', textTransform: 'uppercase' },
    { text: 'LIKE &\nSUBSCRIBE', fontFamily: 'Anton', fontSize: 24, color: '#FFC107', textTransform: 'uppercase' },
    { text: 'THANK\nYOU', fontFamily: 'Bebas Neue', fontSize: 32, color: '#F44336', fontWeight: 'bold', textTransform: 'uppercase' },
    { text: 'Merry\nChristmas', fontFamily: 'Satisfy', fontSize: 26, color: '#4CAF50', fontStyle: 'italic' },
    { text: 'GLOW', fontFamily: 'Bebas Neue', fontSize: 36, color: '#E91E63', fontWeight: 'bold', textTransform: 'uppercase' },
    { text: 'Thank you!', fontFamily: 'Pacifico', fontSize: 28, color: '#FF6B6B', fontStyle: 'italic' },
    { text: 'engaged!', fontFamily: 'Dancing Script', fontSize: 24, color: '#FFFFFF', fontStyle: 'italic' },
  ];

  return (
    <div className="h-full flex flex-col space-y-3 overflow-y-auto pr-2 custom-scrollbar">
      <button
        onClick={() => addTextElement('textbox')}
        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium flex items-center justify-center gap-2 transition-all"
      >
        <Type className="w-5 h-5" />
        Add a text box
      </button>

      <button
        onClick={() => addTextElement('heading')}
        className="w-full py-3 px-4 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/5 text-white font-medium text-left transition-all"
      >
        Add a heading
      </button>

      <button
        onClick={() => addTextElement('subheading')}
        className="w-full py-3 px-4 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/5 text-white font-medium text-left transition-all"
      >
        Add a subheading
      </button>

      <button
        onClick={() => addTextElement('body')}
        className="w-full py-3 px-4 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/5 text-gray-300 text-sm text-left transition-all"
      >
        Add a little bit of body text
      </button>

      {/* Font Combinations */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Font combinations</h3>
        <div className="grid grid-cols-2 gap-2">
          {fontCombos.map((combo, idx) => (
            <button
              key={idx}
              onClick={() => addFontCombo(combo)}
              className="h-24 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/10 transition-all flex items-center justify-center p-3 overflow-hidden"
            >
              <span
                style={{
                  fontFamily: combo.fontFamily,
                  fontSize: `${combo.fontSize * 0.4}px`,
                  color: combo.color,
                  fontWeight: combo.fontWeight || 'normal',
                  fontStyle: combo.fontStyle || 'normal',
                  textTransform: combo.textTransform || 'none',
                  textAlign: 'center',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.2
                }}
              >
                {combo.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}