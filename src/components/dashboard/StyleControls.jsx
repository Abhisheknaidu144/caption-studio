import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  RotateCcw,
  Type,
  Underline,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';

// UPDATED FONT LIBRARY FROM SCREENSHOTS
const fonts = [
  { value: 'Anton', label: 'Anton' },
  { value: 'Archivo Black', label: 'Archivo Black' },
  { value: 'Arimo', label: 'Arimo' },
  { value: 'Bebas Neue', label: 'Bebas Neue' },
  { value: 'Bodoni Moda', label: 'Bodoni Moda' },
  { value: 'Cardo', label: 'Cardo' },
  { value: 'Cinzel', label: 'Cinzel' },
  { value: 'Comfortaa', label: 'Comfortaa' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
  { value: 'Exo 2', label: 'Exo 2' },
  { value: 'Fredoka', label: 'Fredoka' },
  { value: 'Hind', label: 'Hind (Hinglish Support)' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Josefin Sans', label: 'Josefin Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'League Spartan', label: 'League Spartan' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Marcellus', label: 'Marcellus' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Mulish', label: 'Mulish' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Orbitron', label: 'Orbitron' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Pacifico', label: 'Pacifico' },
  { value: 'Permanent Marker', label: 'Permanent Marker' },
  { value: 'Playfair Display', label: 'Playfair' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Quicksand', label: 'Quicksand' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Rock Salt', label: 'Rock Salt' },
  { value: 'Rubik', label: 'Rubik' },
  { value: 'Source Sans 3', label: 'Source Sans 3' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
  { value: 'Unna', label: 'Unna' },
  { value: 'Varela Round', label: 'Varela Round' },
  { value: 'Work Sans', label: 'Work Sans' }
];

const presetColors = [
  '#E91E63', '#ffffff', '#fef08a', '#22c55e', 
  '#3b82f6', '#a855f7', '#ec4899', '#ff6b35',
  '#fb923c'
];

const presetGradients = [
  { name: 'Fire', value: 'linear-gradient(to right, #facc15, #ef4444)' },
  { name: 'Electric', value: 'linear-gradient(to right, #a855f7, #3b82f6)' },
  { name: 'Ocean', value: 'linear-gradient(to right, #06b6d4, #2563eb)' },
  { name: 'Magic', value: 'linear-gradient(to right, #ec4899, #8b5cf6)' },
  { name: 'Nature', value: 'linear-gradient(to right, #4ade80, #0d9488)' },
  { name: 'Sunset', value: 'linear-gradient(to right, #fb923c, #db2777)' },
  { name: 'Night', value: 'linear-gradient(to right, #60a5fa, #4f46e5)' },
];

export default function StyleControls({ captionStyle, setCaptionStyle, setCaptionStyleRaw, addToHistory }) {
  const [customTextColor1, setCustomTextColor1] = useState('#667eea');
  const [customTextColor2, setCustomTextColor2] = useState('#764ba2');
  const [customHighlightColor1, setCustomHighlightColor1] = useState('#f093fb');
  const [customHighlightColor2, setCustomHighlightColor2] = useState('#f5576c');
  const [textColorHex, setTextColorHex] = useState('#ffffff');
  const [highlightColorHex, setHighlightColorHex] = useState('#facc15');
  const [showTextGradient, setShowTextGradient] = useState(false);
  const [showHighlightGradient, setShowHighlightGradient] = useState(false);
  const [showTextSolid, setShowTextSolid] = useState(false);
  const [showHighlightSolid, setShowHighlightSolid] = useState(false);

  const updateStyle = (key, value, skipHistory = false) => {
    if (!captionStyle) return;
    if (skipHistory && setCaptionStyleRaw) {
      setCaptionStyleRaw(prev => ({ ...prev, [key]: value }));
    } else if (setCaptionStyle) {
      setCaptionStyle(prev => ({ ...prev, [key]: value }));
    }
  };

  const createGradient = (color1, color2) => {
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  };

  const applyCustomTextGradient = (color1, color2) => {
    const gradient = createGradient(color1, color2);
    updateStyle('text_gradient', gradient);
    updateStyle('text_color', '#ffffff');
  };

  const applyCustomHighlightGradient = (color1, color2) => {
    const gradient = createGradient(color1, color2);
    updateStyle('highlight_gradient', gradient);
    updateStyle('highlight_color', '');
  };

  if (!captionStyle) return null;

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      <h2 className="text-lg font-semibold text-white mb-6">Styling</h2>
      
      <div className="space-y-6">
        {/* TYPOGRAPHY Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">TYPOGRAPHY</h3>
          
          {/* Font Family */}
          <div>
            <Label className="text-sm text-gray-400 mb-2 block">Font Family</Label>
            <Select
              value={captionStyle.font_family}
              onValueChange={(value) => updateStyle('font_family', value)}
            >
              <SelectTrigger className="bg-zinc-900 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {fonts.map(font => (
                  <SelectItem 
                    key={font.value} 
                    value={font.value}
                    className="text-white hover:bg-white/10"
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Font Size */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-gray-400">Font Size (All Text)</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{captionStyle.font_size || 18}px</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateStyle('font_size', 18)}
                  className="h-5 w-5 text-gray-500 hover:text-white"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Slider
              value={[captionStyle.font_size || 18]}
              onValueChange={([value]) => updateStyle('font_size', value, true)}
              onPointerDown={() => addToHistory && addToHistory()}
              min={12}
              max={60}
              step={1}
              className="cursor-pointer"
            />
          </div>
          
          {/* Line Spacing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-gray-400">Line Spacing</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{captionStyle.line_spacing || 1.4}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateStyle('line_spacing', 1.4)}
                  className="h-5 w-5 text-gray-500 hover:text-white"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Slider
              value={[captionStyle.line_spacing || 1.4]}
              onValueChange={([value]) => updateStyle('line_spacing', value, true)}
              onPointerDown={() => addToHistory && addToHistory()}
              min={1.0}
              max={2.5}
              step={0.1}
              className="cursor-pointer"
            />
          </div>

          {/* Anchor Text Box */}
          <div>
            <Label className="text-sm text-gray-400 mb-2 block">Anchor Text Box</Label>
            <div className="flex items-start gap-2">
              <Button
                variant={captionStyle.text_anchor === 'top' ? "default" : "outline"}
                size="icon"
                onClick={() => {
                  updateStyle('text_anchor', 'top');
                  updateStyle('line_spacing', 1.4);
                }}
                className={`h-8 w-8 ${captionStyle.text_anchor === 'top' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                title="Top Anchor (Grows down)"
              >
                <ArrowDownCircle className={`w-4 h-4 ${captionStyle.text_anchor === 'top' ? 'text-white' : 'text-gray-400'}`} />
              </Button>
              <Button
                variant={(!captionStyle.text_anchor || captionStyle.text_anchor === 'center') ? "default" : "outline"}
                size="icon"
                onClick={() => {
                  updateStyle('text_anchor', 'center');
                  updateStyle('line_spacing', 1.4);
                }}
                className={`h-8 w-8 ${(!captionStyle.text_anchor || captionStyle.text_anchor === 'center') ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                title="Center Anchor (Grows both ways)"
              >
                <AlignCenter className={`w-4 h-4 ${(!captionStyle.text_anchor || captionStyle.text_anchor === 'center') ? 'text-white' : 'text-gray-400'}`} />
              </Button>
              <Button
                variant={captionStyle.text_anchor === 'bottom' ? "default" : "outline"}
                size="icon"
                onClick={() => {
                  updateStyle('text_anchor', 'bottom');
                  updateStyle('line_spacing', 1.4);
                }}
                className={`h-8 w-8 ${captionStyle.text_anchor === 'bottom' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                title="Bottom Anchor (Grows up)"
              >
                <ArrowUpCircle className={`w-4 h-4 ${captionStyle.text_anchor === 'bottom' ? 'text-white' : 'text-gray-400'}`} />
              </Button>
            </div>
          </div>
          
          {/* Font Style Selector */}
          <div>
            <Label className="text-sm text-gray-400 mb-2 block">Style</Label>
            <Select
              value={`${captionStyle.font_weight || '500'}-${captionStyle.font_style || 'normal'}`}
              onValueChange={(value) => {
                const [weight, style] = value.split('-');
                updateStyle('font_weight', weight === '400' ? 'normal' : weight);
                updateStyle('font_style', style);
                updateStyle('is_bold', parseInt(weight) >= 700);
              }}
            >
              <SelectTrigger className="bg-zinc-900 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 max-h-80">
                <SelectItem value="300-normal" className="text-white hover:bg-white/10" style={{fontWeight: '300'}}>Light</SelectItem>
                <SelectItem value="400-normal" className="text-white hover:bg-white/10" style={{fontWeight: '400'}}>Regular</SelectItem>
                <SelectItem value="500-normal" className="text-white hover:bg-white/10" style={{fontWeight: '500'}}>Medium</SelectItem>
                <SelectItem value="600-normal" className="text-white hover:bg-white/10" style={{fontWeight: '600'}}>Semi Bold</SelectItem>
                <SelectItem value="700-normal" className="text-white hover:bg-white/10" style={{fontWeight: '700'}}>Bold</SelectItem>
                <SelectItem value="800-normal" className="text-white hover:bg-white/10" style={{fontWeight: '800'}}>Extra Bold</SelectItem>
                <SelectItem value="400-italic" className="text-white hover:bg-white/10" style={{fontWeight: '400', fontStyle: 'italic'}}>Regular Italic</SelectItem>
                <SelectItem value="700-italic" className="text-white hover:bg-white/10" style={{fontWeight: '700', fontStyle: 'italic'}}>Bold Italic</SelectItem>
              </SelectContent>
            </Select>
            </div>
        </div>
        
        {/* COLORS Section */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">COLORS</h3>
          
          {/* Text Color */}
          <div>
            <Label className="text-sm text-gray-400 mb-2 block">Text Color</Label>
            
            {/* Solid Toggle */}
            <button
              onClick={() => setShowTextSolid(!showTextSolid)}
              className="flex items-center justify-between w-full text-xs text-gray-400 hover:text-gray-300"
            >
              <span>Solid</span>
              <span>{showTextSolid ? '−' : '+'}</span>
            </button>
            
            {/* Color Grid - 7 in first row, 2 in second */}
            {showTextSolid && (
              <div className="mb-3 mt-2">
                <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                  <button
                    onClick={() => {
                      updateStyle('text_color', '#ffffff');
                      updateStyle('text_gradient', '');
                    }}
                    className={`h-8 rounded-md border-2 flex items-center justify-center ${
                      captionStyle.text_color === '#ffffff' && !captionStyle.text_gradient
                        ? 'border-white' 
                        : 'border-white/10'
                    } bg-zinc-800`}
                  >
                    <span className="text-[9px] text-gray-500">None</span>
                  </button>
                  {presetColors.slice(0, 6).map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        updateStyle('text_color', color);
                        updateStyle('text_gradient', '');
                      }}
                      className={`h-8 rounded-md border-2 transition-all ${
                        captionStyle.text_color === color && !captionStyle.text_gradient
                          ? 'border-white scale-105' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {presetColors.slice(6, 9).map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        updateStyle('text_color', color);
                        updateStyle('text_gradient', '');
                      }}
                      className={`h-8 rounded-md border-2 transition-all ${
                        captionStyle.text_color === color && !captionStyle.text_gradient
                          ? 'border-white scale-105' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div></div>
                </div>
              </div>
            )}
            
            {/* Color Picker */}
            <div className="flex items-center gap-2 p-2 mt-3 rounded-lg bg-white/[0.02] border border-white/5">
              <input
                type="color"
                value={captionStyle.text_color || '#ffffff'}
                onChange={(e) => {
                  updateStyle('text_color', e.target.value);
                  updateStyle('text_gradient', '');
                }}
                className="w-8 h-8 rounded cursor-pointer bg-transparent"
              />
              <span className="text-xs text-gray-400">Color Picker</span>
            </div>
            
            {/* Gradient Toggle */}
            <button
              onClick={() => setShowTextGradient(!showTextGradient)}
              className="flex items-center justify-between w-full mt-3 text-xs text-gray-400 hover:text-gray-300"
            >
              <span>Gradient</span>
              <span>{showTextGradient ? '−' : '+'}</span>
            </button>
            
            {showTextGradient && (
              <>
                <div className="mb-3 mt-2">
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    <button
                      onClick={() => {
                        updateStyle('text_gradient', '');
                        updateStyle('text_color', '#ffffff');
                      }}
                      className={`h-8 rounded-md border-2 flex items-center justify-center ${
                        !captionStyle.text_gradient
                          ? 'border-white' 
                          : 'border-white/10'
                      } bg-zinc-800`}
                    >
                      <span className="text-[9px] text-gray-500">None</span>
                    </button>
                    {presetGradients.slice(0, 3).map(gradient => (
                      <button
                        key={gradient.value}
                        onClick={() => {
                          updateStyle('text_gradient', gradient.value);
                          updateStyle('text_color', '#ffffff');
                        }}
                        className={`h-8 rounded-md border-2 transition-all ${
                          captionStyle.text_gradient === gradient.value
                            ? 'border-white scale-105' 
                            : 'border-white/10 hover:border-white/30'
                        }`}
                        style={{ background: gradient.value }}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {presetGradients.slice(3, 6).map(gradient => (
                      <button
                        key={gradient.value}
                        onClick={() => {
                          updateStyle('text_gradient', gradient.value);
                          updateStyle('text_color', '#ffffff');
                        }}
                        className={`h-8 rounded-md border-2 transition-all ${
                          captionStyle.text_gradient === gradient.value
                            ? 'border-white scale-105' 
                            : 'border-white/10 hover:border-white/30'
                        }`}
                        style={{ background: gradient.value }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Custom Gradient Picker */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <Plus className="w-4 h-4 text-gray-500" />
                  <input
                    type="color"
                    value={customTextColor1}
                    onChange={(e) => {
                      setCustomTextColor1(e.target.value);
                      applyCustomTextGradient(e.target.value, customTextColor2);
                    }}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent"
                  />
                  <input
                    type="color"
                    value={customTextColor2}
                    onChange={(e) => {
                      setCustomTextColor2(e.target.value);
                      applyCustomTextGradient(customTextColor1, e.target.value);
                    }}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent"
                  />
                  <span className="text-xs text-gray-500">Custom</span>
                </div>
              </>
            )}
          </div>
          
          {/* Highlight Word */}
          <div>
            <Label className="text-sm text-gray-400 mb-2 block">Highlight Word</Label>
            
            {/* Solid Toggle */}
            <button
              onClick={() => setShowHighlightSolid(!showHighlightSolid)}
              className="flex items-center justify-between w-full text-xs text-gray-400 hover:text-gray-300"
            >
              <span>Solid</span>
              <span>{showHighlightSolid ? '−' : '+'}</span>
            </button>
            
            {/* Color Grid - 7 in first row, 2 in second */}
            {showHighlightSolid && (
              <div className="mb-3 mt-2">
                <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                  <button
                    onClick={() => {
                      updateStyle('highlight_color', '');
                      updateStyle('highlight_gradient', '');
                    }}
                    className={`h-8 rounded-md border-2 flex items-center justify-center ${
                      !captionStyle.highlight_color && !captionStyle.highlight_gradient
                        ? 'border-white' 
                        : 'border-white/10'
                    } bg-zinc-800`}
                  >
                    <span className="text-[9px] text-gray-500">None</span>
                  </button>
                  {['#fef08a', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#ff6b35'].map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        updateStyle('highlight_color', color);
                        updateStyle('highlight_gradient', '');
                      }}
                      className={`h-8 rounded-md border-2 transition-all ${
                        captionStyle.highlight_color === color && !captionStyle.highlight_gradient
                          ? 'border-white scale-105' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {['#fb923c', '#E91E63'].map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        updateStyle('highlight_color', color);
                        updateStyle('highlight_gradient', '');
                      }}
                      className={`h-8 rounded-md border-2 transition-all ${
                        captionStyle.highlight_color === color && !captionStyle.highlight_gradient
                          ? 'border-white scale-105' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div></div>
                </div>
              </div>
            )}
            
            {/* Color Picker */}
            <div className="flex items-center gap-2 p-2 mt-3 rounded-lg bg-white/[0.02] border border-white/5">
              <input
                type="color"
                value={captionStyle.highlight_color || '#facc15'}
                onChange={(e) => {
                  updateStyle('highlight_color', e.target.value);
                  updateStyle('highlight_gradient', '');
                }}
                className="w-8 h-8 rounded cursor-pointer bg-transparent"
              />
              <span className="text-xs text-gray-400">Color Picker</span>
            </div>
            
            {/* Gradient Toggle */}
            <button
              onClick={() => setShowHighlightGradient(!showHighlightGradient)}
              className="flex items-center justify-between w-full mt-3 text-xs text-gray-400 hover:text-gray-300"
            >
              <span>Gradient</span>
              <span>{showHighlightGradient ? '−' : '+'}</span>
            </button>
            
            {showHighlightGradient && (
              <>
                <div className="mb-3 mt-2">
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    <button
                      onClick={() => {
                        updateStyle('highlight_gradient', '');
                        updateStyle('highlight_color', '');
                      }}
                      className={`h-8 rounded-md border-2 flex items-center justify-center ${
                        !captionStyle.highlight_gradient
                          ? 'border-white' 
                          : 'border-white/10'
                      } bg-zinc-800`}
                    >
                      <span className="text-[9px] text-gray-500">None</span>
                    </button>
                    {presetGradients.slice(0, 3).map(gradient => (
                      <button
                        key={gradient.value}
                        onClick={() => {
                          updateStyle('highlight_gradient', gradient.value);
                          updateStyle('highlight_color', '');
                        }}
                        className={`h-8 rounded-md border-2 transition-all ${
                          captionStyle.highlight_gradient === gradient.value
                            ? 'border-white scale-105' 
                            : 'border-white/10 hover:border-white/30'
                        }`}
                        style={{ background: gradient.value }}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {presetGradients.slice(3, 6).map(gradient => (
                      <button
                        key={gradient.value}
                        onClick={() => {
                          updateStyle('highlight_gradient', gradient.value);
                          updateStyle('highlight_color', '');
                        }}
                        className={`h-8 rounded-md border-2 transition-all ${
                          captionStyle.highlight_gradient === gradient.value
                            ? 'border-white scale-105' 
                            : 'border-white/10 hover:border-white/30'
                        }`}
                        style={{ background: gradient.value }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Custom Gradient Picker */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <Plus className="w-4 h-4 text-gray-500" />
                  <input
                    type="color"
                    value={customHighlightColor1}
                    onChange={(e) => {
                      setCustomHighlightColor1(e.target.value);
                      applyCustomHighlightGradient(e.target.value, customHighlightColor2);
                    }}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent"
                  />
                  <input
                    type="color"
                    value={customHighlightColor2}
                    onChange={(e) => {
                      setCustomHighlightColor2(e.target.value);
                      applyCustomHighlightGradient(customHighlightColor1, e.target.value);
                    }}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent"
                  />
                  <span className="text-xs text-gray-500">Custom</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* ADVANCED Section */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">ADVANCED</h3>

          {/* Text Alignment */}
          <div>
            <Label className="text-sm text-gray-400 mb-2 block">Text Alignment</Label>
            <div className="bg-zinc-900 border border-white/5 rounded-lg p-1 flex gap-1">
              <button
                onClick={() => updateStyle('text_align', 'left')}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${
                  captionStyle.text_align === 'left' 
                    ? "bg-purple-600 text-white shadow-sm" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateStyle('text_align', 'center')}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${
                  captionStyle.text_align === 'center' 
                    ? "bg-purple-600 text-white shadow-sm" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateStyle('text_align', 'right')}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${
                  captionStyle.text_align === 'right' 
                    ? "bg-purple-600 text-white shadow-sm" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Case */}
          <div>
            <Label className="text-sm text-gray-400 mb-2 block">Case</Label>
            <div className="bg-zinc-900 border border-white/5 rounded-lg p-1 flex gap-1">
              <button
                onClick={() => {
                  updateStyle('text_case', 'lowercase');
                  updateStyle('is_caps', false);
                }}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all ${
                  captionStyle.text_case === 'lowercase' 
                    ? "bg-purple-600 text-white shadow-sm" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                aa
              </button>
              <button
                onClick={() => {
                  updateStyle('text_case', 'capitalize');
                  updateStyle('is_caps', false);
                }}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all ${
                  captionStyle.text_case === 'capitalize' 
                    ? "bg-purple-600 text-white shadow-sm" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Aa
              </button>
              <button
                onClick={() => {
                  updateStyle('text_case', 'uppercase');
                  updateStyle('is_caps', true);
                }}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all ${
                  (captionStyle.text_case === 'uppercase' || captionStyle.is_caps) 
                    ? "bg-purple-600 text-white shadow-sm" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                AA
              </button>
            </div>
          </div>
          
          {/* Position X */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-gray-400">Position X</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{captionStyle.position_x || 50}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateStyle('position_x', 50)}
                  className="h-5 w-5 text-gray-500 hover:text-white"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Slider
              value={[captionStyle.position_x || 50]}
              onValueChange={([value]) => updateStyle('position_x', value, true)}
              onPointerDown={() => addToHistory && addToHistory()}
              min={0}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>

          {/* Position Y */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-gray-400">Position Y</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{captionStyle.position_y || 75}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateStyle('position_y', 75)}
                  className="h-5 w-5 text-gray-500 hover:text-white"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Slider
              value={[captionStyle.position_y || 75]}
              onValueChange={([value]) => updateStyle('position_y', value, true)}
              onPointerDown={() => addToHistory && addToHistory()}
              min={5}
              max={95}
              step={1}
              className="cursor-pointer"
            />
          </div>
          
          {/* Letter Spacing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-gray-400">Letter Spacing</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{captionStyle.letter_spacing || 0}px</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateStyle('letter_spacing', 0)}
                  className="h-5 w-5 text-gray-500 hover:text-white"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Slider
              value={[captionStyle.letter_spacing || 0]}
              onValueChange={([value]) => updateStyle('letter_spacing', value, true)}
              onPointerDown={() => addToHistory && addToHistory()}
              min={-5}
              max={10}
              step={0.5}
              className="cursor-pointer"
            />
          </div>
          
          {/* Word Spacing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-gray-400">Word Spacing</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{captionStyle.word_spacing || 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateStyle('word_spacing', 1)}
                  className="h-5 w-5 text-gray-500 hover:text-white"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Slider
              value={[captionStyle.word_spacing || 1]}
              onValueChange={([value]) => updateStyle('word_spacing', value, true)}
              onPointerDown={() => addToHistory && addToHistory()}
              min={0}
              max={10}
              step={1}
              className="cursor-pointer"
            />
          </div>
          
          {/* Background Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-gray-400">Background</Label>
            <Switch
              checked={!!captionStyle.has_background}
              onCheckedChange={(checked) => updateStyle('has_background', checked)}
            />
          </div>
          
          {!!captionStyle.has_background && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm text-gray-400">Background Opacity</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{Math.round((captionStyle.background_opacity || 0.7) * 100)}%</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateStyle('background_opacity', 0.7)}
                      className="h-5 w-5 text-gray-500 hover:text-white"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Slider
                  value={[(captionStyle.background_opacity || 0.7) * 100]}
                  onValueChange={([value]) => updateStyle('background_opacity', value / 100, true)}
                  onPointerDown={() => addToHistory && addToHistory()}
                  min={0}
                  max={100}
                  step={5}
                  className="cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm text-gray-400">Background Thickness</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{captionStyle.background_padding || 8}px</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateStyle('background_padding', 8)}
                      className="h-5 w-5 text-gray-500 hover:text-white"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Slider
                  value={[captionStyle.background_padding || 8]}
                  onValueChange={([value]) => updateStyle('background_padding', value, true)}
                  onPointerDown={() => addToHistory && addToHistory()}
                  min={2}
                  max={20}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            </>
          )}
          
          {/* Stroke */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-gray-400">Stroke</Label>
            <Switch
              checked={captionStyle.has_stroke || false}
              onCheckedChange={(checked) => updateStyle('has_stroke', checked)}
            />
          </div>
          
          {/* Shadow */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-gray-400">Shadow</Label>
            <Switch
              checked={captionStyle.has_shadow || false}
              onCheckedChange={(checked) => updateStyle('has_shadow', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}