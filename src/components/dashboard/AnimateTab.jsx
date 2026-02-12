import React from 'react';

// Word animations for selected word
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

export default function AnimateTab({ selectedCaption, captions, setCaptions }) {
  // Sync selected animation with selected caption's animation
  const currentAnimation = selectedCaption?.animation || 'none';

  const handleAnimationSelect = (animValue) => {
    if (selectedCaption && setCaptions) {
      setCaptions(prev => prev.map(cap => {
        if (cap.id === selectedCaption.id) {
          return {
            ...cap,
            animation: animValue // Apply to entire caption
          };
        }
        return cap;
      }));
    }
  };

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      <h2 className="text-lg font-semibold text-white mb-6">Animate Line</h2>
      
      <div className="space-y-4">
        {!selectedCaption ? (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-200">
              Select a caption to apply animation to the entire line.
            </p>
          </div>
        ) : (
          <>
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-xs text-gray-400 mb-1">Selected Caption</p>
              <p className="text-sm text-white font-medium line-clamp-2">"{selectedCaption.text}"</p>
            </div>

            {/* Animation Grid */}
            <div>
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">General</p>
              <div className="grid grid-cols-3 gap-2">
                {wordAnimations.map(anim => (
                  <button
                    key={anim.value}
                    onClick={() => handleAnimationSelect(anim.value)}
                    className={`
                      relative group overflow-hidden rounded-xl p-3 transition-all duration-300 border
                      ${currentAnimation === anim.value 
                        ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                        : 'bg-zinc-900/50 border-white/5 hover:border-white/20 hover:bg-zinc-800/80 hover:shadow-lg hover:shadow-purple-500/5'}
                    `}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative flex flex-col items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-md transition-all duration-300
                        ${currentAnimation === anim.value 
                          ? 'bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/20 scale-110' 
                          : 'bg-white/5 group-hover:bg-white/10 group-hover:scale-105'}
                      `}>
                         <div className={`w-3 h-3 rounded-full bg-white/90 ${anim.value !== 'none' ? 'animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'opacity-50'}`} />
                      </div>
                      
                      <span className={`text-[10px] font-semibold tracking-wider uppercase transition-colors duration-300 ${
                        currentAnimation === anim.value ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                      }`}>
                        {anim.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Preview info */}
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20">
          <p className="text-xs text-gray-400 mb-1">How it works</p>
          <p className="text-xs text-white leading-relaxed space-y-2">
            Select an animation to apply it to the entire caption line.
            <br /><br />
            For single word animation, click on a single word & use the floating word editor to animate specific words.
          </p>
        </div>
      </div>
    </div>
  );
}