import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Edit3, 
  X,
  Type, 
  Palette, 
  Plus,
  Trash2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Move,
  RotateCcw,
  ALargeSmall,
  CaseSensitive
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import { motion, useDragControls } from 'framer-motion';

const fonts = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Bebas Neue', label: 'Bebas Neue' },
  { value: 'Playfair Display', label: 'Playfair' },
];

const presetColors = [
  '#ffffff', '#000000', '#facc15', '#ef4444', 
  '#3b82f6', '#a855f7', '#ec4899', '#22c55e'
];

const presetGradients = [
  'linear-gradient(to right, #facc15, #ef4444)', // Yellow-Red (Fire)
  'linear-gradient(to right, #a855f7, #3b82f6)', // Purple-Blue (Electric)
  'linear-gradient(to right, #06b6d4, #2563eb)', // Cyan-DeepBlue (Ocean)
  'linear-gradient(to right, #ec4899, #8b5cf6)', // Pink-Purple (Magic)
  'linear-gradient(to right, #4ade80, #0d9488)', // Green-Teal (Nature)
  'linear-gradient(to right, #fb923c, #db2777)', // Orange-Pink (Sunset)
  'linear-gradient(to right, #60a5fa, #4f46e5)', // Blue-Indigo (Night)
];

const wordAnimations = [
  { value: 'none', label: 'None' },
  { value: 'rise', label: 'Rise' },
  { value: 'pan', label: 'Pan' },
  { value: 'fade', label: 'Fade' },
  { value: 'pop', label: 'Pop' },
  { value: 'wipe', label: 'Wipe' },
  { value: 'blur', label: 'Blur' },
  { value: 'succession', label: 'Succession' },
  { value: 'breathe', label: 'Breathe' },
  { value: 'baseline', label: 'Baseline' },
  { value: 'drift', label: 'Drift' },
  { value: 'tectonic', label: 'Tectonic' },
  { value: 'tumble', label: 'Tumble' }
];

export default function WordClickPopup({ word, position, onEdit, onClose, currentStyle, onStyleChange, onHistoryRecord, videoContainerRef }) {
  const dragControls = useDragControls();
  if (!position) return null;
  
  // Local state for active tab - Font first as requested
  const [activeTab, setActiveTab] = useState('font');
  const [showTextGradient, setShowTextGradient] = useState(false);
  const [showHighlightGradient, setShowHighlightGradient] = useState(false);
  const [customColor1, setCustomColor1] = useState('#667eea');
  const [customColor2, setCustomColor2] = useState('#764ba2');
  const createGradient = (c1, c2) => `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-transparent"
        onClick={(e) => {
          onClose();
        }}
      />
      
      {/* Popup Panel - Anchored to right of video preview, vertically centered */}
      <motion.div
        drag
        dragListener={false}
        dragControls={dragControls}
        dragMomentum={false}
        className="fixed z-50 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden w-80"
        style={{
          position: 'fixed',
          top: '160px',
          // Adjusted to 360px to clear the right sidebar and sit beside the canvas
          right: '360px', 
          maxHeight: 'calc(100vh - 200px)',
          backgroundColor: 'rgba(24, 24, 27, 0.95)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Header with Drag Handle */}
        <div 
          className="flex items-center justify-between p-3 border-b border-white/5 bg-white/5 cursor-move"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="flex items-center gap-2 max-w-[180px]">
            <Move className="w-4 h-4 text-gray-500 shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider leading-none">Editing:</span>
              <span className="text-xs font-bold text-white truncate leading-tight">{word}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {(currentStyle.x || currentStyle.y) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onStyleChange('x', 0);
                  onStyleChange('y', 0);
                }}
                className="h-6 w-6 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                title="Reset Position"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs - Reordered: Font, Style, FX */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          <TabsList className="w-full grid grid-cols-3 rounded-none bg-transparent border-b border-white/5 p-0 h-10">
            <TabsTrigger 
              value="font" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-500 h-10 text-xs"
            >
              <Type className="w-3.5 h-3.5 mr-1.5" />
              Font
            </TabsTrigger>
            <TabsTrigger 
              value="style" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-500 h-10 text-xs"
            >
              <Palette className="w-3.5 h-3.5 mr-1.5" />
              Style
            </TabsTrigger>
            <TabsTrigger 
              value="fx" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-500 h-10 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Animate
            </TabsTrigger>
          </TabsList>

          <div 
            className="p-4 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar bg-zinc-950/95" 
            onPointerDown={(e) => e.stopPropagation()}
          >
           
            {/* Font Tab (Now First) */}
            <TabsContent value="font" className="space-y-4 mt-0">
               {/* Font Family */}
               <div>
                <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">Font Family</label>
                <Select
                  value={currentStyle.fontFamily || 'Inter'}
                  onValueChange={(value) => onStyleChange('fontFamily', value)}
                >
                  <SelectTrigger className="h-8 bg-zinc-900 border-white/10 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {fonts.map(font => (
                      <SelectItem key={font.value} value={font.value} className="text-white text-xs">
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div>
                <div className="flex justify-between mb-1">
                   <label className="text-xs text-gray-500 uppercase tracking-wider">Size</label>
                   <span className="text-xs text-white">{currentStyle.fontSize || 'Auto'}</span>
                </div>
                <Slider
                  value={[currentStyle.fontSize || 18]}
                  onValueChange={([val]) => onStyleChange('fontSize', val, true)}
                  onPointerDown={() => onHistoryRecord && onHistoryRecord()}
                  min={12}
                  max={60}
                  step={1}
                  className="cursor-pointer"
                />
              </div>

               {/* Formatting */}
               <div>
                  <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">Formatting</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-8 w-8 p-0 ${currentStyle.fontWeight === 'bold' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                      onClick={() => onStyleChange('fontWeight', currentStyle.fontWeight === 'bold' ? 'normal' : 'bold')}
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-8 w-8 p-0 ${currentStyle.fontStyle === 'italic' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                      onClick={() => onStyleChange('fontStyle', currentStyle.fontStyle === 'italic' ? 'normal' : 'italic')}
                      >
                      <Italic className="w-4 h-4" />
                    </Button>
                      <Button
                      size="sm"
                      variant="ghost"
                      className={`h-8 w-8 p-0 ${currentStyle.textDecoration === 'underline' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                      onClick={() => onStyleChange('textDecoration', currentStyle.textDecoration === 'underline' ? 'none' : 'underline')}
                      >
                      <Underline className="w-4 h-4" />
                    </Button>
                      <Button
                      size="sm"
                      variant="ghost"
                      className={`h-8 w-8 p-0 ${currentStyle.textDecoration === 'line-through' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                      onClick={() => onStyleChange('textDecoration', currentStyle.textDecoration === 'line-through' ? 'none' : 'line-through')}
                      >
                      <Strikethrough className="w-4 h-4" />
                    </Button>
                      </div>

                      {/* Text Transform */}
                      <div className="mt-3">
                      <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">Casing</label>
                      <div className="flex bg-white/5 rounded-md p-0.5">
                      {['none', 'uppercase', 'lowercase', 'capitalize'].map((casing) => (
                       <button
                         key={casing}
                         onClick={() => onStyleChange('textTransform', casing)}
                         className={`flex-1 py-1 text-[10px] rounded transition-all ${
                           (currentStyle.textTransform === casing || (!currentStyle.textTransform && casing === 'none'))
                             ? 'bg-purple-600 text-white'
                             : 'text-gray-400 hover:text-white'
                         }`}
                       >
                         {casing === 'none' ? 'Aa' : casing === 'uppercase' ? 'AA' : casing === 'lowercase' ? 'aa' : 'A'}
                       </button>
                      ))}
                      </div>
                      </div>

                      {/* Position Controls */}
                      <div className="mt-3 pt-3 border-t border-white/5">
                      <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">Position</label>

                      {/* Position X */}
                      <div className="mb-2">
                        <div className="flex justify-between mb-1">
                           <span className="text-[10px] text-gray-400">Position X</span>
                           <span className="text-[10px] text-white">{Math.round(currentStyle.x || 0)}px</span>
                        </div>
                        <Slider
                          value={[currentStyle.x || 0]}
                          onValueChange={([val]) => onStyleChange('x', val, true)}
                          onPointerDown={() => onHistoryRecord && onHistoryRecord()}
                          min={-100}
                          max={100}
                          step={1}
                          className="cursor-pointer"
                        />
                      </div>

                      {/* Position Y */}
                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                           <span className="text-[10px] text-gray-400">Position Y</span>
                           <span className="text-[10px] text-white">{Math.round(currentStyle.y || 0)}px</span>
                        </div>
                        <Slider
                          value={[currentStyle.y || 0]}
                          onValueChange={([val]) => onStyleChange('y', val, true)}
                          onPointerDown={() => onHistoryRecord && onHistoryRecord()}
                          min={-100}
                          max={100}
                          step={1}
                          className="cursor-pointer"
                        />
                      </div>
                      </div>
                      </div>
                      </TabsContent>

            {/* Style Tab (Now Second) */}
            <TabsContent value="style" className="space-y-4 mt-0">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-200/80 mb-2">
                 Styles here apply to this specific word.
              </div>
              {/* Color */}
              <div>
                <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">Color</label>
                <div className="grid grid-cols-8 gap-1 mb-2">
                  {presetColors.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        onStyleChange('color', color);
                        onStyleChange('textGradient', '');
                      }}
                      className={`h-6 rounded border transition-all ${
                        (currentStyle.color === color && !currentStyle.textGradient)
                          ? 'border-white scale-110' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                   <div className="text-xs text-gray-400">Custom:</div>
                   <input
                    type="color"
                    value={currentStyle.color || '#ffffff'}
                    onChange={(e) => {
                      onStyleChange('color', e.target.value);
                      onStyleChange('textGradient', '');
                    }}
                    className="w-8 h-8 rounded bg-white/5 border border-white/10 cursor-pointer"
                  />
                </div>
              </div>

               {/* Text Gradient Toggle */}
               <button
                 onClick={() => setShowTextGradient(!showTextGradient)}
                 className="flex items-center justify-between w-full mt-3 text-xs text-gray-400 hover:text-gray-300"
               >
                 <span>Text Gradient</span>
                 <span>{showTextGradient ? '−' : '+'}</span>
               </button>

               {showTextGradient && (
                 <div className="mb-3 mt-2">
                   <div className="grid grid-cols-4 gap-1.5 mb-2">
                     <button
                       onClick={() => onStyleChange('textGradient', '')}
                       className={`h-8 rounded-md border-2 flex items-center justify-center ${
                         !currentStyle.textGradient ? 'border-white' : 'border-white/10'
                       } bg-zinc-800`}
                     >
                       <span className="text-[9px] text-gray-500">None</span>
                     </button>
                     {presetGradients.map(gradient => (
                       <button
                         key={gradient}
                         onClick={() => onStyleChange('textGradient', gradient)}
                         className={`h-8 rounded-md border-2 transition-all ${
                           currentStyle.textGradient === gradient
                             ? 'border-white scale-105' 
                             : 'border-white/10 hover:border-white/30'
                         }`}
                         style={{ background: gradient }}
                        />
                     ))}
                   </div>

                   {/* Custom Gradient Picker */}
                   <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                     <Plus className="w-4 h-4 text-gray-500" />
                     <input
                       type="color"
                       value={customColor1}
                       onChange={(e) => {
                         setCustomColor1(e.target.value);
                         onStyleChange('textGradient', createGradient(e.target.value, customColor2));
                       }}
                       className="w-8 h-8 rounded cursor-pointer bg-transparent"
                     />
                     <input
                       type="color"
                       value={customColor2}
                       onChange={(e) => {
                         setCustomColor2(e.target.value);
                         onStyleChange('textGradient', createGradient(customColor1, e.target.value));
                       }}
                       className="w-8 h-8 rounded cursor-pointer bg-transparent"
                     />
                     <span className="text-xs text-gray-500">Custom</span>
                   </div>
                 </div>
               )}

               {/* Background for Word */}
               <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Background</label>
                  <Switch 
                    checked={!!currentStyle.backgroundColor}
                    onCheckedChange={(checked) => {
                      onStyleChange('backgroundColor', checked ? '#000000' : '');
                      if (checked) onStyleChange('backgroundOpacity', 0.65);
                    }}
                  />
                </div>
                {!!currentStyle.backgroundColor && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                     <div className="text-xs text-gray-400">Color:</div>
                      <input
                        type="color"
                        value={currentStyle.backgroundColor}
                        onChange={(e) => onStyleChange('backgroundColor', e.target.value)}
                        className="w-8 h-8 rounded bg-white/5 border border-white/10 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-gray-400">Opacity</span>
                        <span className="text-[10px] text-gray-400">{Math.round((currentStyle.backgroundOpacity ?? 0.65) * 100)}%</span>
                      </div>
                      <Slider
                        value={[(currentStyle.backgroundOpacity ?? 0.65) * 100]}
                        onValueChange={([val]) => onStyleChange('backgroundOpacity', val / 100, true)}
                        onPointerDown={() => onHistoryRecord && onHistoryRecord()}
                        min={0}
                        max={100}
                        step={5}
                        className="cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-gray-400">Thickness</span>
                        <span className="text-[10px] text-gray-400">{currentStyle.backgroundPadding || 4}px</span>
                      </div>
                      <Slider
                        value={[currentStyle.backgroundPadding || 4]}
                        onValueChange={([val]) => onStyleChange('backgroundPadding', val, true)}
                        onPointerDown={() => onHistoryRecord && onHistoryRecord()}
                        min={0}
                        max={20}
                        step={1}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Highlight Gradient Toggle (Inside Background Section) */}
                <button
                  onClick={() => setShowHighlightGradient(!showHighlightGradient)}
                  className="flex items-center justify-between w-full mt-3 text-xs text-gray-400 hover:text-gray-300"
                >
                  <span>Highlight Gradient</span>
                  <span>{showHighlightGradient ? '−' : '+'}</span>
                </button>

                {showHighlightGradient && (
                  <div className="mb-3 mt-2">
                    <div className="grid grid-cols-4 gap-1.5 mb-2">
                      <button
                        onClick={() => onStyleChange('highlightGradient', '')}
                        className={`h-8 rounded-md border-2 flex items-center justify-center ${
                          !currentStyle.highlightGradient ? 'border-white' : 'border-white/10'
                        } bg-zinc-800`}
                      >
                        <span className="text-[9px] text-gray-500">None</span>
                      </button>
                      {presetGradients.map(gradient => (
                        <button
                          key={gradient}
                          onClick={() => onStyleChange('highlightGradient', gradient)}
                          className={`h-8 rounded-md border-2 transition-all ${
                            currentStyle.highlightGradient === gradient
                              ? 'border-white scale-105' 
                              : 'border-white/10 hover:border-white/30'
                          }`}
                          style={{ background: gradient }}
                          />
                      ))}
                    </div>

                    {/* Custom Highlight Gradient Picker */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                      <Plus className="w-4 h-4 text-gray-500" />
                      <input
                        type="color"
                        value={customColor1}
                        onChange={(e) => {
                          setCustomColor1(e.target.value);
                          onStyleChange('highlightGradient', createGradient(e.target.value, customColor2));
                        }}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent"
                      />
                      <input
                        type="color"
                        value={customColor2}
                        onChange={(e) => {
                          setCustomColor2(e.target.value);
                          onStyleChange('highlightGradient', createGradient(customColor1, e.target.value));
                        }}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent"
                      />
                      <span className="text-xs text-gray-500">Custom</span>
                    </div>
                  </div>
                )}
               </div>

               {/* Actions */}
              <div className="pt-2">
                <Button
                  onClick={onEdit}
                  className="w-full bg-white/10 hover:bg-white/20 text-white"
                  size="sm"
                >
                  <Edit3 className="w-3 h-3 mr-2" />
                  Edit Text Content
                </Button>
              </div>
            </TabsContent>

            {/* FX Tab */}
            <TabsContent value="fx" className="space-y-4 mt-0">
               {/* Animation */}
               <div>
                 <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">Animation</label>
                 <div className="grid grid-cols-3 gap-2">
                   {wordAnimations.map((anim) => (
                     <button
                       key={anim.value}
                       onClick={() => onStyleChange('animation', anim.value)}
                       className={`px-2 py-1.5 rounded text-xs capitalize transition-all border ${
                         (currentStyle.animation === anim.value || (!currentStyle.animation && anim.value === 'none'))
                           ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                           : 'bg-zinc-900 border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                       }`}
                     >
                       {anim.label}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Note about limitations */}
               <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] text-yellow-200/80 space-y-1">
                 <p>Some styles might overlap with global caption styles.</p>
                 <p className="opacity-80">These animations apply to this specific word only.</p>
               </div>
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </>
  );
}