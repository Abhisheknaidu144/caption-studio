import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const templates = [
  // --- Group 1: High-Retention & Viral (The "Hormozi/Beast" Class) ---
  {
    id: 'adrenaline_spike',
    name: 'The Adrenaline Spike',
    description: 'Ultra-fast, single word, max retention.',
    preview: 'WATCH THIS NOW',
    style: {
      font_family: 'Anton',
      font_size: 32,
      line_spacing: 1.1,
      is_bold: true,
      is_caps: true,
      text_color: '#ffffff',
      text_gradient: '',
      highlight_color: '#FFFF00', // Yellow
      has_background: false,
      has_shadow: true,
      has_stroke: true,
      position: 'middle',
      position_y: 50,
      caption_pace: 'ultra_fast',
      emphasis_strategy: 'keywords',
      visual_preset: 'bold_center'
    }
  },
  {
    id: 'scroll_stopper',
    name: 'The Scroll Stopper',
    description: 'Massive title hook, high energy.',
    preview: 'STOP SCROLLING',
    style: {
      font_family: 'Bebas Neue',
      font_size: 40,
      line_spacing: 1.0,
      is_bold: true,
      is_caps: true,
      text_color: '#ffffff',
      text_gradient: '',
      highlight_color: '#FF0000', // Red
      has_background: false,
      has_shadow: true,
      has_stroke: true,
      position: 'middle',
      position_y: 50,
      caption_pace: 'fast',
      emphasis_strategy: 'hook_first',
      visual_preset: 'bold_center'
    }
  },
  {
    id: 'action_command',
    name: 'The Action Command',
    description: 'Urgent, motivational commands.',
    preview: 'DO IT NOW',
    style: {
      font_family: 'Montserrat',
      font_size: 30,
      line_spacing: 1.2,
      is_bold: true,
      is_caps: true,
      text_color: '#ffffff',
      highlight_color: '#FF0000', // Red
      has_background: true,
      background_opacity: 0.9,
      background_color: '#000000',
      position: 'middle',
      position_y: 50,
      caption_pace: 'ultra_fast',
      emphasis_strategy: 'verbs',
      visual_preset: 'bold_center'
    }
  },
  {
    id: 'value_flash',
    name: 'The Value Flash',
    description: 'Metric-heavy, proof points.',
    preview: 'EARN $10,000',
    style: {
      font_family: 'Anton',
      font_size: 32,
      line_spacing: 1.1,
      is_bold: true,
      is_caps: true,
      text_color: '#ffffff',
      highlight_color: '#00FF00', // Green
      has_background: false,
      has_stroke: true,
      has_shadow: true,
      position: 'middle',
      position_y: 50,
      caption_pace: 'ultra_fast',
      emphasis_strategy: 'numbers',
      visual_preset: 'bold_center'
    }
  },
  {
    id: 'hypnotist',
    name: 'The Hypnotist',
    description: 'Rhythmic, hypnotic speed.',
    preview: 'LISTEN TO ME',
    style: {
      font_family: 'Oswald',
      font_size: 28,
      line_spacing: 1.2,
      is_bold: true,
      is_caps: true,
      text_color: '#ffffff',
      highlight_color: '',
      has_background: true,
      background_opacity: 0.8,
      position: 'middle',
      position_y: 50,
      caption_pace: 'ultra_fast',
      emphasis_strategy: 'none',
      visual_preset: 'bold_center'
    }
  },
  {
    id: 'karaoke_punch',
    name: 'The Karaoke Punch',
    description: 'Word-by-word active highlight.',
    preview: 'Learn This Skill',
    style: {
      font_family: 'Montserrat',
      font_size: 24,
      line_spacing: 1.3,
      is_bold: true,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#3b82f6', // Blue-ish
      has_background: true,
      background_opacity: 0.7,
      position: 'bottom',
      position_y: 70,
      caption_pace: 'fast',
      emphasis_strategy: 'keywords',
      visual_preset: 'highlighted_words'
    }
  },
  {
    id: 'bold_statement',
    name: 'The Bold Statement',
    description: 'Profound philosophy quotes.',
    preview: 'Reality Is A Choice',
    style: {
      font_family: 'Oswald',
      font_size: 26,
      line_spacing: 1.3,
      is_bold: true,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#ffffff', // White highlight often means invert
      has_background: true,
      background_opacity: 0.6,
      position: 'middle',
      position_y: 50,
      caption_pace: 'medium',
      emphasis_strategy: 'hook_first',
      visual_preset: 'bold_center'
    }
  },
  {
    id: 'gamer_overlay',
    name: 'The Gamer Overlay',
    description: 'Chaotic footage readable overlay.',
    preview: 'EPIC FAIL',
    style: {
      font_family: 'Bangers',
      font_size: 28,
      line_spacing: 1.2,
      is_bold: false,
      is_caps: true,
      text_color: '#ffffff',
      has_background: true,
      background_opacity: 1,
      background_color: '#000000',
      position: 'bottom',
      position_y: 80,
      caption_pace: 'ultra_fast',
      emphasis_strategy: 'verbs',
      visual_preset: 'subtitle_classic'
    }
  },
  {
    id: 'fact_checker',
    name: 'The Fact Checker',
    description: 'Data-driven, verified feel.',
    preview: 'Did You Know?',
    style: {
      font_family: 'Roboto',
      font_size: 22,
      line_spacing: 1.4,
      is_bold: true,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#00FF00', // Green for facts
      has_background: true,
      background_opacity: 0.8,
      position: 'bottom',
      position_y: 75,
      caption_pace: 'fast',
      emphasis_strategy: 'numbers',
      visual_preset: 'highlighted_words'
    }
  },
  {
    id: 'impact_frame',
    name: 'The Impact Frame',
    description: 'Visual payoff focus.',
    preview: 'See The Result',
    style: {
      font_family: 'Komika Axis', // Fallback to a fun font if not avail
      font_size: 24,
      line_spacing: 1.2,
      is_bold: true,
      is_caps: true,
      text_color: '#ffffff',
      has_background: false,
      has_stroke: true,
      has_shadow: true,
      position: 'bottom',
      position_y: 85,
      caption_pace: 'ultra_fast',
      emphasis_strategy: 'keywords',
      visual_preset: 'clean_bottom'
    }
  },

  // --- Group 2: Educational & Instructional (The "Abdaal/Professor" Class) ---
  {
    id: 'professor',
    name: 'The Professor',
    description: 'Step-by-step clarity.',
    preview: 'Step 1: Open Settings',
    style: {
      font_family: 'Inter',
      font_size: 20,
      line_spacing: 1.5,
      is_bold: true,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#facc15', // Yellow highlight
      has_background: true,
      background_opacity: 0.7,
      position: 'bottom',
      position_y: 80,
      caption_pace: 'medium',
      emphasis_strategy: 'keywords',
      visual_preset: 'clean_bottom'
    }
  },
  {
    id: 'soft_spoken',
    name: 'The Soft Spoken',
    description: 'Calm, aesthetic productivity.',
    preview: 'Focus on breathing',
    style: {
      font_family: 'Quicksand',
      font_size: 18,
      line_spacing: 1.6,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '',
      has_background: true,
      background_opacity: 0.4,
      position: 'bottom',
      position_y: 85,
      caption_pace: 'medium',
      emphasis_strategy: 'none',
      visual_preset: 'clean_bottom'
    }
  },
  {
    id: 'dynamic_lecturer',
    name: 'The Dynamic Lecturer',
    description: 'Fast-talking retention.',
    preview: 'Key Concept Here',
    style: {
      font_family: 'Montserrat',
      font_size: 22,
      line_spacing: 1.4,
      is_bold: true,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#f472b6', // Pinkish
      has_background: true,
      background_opacity: 0.6,
      position: 'bottom',
      position_y: 80,
      caption_pace: 'fast',
      emphasis_strategy: 'keywords',
      visual_preset: 'highlighted_words'
    }
  },
  {
    id: 'numbered_list',
    name: 'The Numbered List',
    description: 'Listicles and top 5s.',
    preview: '3. The Secret',
    style: {
      font_family: 'Oswald',
      font_size: 26,
      line_spacing: 1.3,
      is_bold: true,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#facc15',
      has_background: true,
      background_opacity: 0.8,
      position: 'middle',
      position_y: 50,
      caption_pace: 'medium',
      emphasis_strategy: 'numbers',
      visual_preset: 'bold_center'
    }
  },
  {
    id: 'deep_dive',
    name: 'The Deep Dive',
    description: 'Documentary style explainer.',
    preview: 'The Historical Context',
    style: {
      font_family: 'Merriweather',
      font_size: 20,
      line_spacing: 1.5,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      has_background: true,
      background_opacity: 0.9,
      background_color: '#000000',
      position: 'bottom',
      position_y: 80,
      caption_pace: 'slow',
      emphasis_strategy: 'keywords',
      visual_preset: 'subtitle_classic'
    }
  },
  {
    id: 'gentle_guide',
    name: 'The Gentle Guide',
    description: 'Yoga/Wellness instructions.',
    preview: 'Inhale deeply...',
    style: {
      font_family: 'Nunito',
      font_size: 20,
      line_spacing: 1.6,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#818cf8', // Soft indigo
      has_background: true,
      background_opacity: 0.5,
      position: 'bottom',
      position_y: 85,
      caption_pace: 'slow',
      emphasis_strategy: 'verbs',
      visual_preset: 'clean_bottom'
    }
  },
  {
    id: 'tech_reviewer',
    name: 'The Tech Reviewer',
    description: 'Specs and tech highlights.',
    preview: '4K 120Hz Display',
    style: {
      font_family: 'Roboto',
      font_size: 22,
      line_spacing: 1.4,
      is_bold: true,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#ef4444', // Tech red
      has_background: true,
      background_opacity: 0.8,
      position: 'bottom',
      position_y: 80,
      caption_pace: 'fast',
      emphasis_strategy: 'numbers',
      visual_preset: 'clean_bottom'
    }
  },
  {
    id: 'active_learner',
    name: 'The Active Learner',
    description: 'Language/Phonetics guide.',
    preview: 'Hola (Hello)',
    style: {
      font_family: 'Varela Round',
      font_size: 22,
      line_spacing: 1.4,
      is_bold: true,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#22c55e', // Green
      has_background: true,
      background_opacity: 0.7,
      position: 'bottom',
      position_y: 75,
      caption_pace: 'medium',
      emphasis_strategy: 'none',
      visual_preset: 'highlighted_words'
    }
  },
  {
    id: 'insight_highlight',
    name: 'The Insight Highlight',
    description: 'Podcast quotes.',
    preview: '"Mindset is everything"',
    style: {
      font_family: 'Lato',
      font_size: 20,
      line_spacing: 1.5,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      has_background: true,
      background_opacity: 0.8,
      background_color: '#000000',
      position: 'bottom',
      position_y: 80,
      caption_pace: 'medium',
      emphasis_strategy: 'hook_first',
      visual_preset: 'subtitle_classic'
    }
  },
  {
    id: 'academic',
    name: 'The Academic',
    description: 'Dense, philosophical text.',
    preview: 'Cognitive Dissonance',
    style: {
      font_family: 'Times New Roman', // Or generic serif
      font_size: 18,
      line_spacing: 1.6,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#fbbf24', // Amber
      has_background: true,
      background_opacity: 0.6,
      position: 'bottom',
      position_y: 80,
      caption_pace: 'slow',
      emphasis_strategy: 'keywords',
      visual_preset: 'clean_bottom'
    }
  },

  // --- Group 3: Cinematic & Narrative (The "Gadzhi/Noir" Class) ---
  {
    id: 'noir',
    name: 'The Noir',
    description: 'Luxury, minimal, cinematic.',
    preview: 'The Untold Story',
    style: {
      font_family: 'Montserrat',
      font_size: 16,
      line_spacing: 1.5,
      is_bold: false,
      is_caps: true,
      text_color: '#ffffff',
      highlight_color: '',
      has_background: false,
      has_shadow: true,
      position: 'bottom',
      position_y: 85,
      caption_pace: 'slow',
      emphasis_strategy: 'none',
      visual_preset: 'clean_bottom'
    }
  },
  {
    id: 'narrative_arc',
    name: 'The Narrative Arc',
    description: 'Travel stories, verbs focus.',
    preview: 'We Climbed Higher',
    style: {
      font_family: 'Raleway',
      font_size: 18,
      line_spacing: 1.4,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#ffffff', // Bold weight shift simulation
      has_background: true,
      background_opacity: 0.3,
      position: 'bottom',
      position_y: 85,
      caption_pace: 'medium',
      emphasis_strategy: 'verbs',
      visual_preset: 'clean_bottom'
    }
  },
  {
    id: 'luxury_standard',
    name: 'The Luxury Standard',
    description: 'Real estate, discreet data.',
    preview: '$25,000,000',
    style: {
      font_family: 'Playfair Display',
      font_size: 20,
      line_spacing: 1.4,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '',
      has_background: true,
      background_opacity: 0.4,
      position: 'bottom',
      position_y: 85,
      caption_pace: 'slow',
      emphasis_strategy: 'numbers',
      visual_preset: 'clean_bottom'
    }
  },
  {
    id: 'cinematic_karaoke',
    name: 'The Cinematic Karaoke',
    description: 'Lyrical, poetic mood.',
    preview: 'Fading into dark...',
    style: {
      font_family: 'Cormorant Garamond', // Or similar serif
      font_size: 22,
      line_spacing: 1.4,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#ffffff',
      text_opacity: 0.6, // Base opacity
      highlight_opacity: 1.0, // Active opacity (logic needs to support this)
      has_background: false,
      has_shadow: true,
      position: 'middle',
      position_y: 60,
      caption_pace: 'medium',
      emphasis_strategy: 'none',
      visual_preset: 'highlighted_words'
    }
  },
  {
    id: 'opening_title',
    name: 'The Opening Title',
    description: 'Chapter marker, massive.',
    preview: 'PART ONE',
    style: {
      font_family: 'Bebas Neue',
      font_size: 48,
      line_spacing: 1.0,
      is_bold: true,
      is_caps: true,
      text_color: '#ffffff',
      has_background: false,
      has_shadow: true,
      position: 'middle',
      position_y: 50,
      caption_pace: 'slow',
      emphasis_strategy: 'hook_first',
      visual_preset: 'bold_center'
    }
  },
  {
    id: 'dialogue_box',
    name: 'The Dialogue Box',
    description: 'Unclear dialogue/Translations.',
    preview: '- Hello there.',
    style: {
      font_family: 'Courier Prime',
      font_size: 18,
      line_spacing: 1.4,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      has_background: true,
      background_opacity: 0.9,
      background_color: '#000000',
      position: 'bottom',
      position_y: 85,
      caption_pace: 'medium',
      emphasis_strategy: 'none',
      visual_preset: 'subtitle_classic'
    }
  },
  {
    id: 'focus_pull',
    name: 'The Focus Pull',
    description: 'Monochromatic weight shift.',
    preview: 'The crucial moment',
    style: {
      font_family: 'Inter',
      font_size: 20,
      line_spacing: 1.4,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#ffffff', // Same color, just bold (simulated)
      has_background: false,
      has_shadow: true,
      position: 'bottom',
      position_y: 80,
      caption_pace: 'medium',
      emphasis_strategy: 'keywords',
      visual_preset: 'clean_bottom'
    }
  },
  {
    id: 'slow_burn',
    name: 'The Slow Burn',
    description: 'True crime suspense.',
    preview: 'Something was wrong...',
    style: {
      font_family: 'Special Elite', // Typewriter-ish
      font_size: 20,
      line_spacing: 1.5,
      is_bold: false,
      is_caps: false,
      text_color: '#e5e7eb',
      highlight_color: '#ef4444', // Red for tension
      has_background: true,
      background_opacity: 0.2,
      position: 'bottom',
      position_y: 80,
      caption_pace: 'slow',
      emphasis_strategy: 'hook_first',
      visual_preset: 'clean_bottom'
    }
  },
  {
    id: 'direct_address',
    name: 'The Direct Address',
    description: 'Crisis comms/CEO style.',
    preview: 'We Need To Talk',
    style: {
      font_family: 'Arial',
      font_size: 24,
      line_spacing: 1.3,
      is_bold: true,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '',
      has_background: true,
      background_opacity: 0.8,
      position: 'middle',
      position_y: 50,
      caption_pace: 'medium',
      emphasis_strategy: 'verbs',
      visual_preset: 'bold_center'
    }
  },
  {
    id: 'art_house',
    name: 'The Art House',
    description: 'Wes Anderson symmetry.',
    preview: 'The Grand Hotel',
    style: {
      font_family: 'Futura', // Or Jovanny/Century Gothic
      font_size: 22,
      line_spacing: 1.4,
      is_bold: true,
      is_caps: true,
      text_color: '#fcd34d', // Wes Anderson yellow
      has_background: false,
      has_shadow: true,
      position: 'middle',
      position_y: 50,
      caption_pace: 'slow',
      emphasis_strategy: 'none',
      visual_preset: 'bold_center'
    }
  },

  // --- Group 4: Sales & Conversion (The "Direct Response" Class) ---
  {
    id: 'offer_stack',
    name: 'The Offer Stack',
    description: 'Webinar value stacking.',
    preview: 'BONUS: $500 Value',
    style: {
      font_family: 'Impact',
      font_size: 30,
      line_spacing: 1.1,
      is_bold: false,
      is_caps: true,
      text_color: '#ffffff',
      highlight_color: '#22c55e', // Green
      has_background: true,
      background_opacity: 0.9,
      position: 'middle',
      position_y: 50,
      caption_pace: 'fast',
      emphasis_strategy: 'numbers',
      visual_preset: 'bold_center'
    }
  },
  {
    id: 'pain_point',
    name: 'The Pain Point',
    description: 'Agitation ads.',
    preview: 'Tired of ACNE?',
    style: {
      font_family: 'Anton',
      font_size: 32,
      line_spacing: 1.1,
      is_bold: true,
      is_caps: true,
      text_color: '#ffffff',
      highlight_color: '#FF0000', // Red
      has_background: false,
      has_stroke: true,
      position: 'middle',
      position_y: 50,
      caption_pace: 'fast',
      emphasis_strategy: 'keywords',
      visual_preset: 'bold_center'
    }
  },
  {
    id: 'call_to_action',
    name: 'The Call to Action',
    description: 'Final 5 seconds.',
    preview: 'CLICK LINK BELOW',
    style: {
      font_family: 'Montserrat',
      font_size: 36,
      line_spacing: 1.1,
      is_bold: true,
      is_caps: true,
      text_color: '#ffffff',
      highlight_color: '#3b82f6', // Blue
      has_background: true,
      background_opacity: 0.9,
      position: 'middle',
      position_y: 50,
      caption_pace: 'slow',
      emphasis_strategy: 'verbs',
      visual_preset: 'bold_center'
    }
  },
  {
    id: 'testimonial',
    name: 'The Testimonial',
    description: 'UGC reviews.',
    preview: '"Life Changing!"',
    style: {
      font_family: 'Inter',
      font_size: 20,
      line_spacing: 1.4,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#fbbf24', // Gold
      has_background: true,
      background_opacity: 0.8,
      background_color: '#000000',
      position: 'bottom',
      position_y: 80,
      caption_pace: 'medium',
      emphasis_strategy: 'keywords',
      visual_preset: 'subtitle_classic'
    }
  },
  {
    id: 'guarantee',
    name: 'The Guarantee',
    description: 'Trust building.',
    preview: '30 Day Money Back',
    style: {
      font_family: 'Verdana',
      font_size: 18,
      line_spacing: 1.4,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#22c55e', // Green
      has_background: true,
      background_opacity: 0.7,
      position: 'bottom',
      position_y: 85,
      caption_pace: 'medium',
      emphasis_strategy: 'numbers',
      visual_preset: 'clean_bottom'
    }
  },
  {
    id: 'urgent_update',
    name: 'The Urgent Update',
    description: 'Flash sale FOMO.',
    preview: 'ENDS TONIGHT',
    style: {
      font_family: 'Bebas Neue',
      font_size: 34,
      line_spacing: 1.1,
      is_bold: true,
      is_caps: true,
      text_color: '#ffffff',
      highlight_color: '#FF0000', // Red
      has_background: true,
      background_opacity: 0.9,
      position: 'middle',
      position_y: 50,
      caption_pace: 'ultra_fast',
      emphasis_strategy: 'hook_first',
      visual_preset: 'highlighted_words'
    }
  },
  {
    id: 'authority_figure',
    name: 'The Authority Figure',
    description: 'Medical/Legal, no gimmicks.',
    preview: 'Legal Requirement',
    style: {
      font_family: 'Georgia',
      font_size: 20,
      line_spacing: 1.4,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '',
      has_background: true,
      background_opacity: 0.7,
      position: 'bottom',
      position_y: 80,
      caption_pace: 'medium',
      emphasis_strategy: 'none',
      visual_preset: 'clean_bottom'
    }
  },
  {
    id: 'step_by_step_sell',
    name: 'The Step-By-Step Sell',
    description: 'DIY Product demos.',
    preview: 'Spray. Wipe. Done.',
    style: {
      font_family: 'Open Sans',
      font_size: 22,
      line_spacing: 1.3,
      is_bold: true,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#facc15', // Yellow
      has_background: true,
      background_opacity: 0.6,
      position: 'bottom',
      position_y: 75,
      caption_pace: 'fast',
      emphasis_strategy: 'verbs',
      visual_preset: 'highlighted_words'
    }
  },
  {
    id: 'discount_drop',
    name: 'The Discount Drop',
    description: 'Price drop visual.',
    preview: 'Only $49',
    style: {
      font_family: 'Oswald',
      font_size: 28,
      line_spacing: 1.2,
      is_bold: true,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#22c55e', // Green
      has_background: true,
      background_opacity: 0.9,
      background_color: '#000000',
      position: 'bottom',
      position_y: 80,
      caption_pace: 'fast',
      emphasis_strategy: 'numbers',
      visual_preset: 'subtitle_classic'
    }
  },
  {
    id: 'problem_solver',
    name: 'The Problem Solver',
    description: 'As-Seen-On-TV style.',
    preview: 'Removes Stains',
    style: {
      font_family: 'Arial',
      font_size: 22,
      line_spacing: 1.3,
      is_bold: true,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#3b82f6',
      has_background: true,
      background_opacity: 0.7,
      position: 'bottom',
      position_y: 85,
      caption_pace: 'fast',
      emphasis_strategy: 'keywords',
      visual_preset: 'clean_bottom'
    }
  },

  // --- Group 5: Hybrid & Experimental (The "Niche" Class) ---
  {
    id: 'subliminal',
    name: 'The Subliminal',
    description: 'Flash frame editing.',
    preview: 'Wait.',
    style: {
      font_family: 'Inter',
      font_size: 24,
      line_spacing: 1.2,
      is_bold: true,
      is_caps: true,
      text_color: '#ffffff',
      has_background: false,
      has_shadow: true,
      position: 'bottom',
      position_y: 80,
      caption_pace: 'ultra_fast',
      emphasis_strategy: 'none',
      visual_preset: 'clean_bottom'
    }
  },
  {
    id: 'big_data',
    name: 'The Big Data',
    description: 'Infographic style.',
    preview: '99.9%',
    style: {
      font_family: 'Roboto Mono',
      font_size: 40,
      line_spacing: 1.0,
      is_bold: true,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#3b82f6',
      has_background: false,
      has_shadow: true,
      position: 'middle',
      position_y: 50,
      caption_pace: 'slow',
      emphasis_strategy: 'numbers',
      visual_preset: 'bold_center'
    }
  },
  {
    id: 'interviewer',
    name: 'The Interviewer',
    description: 'Street interviews.',
    preview: '- What is your name?',
    style: {
      font_family: 'Roboto',
      font_size: 20,
      line_spacing: 1.4,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#facc15',
      has_background: true,
      background_opacity: 0.9,
      background_color: '#000000',
      position: 'bottom',
      position_y: 80,
      caption_pace: 'medium',
      emphasis_strategy: 'keywords',
      visual_preset: 'subtitle_classic'
    }
  },
  {
    id: 'silent_story',
    name: 'The Silent Story',
    description: 'Text-only narrative.',
    preview: 'It started here.',
    style: {
      font_family: 'Merriweather',
      font_size: 24,
      line_spacing: 1.4,
      is_bold: true,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#ef4444',
      has_background: false,
      has_shadow: true,
      position: 'middle',
      position_y: 50,
      caption_pace: 'slow',
      emphasis_strategy: 'hook_first',
      visual_preset: 'bold_center'
    }
  },
  {
    id: 'dual_focus',
    name: 'The Dual Focus',
    description: 'Reaction video safety.',
    preview: 'OMG!',
    style: {
      font_family: 'Bangers',
      font_size: 26,
      line_spacing: 1.2,
      is_bold: false,
      is_caps: true,
      text_color: '#ffffff',
      highlight_color: '#facc15',
      has_background: false,
      has_stroke: true,
      position: 'bottom',
      position_y: 90, // Very bottom
      caption_pace: 'fast',
      emphasis_strategy: 'verbs',
      visual_preset: 'clean_bottom'
    }
  },
  {
    id: 'coach',
    name: 'The Coach',
    description: 'Sports analysis.',
    preview: 'Watch the footwork',
    style: {
      font_family: 'Teko',
      font_size: 28,
      line_spacing: 1.1,
      is_bold: true,
      is_caps: true,
      text_color: '#ffffff',
      highlight_color: '#facc15',
      has_background: true,
      background_opacity: 0.6,
      position: 'bottom',
      position_y: 80,
      caption_pace: 'medium',
      emphasis_strategy: 'verbs',
      visual_preset: 'highlighted_words'
    }
  },
  {
    id: 'myth_buster',
    name: 'The Myth Buster',
    description: 'Science debunking.',
    preview: 'FALSE.',
    style: {
      font_family: 'Arial Black',
      font_size: 26,
      line_spacing: 1.2,
      is_bold: true,
      is_caps: true,
      text_color: '#ffffff',
      highlight_color: '#ef4444', // Red for false
      has_background: true,
      background_opacity: 0.9,
      background_color: '#000000',
      position: 'bottom',
      position_y: 75,
      caption_pace: 'fast',
      emphasis_strategy: 'hook_first',
      visual_preset: 'subtitle_classic'
    }
  },
  {
    id: 'emotional_hook',
    name: 'The Emotional Hook',
    description: 'Charity/Appeal.',
    preview: 'Help them now.',
    style: {
      font_family: 'Open Sans',
      font_size: 20,
      line_spacing: 1.5,
      is_bold: false,
      is_caps: false,
      text_color: '#ffffff',
      highlight_color: '#fbbf24',
      has_background: true,
      background_opacity: 0.4,
      position: 'bottom',
      position_y: 80,
      caption_pace: 'slow',
      emphasis_strategy: 'keywords',
      visual_preset: 'clean_bottom'
    }
  },
  {
    id: 'speed_reader',
    name: 'The Speed Reader',
    description: 'Brain training challenge.',
    preview: 'Read This Fast',
    style: {
      font_family: 'Monoton', // Or some other display font
      font_size: 24,
      line_spacing: 1.3,
      is_bold: false,
      is_caps: true,
      text_color: '#ffffff',
      highlight_color: '#22c55e',
      has_background: true,
      background_opacity: 0.8,
      position: 'middle',
      position_y: 50,
      caption_pace: 'ultra_fast',
      emphasis_strategy: 'none',
      visual_preset: 'highlighted_words'
    }
  },
  {
    id: 'final_boss',
    name: 'The Final Boss',
    description: 'Ultimate viral combo.',
    preview: 'MAXIMUM IMPACT',
    style: {
      font_family: 'Anton',
      font_size: 36,
      line_spacing: 1.1,
      is_bold: true,
      is_caps: true,
      text_color: '#ffffff',
      highlight_color: '#ef4444',
      has_background: false,
      has_shadow: true,
      has_stroke: true,
      position: 'middle',
      position_y: 50,
      caption_pace: 'ultra_fast',
      emphasis_strategy: 'keywords',
      visual_preset: 'bold_center'
    }
  }
];

export default function TemplatesTab({ currentStyle, onApplyTemplate }) {
  if (!currentStyle || !onApplyTemplate) return null;
  
  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">Caption Templates</h2>
        <p className="text-sm text-gray-500">
          50 Industry-Standard Presets
        </p>
      </div>
      
      <div className="space-y-3">
        {templates.map((template) => {
          // Approximate equality check for active state
          const isActive = currentStyle && 
            currentStyle.font_family === template.style.font_family &&
            currentStyle.font_size === template.style.font_size &&
            currentStyle.position_y === template.style.position_y;
          
          return (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isActive 
                  ? 'border-purple-500 bg-purple-600/10' 
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
              onClick={() => onApplyTemplate(template.style)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    {template.name}
                    {isActive && <Check className="w-4 h-4 text-purple-400" />}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                </div>
                {!isActive && (
                  <Button
                    size="sm"
                    className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyTemplate(template.style);
                    }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
                )}
              </div>
              
              {/* Preview */}
              <div className="relative aspect-video bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                <div 
                  className={`px-3 py-2 rounded-lg`}
                  style={{
                    backgroundColor: template.style.has_background 
                      ? (template.style.background_color 
                        ? (template.style.background_color.startsWith('#') 
                            ? `rgba(${parseInt(template.style.background_color.slice(1, 3), 16)}, ${parseInt(template.style.background_color.slice(3, 5), 16)}, ${parseInt(template.style.background_color.slice(5, 7), 16)}, ${template.style.background_opacity})`
                            : template.style.background_color)
                        : `rgba(0,0,0,${template.style.background_opacity})`)
                      : 'transparent',
                    textShadow: template.style.has_shadow ? '2px 2px 0px rgba(0,0,0,0.8)' : 'none',
                    WebkitTextStroke: template.style.has_stroke ? '1px black' : 'none'
                  }}
                >
                  <span
                    style={{
                      fontFamily: template.style.font_family,
                      fontSize: '18px', // Scaled for preview
                      lineHeight: template.style.line_spacing,
                      fontWeight: template.style.is_bold ? 'bold' : 'normal',
                      textTransform: template.style.is_caps ? 'uppercase' : 'none',
                      color: template.style.text_color,
                    }}
                  >
                    {template.style.highlight_color || template.style.emphasis_strategy !== 'none' ? (
                      <span>
                        {template.preview.split(' ').map((word, i) => {
                           // Simple logic for preview visualization
                           let isHighlighted = false;
                           if (template.style.emphasis_strategy === 'hook_first' && i < 2) isHighlighted = true;
                           if (template.style.emphasis_strategy === 'keywords' && word.length > 4) isHighlighted = true;
                           if (template.style.emphasis_strategy === 'numbers' && /\d/.test(word)) isHighlighted = true;
                           if (template.style.emphasis_strategy === 'verbs' && i === 0) isHighlighted = true; // Approx
                           if (template.style.visual_preset === 'highlighted_words' && i === 1) isHighlighted = true;

                           const highlightStyle = isHighlighted ? {
                             color: template.style.visual_preset === 'highlighted_words' ? template.style.highlight_color : template.style.text_color,
                             backgroundColor: template.style.visual_preset !== 'highlighted_words' && template.style.highlight_color ? template.style.highlight_color : 'transparent',
                             textShadow: isHighlighted && template.style.highlight_color && template.style.visual_preset !== 'highlighted_words' ? 'none' : undefined,
                             padding: '0 2px',
                             borderRadius: '2px'
                           } : {};

                           return (
                            <span 
                              key={i}
                              style={highlightStyle}
                            >
                              {word}{' '}
                            </span>
                           );
                        })}
                      </span>
                    ) : template.preview}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}