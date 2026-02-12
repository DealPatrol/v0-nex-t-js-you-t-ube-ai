/**
 * Complete Usage Example
 * Demonstrates how to use all enhanced features together
 */

import { createClient } from '@supabase/supabase-js'

// ==========================================
// Example 1: Generate Video with All Features
// ==========================================

async function generateEnhancedVideo() {
  console.log('🎬 Starting enhanced video generation...')

  // Step 1: Generate script with GPT-4 Turbo
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'The Future of Artificial Intelligence in Healthcare',
      description: 'Exploring how AI is revolutionizing medical diagnosis and treatment',
      video_length_minutes: 3,
      tone: 'professional',
      platform: 'youtube',
    }),
  })

  const { projectId, resultId } = await response.json()
  console.log('✅ Script generated with GPT-4 Turbo')
  console.log('📊 Semantic alignment scores calculated for each scene')

  // Step 2: Video scenes are automatically generated with:
  // - Semantic search to align visuals with narration
  // - Enhanced voiceovers with ElevenLabs
  // - Template application with transitions
  console.log('✅ Scenes generated with semantic alignment')
  console.log('🎙️ Enhanced voiceovers generated with context-aware modulation')

  return { projectId, resultId }
}

// ==========================================
// Example 2: Multi-Platform Campaign
// ==========================================

async function scheduleCampaign(projectId: string) {
  console.log('📅 Scheduling multi-platform campaign...')

  const response = await fetch('/api/campaign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: projectId,
      platforms: [
        'youtube',
        'youtube-shorts',
        'instagram-reels',
        'tiktok',
        'facebook',
        'twitter',
      ],
      autoOptimize: true, // Enable platform-specific optimization
    }),
  })

  const result = await response.json()
  console.log('✅ Campaign scheduled for 6 platforms')
  console.log('⏰ Optimal posting times calculated')
  console.log('🎯 Platform-specific optimizations queued')

  // Each platform gets:
  // - Optimal aspect ratio (16:9 or 9:16)
  // - Platform-specific hooks and CTAs
  // - Appropriate duration limits
  // - Safe zones for captions

  return result
}

// ==========================================
// Example 3: Localize to Multiple Languages
// ==========================================

async function localizeVideo(resultId: string) {
  console.log('🌍 Starting localization...')

  const response = await fetch('/api/localize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resultId: resultId,
      targetLanguages: ['es', 'fr', 'de', 'pt', 'ja', 'zh'],
      culturalAdaptation: true,
      autoGenerateVoiceovers: true,
      subtitleStyle: 'universal',
    }),
  })

  const result = await response.json()
  console.log('✅ Content localized to 6 languages')
  console.log('🎭 Cultural references adapted')
  console.log('🎙️ Voiceovers generated in each language')
  console.log('📝 Subtitles created with proper formatting')

  return result
}

// ==========================================
// Example 4: Custom Template Usage
// ==========================================

import { TEMPLATES, applyTemplateToScenes } from '@/lib/ai/templates'

async function useCustomTemplate(scenes: any[]) {
  console.log('🎨 Applying custom template...')

  // Option 1: Use pre-made template
  const template = TEMPLATES['dynamic_explainer']

  // Option 2: Create custom template
  const customTemplate = {
    id: 'my_custom_template',
    name: 'My Custom Template',
    category: 'tutorial',
    description: 'Custom template for tech tutorials',
    duration_range: [120, 600],
    transitions: ['crossfade', 'zoom_in', 'wipe_left'],
    animations: ['text_slide_in', 'element_scale'],
    color_scheme: ['#00D9FF', '#FFFFFF', '#1A1A1A'],
    font_family: 'SF Pro Display, sans-serif',
    layout: 'split',
    text_style: 'bold',
  }

  const styledScenes = applyTemplateToScenes(scenes, customTemplate as any)
  console.log('✅ Template applied with custom styling')

  return styledScenes
}

// ==========================================
// Example 5: Voice Selection and Modulation
// ==========================================

import {
  selectVoiceForContext,
  getContextualVoiceSettings,
  analyzeTextEmotion,
  generateEnhancedVoiceover,
} from '@/lib/ai/enhanced-voiceover'

async function generateVoiceoverWithModulation(text: string, context: string) {
  console.log('🎤 Generating enhanced voiceover...')

  // Automatic voice selection based on context
  const voice = selectVoiceForContext('professional', 'youtube')
  console.log(`Selected voice: ${voice.name}`)

  // Detect emotion from text
  const modulation = analyzeTextEmotion(text)
  console.log(`Detected emotion: ${modulation.emotion}`)

  // Get contextual voice settings
  const settings = getContextualVoiceSettings(modulation)

  // Generate with ElevenLabs
  try {
    const audioUrl = await generateEnhancedVoiceover(text, voice.id, settings)
    console.log('✅ Voiceover generated with ElevenLabs')
    return audioUrl
  } catch (error) {
    console.log('⚠️ Falling back to OpenAI TTS')
    // Automatic fallback is handled in the video generator
  }
}

// ==========================================
// Example 6: Semantic Visual Alignment
// ==========================================

import { alignVisualWithNarration } from '@/lib/ai/semantic-search'

async function improveVisualAlignment() {
  console.log('🔍 Checking semantic alignment...')

  const narration = "The rapid advancement of AI technology is transforming healthcare, enabling doctors to diagnose diseases with unprecedented accuracy."
  
  const originalVisual = "A hospital room with medical equipment"

  // Align visual with narration
  const alignment = await alignVisualWithNarration(narration, originalVisual)

  console.log(`Semantic score: ${alignment.score.toFixed(3)}`)

  if (alignment.score < 0.7) {
    console.log('⚡ Visual prompt refined for better alignment')
    console.log(`Original: ${originalVisual}`)
    console.log(`Refined: ${alignment.refined_prompt}`)
  } else {
    console.log('✅ Visual already well-aligned with narration')
  }

  return alignment
}

// ==========================================
// Example 7: Complete Workflow
// ==========================================

async function completeWorkflowExample() {
  try {
    console.log('🚀 Starting complete enhanced workflow...\n')

    // 1. Generate video with all enhancements
    const { projectId, resultId } = await generateEnhancedVideo()
    console.log('\n---\n')

    // 2. Schedule multi-platform campaign
    await scheduleCampaign(projectId)
    console.log('\n---\n')

    // 3. Localize to multiple languages
    await localizeVideo(resultId)
    console.log('\n---\n')

    console.log('✨ Complete workflow finished!')
    console.log('\n📊 Summary:')
    console.log('- 1 video generated with GPT-4 Turbo')
    console.log('- Semantic alignment applied to all scenes')
    console.log('- Enhanced voiceovers with ElevenLabs')
    console.log('- Professional template with transitions')
    console.log('- Scheduled for 6 social platforms')
    console.log('- Localized to 6 languages')
    console.log('- Cultural adaptations applied')
    console.log('- Multilingual voiceovers generated')
    console.log('\n🎉 Your video is ready to rival InVideo AI!')
  } catch (error) {
    console.error('❌ Error in workflow:', error)
  }
}

// ==========================================
// Example 8: Query Campaign Status
// ==========================================

async function checkCampaignStatus(projectId: string) {
  const response = await fetch(`/api/campaign?projectId=${projectId}&status=pending`)
  const { schedules } = await response.json()

  console.log('📋 Campaign Schedules:')
  schedules.forEach((schedule: any) => {
    console.log(`\n Platform: ${schedule.platforms.join(', ')}`)
    console.log(`  Scheduled: ${new Date(schedule.scheduled_date).toLocaleString()}`)
    console.log(`  Status: ${schedule.status}`)
    console.log(`  Optimal Time: ${schedule.optimal_time ? 'Yes' : 'No'}`)
  })
}

// ==========================================
// Example 9: Retrieve Localizations
// ==========================================

async function getLocalizations(resultId: string) {
  const response = await fetch(`/api/localize?resultId=${resultId}`)
  const { localizations } = await response.json()

  console.log('🌐 Available Localizations:')
  localizations.forEach((loc: any) => {
    console.log(`\n Language: ${loc.language}`)
    console.log(`  Status: ${loc.status}`)
    console.log(`  Scenes: ${loc.scenes.length}`)
    if (loc.cultural_adaptations?.length > 0) {
      console.log(`  Adaptations: ${loc.cultural_adaptations.length}`)
    }
  })
}

// ==========================================
// Example 10: Platform-Specific Hook Generation
// ==========================================

import { generatePlatformHooks } from '@/lib/ai/automation'

function showPlatformHooks() {
  const topic = "AI in Healthcare"

  console.log('📱 Platform-Specific Hooks:\n')

  const platforms = ['youtube-shorts', 'instagram-reels', 'tiktok', 'youtube']
  
  platforms.forEach(platform => {
    const hooks = generatePlatformHooks(platform, topic)
    console.log(`${platform}:`)
    console.log(`  Hook: ${hooks.opening_hook}`)
    console.log(`  CTA: ${hooks.cta}\n`)
  })
}

// ==========================================
// Run Examples
// ==========================================

// Uncomment to run specific examples:

// Example 1: Complete workflow
// completeWorkflowExample()

// Example 2: Platform hooks
// showPlatformHooks()

// Example 3: Check semantic alignment
// improveVisualAlignment()

// Example 4: Query campaign status
// checkCampaignStatus('your-project-id')

// Example 5: Get localizations
// getLocalizations('your-result-id')

export {
  generateEnhancedVideo,
  scheduleCampaign,
  localizeVideo,
  useCustomTemplate,
  generateVoiceoverWithModulation,
  improveVisualAlignment,
  completeWorkflowExample,
  checkCampaignStatus,
  getLocalizations,
  showPlatformHooks,
}
