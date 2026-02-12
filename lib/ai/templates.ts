/**
 * Video Transitions and Templates Service
 * Provides cinematic transitions, animations, and pre-made templates
 */

export interface Transition {
  id: string
  name: string
  type: 'fade' | 'wipe' | 'zoom' | 'slide' | 'dissolve' | 'blur' | 'morph'
  duration: number // seconds
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
  direction?: 'left' | 'right' | 'up' | 'down' | 'center'
  parameters?: Record<string, any>
}

export interface Animation {
  id: string
  name: string
  type: 'text' | 'element' | 'camera'
  effect: string
  duration: number
  delay?: number
  loop?: boolean
}

export interface VideoTemplate {
  id: string
  name: string
  category: 'tutorial' | 'explainer' | 'review' | 'news' | 'vlog' | 'promo'
  description: string
  duration_range: [number, number] // [min, max] in seconds
  transitions: Transition[]
  animations: Animation[]
  color_scheme: string[]
  font_family: string
  layout: 'split' | 'full' | 'pip' | 'overlay'
  text_style: 'bold' | 'minimal' | 'decorative'
}

/**
 * Pre-defined cinematic transitions
 */
export const TRANSITIONS: Record<string, Transition> = {
  // Fade transitions
  fade_in: {
    id: 'fade_in',
    name: 'Fade In',
    type: 'fade',
    duration: 0.5,
    easing: 'ease-in',
    parameters: { from: 0, to: 1 },
  },
  fade_out: {
    id: 'fade_out',
    name: 'Fade Out',
    type: 'fade',
    duration: 0.5,
    easing: 'ease-out',
    parameters: { from: 1, to: 0 },
  },
  crossfade: {
    id: 'crossfade',
    name: 'Crossfade',
    type: 'dissolve',
    duration: 1.0,
    easing: 'ease-in-out',
  },

  // Wipe transitions
  wipe_left: {
    id: 'wipe_left',
    name: 'Wipe Left',
    type: 'wipe',
    duration: 0.7,
    easing: 'ease-in-out',
    direction: 'left',
  },
  wipe_right: {
    id: 'wipe_right',
    name: 'Wipe Right',
    type: 'wipe',
    duration: 0.7,
    easing: 'ease-in-out',
    direction: 'right',
  },

  // Zoom transitions
  zoom_in: {
    id: 'zoom_in',
    name: 'Zoom In',
    type: 'zoom',
    duration: 0.8,
    easing: 'ease-in',
    parameters: { from: 1, to: 1.2 },
  },
  zoom_out: {
    id: 'zoom_out',
    name: 'Zoom Out',
    type: 'zoom',
    duration: 0.8,
    easing: 'ease-out',
    parameters: { from: 1.2, to: 1 },
  },

  // Slide transitions
  slide_up: {
    id: 'slide_up',
    name: 'Slide Up',
    type: 'slide',
    duration: 0.6,
    easing: 'ease-in-out',
    direction: 'up',
  },
  slide_down: {
    id: 'slide_down',
    name: 'Slide Down',
    type: 'slide',
    duration: 0.6,
    easing: 'ease-in-out',
    direction: 'down',
  },

  // Special effects
  blur_transition: {
    id: 'blur_transition',
    name: 'Blur Transition',
    type: 'blur',
    duration: 0.8,
    easing: 'ease-in-out',
    parameters: { blur_amount: 20 },
  },
}

/**
 * Pre-defined animation effects
 */
export const ANIMATIONS: Record<string, Animation> = {
  // Text animations
  text_fade_in: {
    id: 'text_fade_in',
    name: 'Text Fade In',
    type: 'text',
    effect: 'fadeIn',
    duration: 0.5,
    delay: 0.2,
  },
  text_slide_in: {
    id: 'text_slide_in',
    name: 'Text Slide In',
    type: 'text',
    effect: 'slideInFromBottom',
    duration: 0.6,
    delay: 0.1,
  },
  text_typewriter: {
    id: 'text_typewriter',
    name: 'Typewriter Effect',
    type: 'text',
    effect: 'typewriter',
    duration: 2.0,
    delay: 0,
  },
  text_bounce: {
    id: 'text_bounce',
    name: 'Bounce In',
    type: 'text',
    effect: 'bounceIn',
    duration: 0.8,
    delay: 0,
  },

  // Element animations
  element_scale: {
    id: 'element_scale',
    name: 'Scale Up',
    type: 'element',
    effect: 'scaleUp',
    duration: 0.5,
    delay: 0,
  },
  element_rotate: {
    id: 'element_rotate',
    name: 'Rotate In',
    type: 'element',
    effect: 'rotateIn',
    duration: 0.7,
    delay: 0,
  },

  // Camera movements
  camera_pan_right: {
    id: 'camera_pan_right',
    name: 'Pan Right',
    type: 'camera',
    effect: 'panRight',
    duration: 3.0,
    delay: 0,
  },
  camera_zoom_in: {
    id: 'camera_zoom_in',
    name: 'Camera Zoom',
    type: 'camera',
    effect: 'zoomIn',
    duration: 2.0,
    delay: 0,
  },
}

/**
 * Pre-made video templates
 */
export const TEMPLATES: Record<string, VideoTemplate> = {
  modern_tutorial: {
    id: 'modern_tutorial',
    name: 'Modern Tutorial',
    category: 'tutorial',
    description: 'Clean, professional template for educational content',
    duration_range: [120, 600],
    transitions: [
      TRANSITIONS.crossfade,
      TRANSITIONS.slide_up,
      TRANSITIONS.fade_in,
    ],
    animations: [
      ANIMATIONS.text_slide_in,
      ANIMATIONS.element_scale,
    ],
    color_scheme: ['#4A90E2', '#FFFFFF', '#2C3E50'],
    font_family: 'Inter, sans-serif',
    layout: 'split',
    text_style: 'bold',
  },

  dynamic_explainer: {
    id: 'dynamic_explainer',
    name: 'Dynamic Explainer',
    category: 'explainer',
    description: 'Energetic template with smooth animations',
    duration_range: [60, 300],
    transitions: [
      TRANSITIONS.zoom_in,
      TRANSITIONS.wipe_left,
      TRANSITIONS.blur_transition,
    ],
    animations: [
      ANIMATIONS.text_bounce,
      ANIMATIONS.element_rotate,
      ANIMATIONS.camera_zoom_in,
    ],
    color_scheme: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    font_family: 'Poppins, sans-serif',
    layout: 'full',
    text_style: 'decorative',
  },

  minimal_review: {
    id: 'minimal_review',
    name: 'Minimal Review',
    category: 'review',
    description: 'Simple, elegant template for product reviews',
    duration_range: [180, 900],
    transitions: [
      TRANSITIONS.fade_in,
      TRANSITIONS.fade_out,
      TRANSITIONS.crossfade,
    ],
    animations: [
      ANIMATIONS.text_fade_in,
      ANIMATIONS.element_scale,
    ],
    color_scheme: ['#000000', '#FFFFFF', '#F5F5F5'],
    font_family: 'Helvetica, Arial, sans-serif',
    layout: 'full',
    text_style: 'minimal',
  },

  news_broadcast: {
    id: 'news_broadcast',
    name: 'News Broadcast',
    category: 'news',
    description: 'Professional news-style template',
    duration_range: [60, 180],
    transitions: [
      TRANSITIONS.wipe_right,
      TRANSITIONS.slide_down,
    ],
    animations: [
      ANIMATIONS.text_typewriter,
      ANIMATIONS.text_slide_in,
    ],
    color_scheme: ['#C41E3A', '#FFFFFF', '#1C1C1C'],
    font_family: 'Roboto, sans-serif',
    layout: 'overlay',
    text_style: 'bold',
  },

  casual_vlog: {
    id: 'casual_vlog',
    name: 'Casual Vlog',
    category: 'vlog',
    description: 'Relaxed, personal vlog style',
    duration_range: [300, 1200],
    transitions: [
      TRANSITIONS.crossfade,
      TRANSITIONS.zoom_out,
    ],
    animations: [
      ANIMATIONS.text_fade_in,
      ANIMATIONS.camera_pan_right,
    ],
    color_scheme: ['#FFB6C1', '#87CEEB', '#FFD700'],
    font_family: 'Quicksand, sans-serif',
    layout: 'full',
    text_style: 'minimal',
  },

  high_energy_promo: {
    id: 'high_energy_promo',
    name: 'High Energy Promo',
    category: 'promo',
    description: 'Fast-paced promotional template',
    duration_range: [15, 60],
    transitions: [
      TRANSITIONS.zoom_in,
      TRANSITIONS.wipe_left,
      TRANSITIONS.slide_up,
    ],
    animations: [
      ANIMATIONS.text_bounce,
      ANIMATIONS.element_rotate,
      ANIMATIONS.element_scale,
    ],
    color_scheme: ['#FF0080', '#7928CA', '#FF4820'],
    font_family: 'Montserrat, sans-serif',
    layout: 'pip',
    text_style: 'decorative',
  },
}

/**
 * Select template based on content type and duration
 */
export function selectTemplate(
  category: string,
  duration: number,
  tone: string = 'professional'
): VideoTemplate {
  // Find matching templates
  const matchingTemplates = Object.values(TEMPLATES).filter(
    template =>
      template.category === category &&
      duration >= template.duration_range[0] &&
      duration <= template.duration_range[1]
  )

  if (matchingTemplates.length > 0) {
    return matchingTemplates[0]
  }

  // Fallback based on tone
  const toneTemplateMap: Record<string, string> = {
    professional: 'modern_tutorial',
    casual: 'casual_vlog',
    educational: 'modern_tutorial',
    entertaining: 'dynamic_explainer',
  }

  const templateId = toneTemplateMap[tone.toLowerCase()] || 'modern_tutorial'
  return TEMPLATES[templateId]
}

/**
 * Generate transition sequence for video scenes
 */
export function generateTransitionSequence(
  sceneCount: number,
  template: VideoTemplate
): Transition[] {
  const transitions: Transition[] = []
  const availableTransitions = template.transitions

  for (let i = 0; i < sceneCount - 1; i++) {
    // Cycle through available transitions
    const transitionIndex = i % availableTransitions.length
    transitions.push(availableTransitions[transitionIndex])
  }

  return transitions
}

/**
 * Apply template styling to scenes
 */
export function applyTemplateToScenes(
  scenes: any[],
  template: VideoTemplate
): any[] {
  return scenes.map((scene, index) => {
    const animation = template.animations[index % template.animations.length]
    
    return {
      ...scene,
      template_id: template.id,
      color_scheme: template.color_scheme,
      font_family: template.font_family,
      text_style: template.text_style,
      animation: animation.id,
      layout: template.layout,
    }
  })
}

/**
 * Get FFmpeg filter for transition
 */
export function getTransitionFilter(transition: Transition): string {
  const duration = transition.duration
  const offset = 0 // Can be customized

  switch (transition.type) {
    case 'fade':
      return `fade=t=in:st=${offset}:d=${duration}`
    case 'wipe':
      const direction = transition.direction || 'right'
      return `wipe=${direction}:duration=${duration}`
    case 'zoom':
      const scale = transition.parameters?.to || 1.2
      return `zoompan=z='min(zoom+0.0015,${scale})':d=${duration * 25}:s=1920x1080`
    case 'slide':
      return `slide=${transition.direction}:duration=${duration}`
    case 'blur':
      const blur = transition.parameters?.blur_amount || 20
      return `boxblur=${blur}:${blur}`
    case 'dissolve':
      return `xfade=transition=dissolve:duration=${duration}:offset=${offset}`
    default:
      return `fade=t=in:st=${offset}:d=${duration}`
  }
}

/**
 * Export template as JSON configuration
 */
export function exportTemplateConfig(template: VideoTemplate): string {
  return JSON.stringify(template, null, 2)
}

/**
 * Import custom template from JSON
 */
export function importTemplateConfig(jsonConfig: string): VideoTemplate {
  try {
    const template = JSON.parse(jsonConfig) as VideoTemplate
    // Validate required fields
    if (!template.id || !template.name || !template.category) {
      throw new Error('Invalid template configuration')
    }
    return template
  } catch (error) {
    console.error('[Templates] Error importing template:', error)
    throw error
  }
}
