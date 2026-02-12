/**
 * Video Generation Service
 * Handles video creation using AI-generated video clips for scenes
 * Enhanced with semantic search, advanced voiceovers, and templates
 */

import { alignVisualWithNarration } from '../ai/semantic-search'
import {
  selectVoiceForContext,
  getContextualVoiceSettings,
  analyzeTextEmotion,
  generateEnhancedVoiceover,
} from '../ai/enhanced-voiceover'
import { selectTemplate, applyTemplateToScenes } from '../ai/templates'

export interface VideoScene {
  id: number
  title: string
  visual_description: string
  on_screen_text: string
  narration?: string
  start_time?: string
  end_time?: string
  image_url?: string
  video_url?: string
  audio_url?: string
  template_id?: string
  semantic_score?: number
}

export interface VideoGenerationOptions {
  resultId: string
  scenes: VideoScene[]
  script: any
  duration?: number
}

/**
 * Generate audio voiceover for scenes using enhanced ElevenLabs TTS
 */
export async function generateSceneAudio(
  scenes: VideoScene[],
  tone: string = 'professional',
  platform: string = 'youtube'
): Promise<VideoScene[]> {
  const updatedScenes = []

  // Select optimal voice for context
  const voiceProfile = selectVoiceForContext(tone, platform)
  console.log(`[v0] Using voice: ${voiceProfile.name} for ${tone} ${platform} content`)

  for (const scene of scenes) {
    try {
      // Skip if no narration text
      if (!scene.narration) {
        console.log(`[v0] Scene ${scene.id} has no narration, skipping audio generation`)
        updatedScenes.push(scene)
        continue
      }

      console.log(`[v0] Generating enhanced voiceover for scene ${scene.id}: ${scene.title}`)

      // Analyze text emotion for context-aware modulation
      const modulation = analyzeTextEmotion(scene.narration)
      const voiceSettings = getContextualVoiceSettings(modulation)

      // Try ElevenLabs first with enhanced settings
      try {
        const audioUrl = await generateEnhancedVoiceover(
          scene.narration,
          voiceProfile.id,
          voiceSettings
        )

        updatedScenes.push({
          ...scene,
          audio_url: audioUrl,
        })

        console.log(`[v0] Scene ${scene.id} enhanced voiceover generated`)
        continue
      } catch (elevenlabsError) {
        console.log(`[v0] ElevenLabs unavailable, falling back to OpenAI TTS`)
      }

      // Fallback to OpenAI TTS
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/generate-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narration: scene.narration,
          sceneId: scene.id,
          voice: 'alloy',
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate audio for scene ${scene.id}`)
      }

      const data = await response.json()

      updatedScenes.push({
        ...scene,
        audio_url: data.audioUrl,
      })

      console.log(`[v0] Scene ${scene.id} voiceover generated (OpenAI fallback)`)
    } catch (error) {
      console.error(`[v0] Error generating audio for scene ${scene.id}:`, error)

      // Continue without audio if generation fails
      updatedScenes.push(scene)
    }
  }

  return updatedScenes
}

/**
 * Generate video clips for each scene using Kling Video API with semantic matching
 */
export async function generateSceneVideos(
  scenes: VideoScene[],
  duration: number = 5
): Promise<VideoScene[]> {
  const updatedScenes = []

  for (const scene of scenes) {
    try {
      console.log(`[v0] Generating ${duration}s video for scene ${scene.id}: ${scene.title}`)

      // Use semantic search to align visual with narration
      let visualPrompt = scene.visual_description
      let semanticScore = 0

      if (scene.narration) {
        try {
          const alignment = await alignVisualWithNarration(
            scene.narration,
            scene.visual_description
          )
          visualPrompt = alignment.refined_prompt
          semanticScore = alignment.score
          console.log(
            `[v0] Semantic alignment score for scene ${scene.id}: ${semanticScore.toFixed(3)}`
          )
        } catch (error) {
          console.log(
            `[v0] Semantic alignment failed for scene ${scene.id}, using original prompt`
          )
        }
      }

      // Use fal.ai Kling Video to generate actual video clips
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/generate-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${visualPrompt}. ${scene.on_screen_text}`,
          sceneId: scene.id,
          duration: duration,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate video for scene ${scene.id}`)
      }

      const data = await response.json()

      updatedScenes.push({
        ...scene,
        video_url: data.videoUrl,
        image_url: data.thumbnailUrl || data.videoUrl, // Use video as fallback
        semantic_score: semanticScore,
      })

      console.log(`[v0] Scene ${scene.id} video generated: ${data.videoUrl}`)
    } catch (error) {
      console.error(`[v0] Error generating video for scene ${scene.id}:`, error)

      // Fallback to image generation if video fails
      try {
        const imageResponse = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-image`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: scene.visual_description,
              aspectRatio: '16:9',
            }),
          }
        )

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          updatedScenes.push({
            ...scene,
            image_url: imageData.imageUrl,
          })
        } else {
          throw new Error('Image fallback failed')
        }
      } catch (fallbackError) {
        console.error(
          `[v0] Fallback image generation failed for scene ${scene.id}:`,
          fallbackError
        )
        updatedScenes.push({
          ...scene,
          image_url: `/placeholder.svg`,
        })
      }
    }
  }

  return updatedScenes
}

/**
 * Generate images for each scene using AI (legacy support)
 */
export async function generateSceneImages(scenes: VideoScene[]): Promise<VideoScene[]> {
  const updatedScenes = []

  for (const scene of scenes) {
    try {
      console.log(`[v0] Generating image for scene ${scene.id}: ${scene.title}`)
      
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scene.visual_description,
          aspectRatio: '16:9',
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate image for scene ${scene.id}`)
      }

      const data = await response.json()
      
      updatedScenes.push({
        ...scene,
        image_url: data.imageUrl,
      })

      console.log(`[v0] Scene ${scene.id} image generated: ${data.imageUrl}`)
    } catch (error) {
      console.error(`[v0] Error generating image for scene ${scene.id}:`, error)
      
      updatedScenes.push({
        ...scene,
        image_url: `/placeholder.svg`,
      })
    }
  }

  return updatedScenes
}

/**
 * Create video from scenes (simplified approach for serverless)
 * Enhanced with template support
 */
export async function createVideoFromScenes(
  options: VideoGenerationOptions,
  tone: string = 'professional',
  category: string = 'general'
) {
  const { resultId, scenes, script, duration } = options

  console.log(`[v0] Creating video for result ${resultId}`)
  console.log(`[v0] Processing ${scenes.length} scenes with ${category} template`)

  // Select and apply template
  const template = selectTemplate(category, duration || 60, tone)
  const styledScenes = applyTemplateToScenes(scenes, template)

  console.log(`[v0] Applied template: ${template.name}`)

  // Generate images for all scenes
  const scenesWithImages = await generateSceneImages(styledScenes)

  // For now, we'll store the scenes with images and let the editor handle assembly
  // In production, you'd use a video rendering service here
  return {
    success: true,
    resultId,
    scenes: scenesWithImages,
    template: template.id,
    message: 'Scenes with images and template generated. Use the editor to assemble the final video.',
  }
}

/**
 * Estimate video generation time based on scene count
 */
export function estimateGenerationTime(sceneCount: number): string {
  const timePerScene = 30 // seconds
  const totalSeconds = sceneCount * timePerScene
  const minutes = Math.ceil(totalSeconds / 60)
  
  return `${minutes}-${minutes + 2} minutes`
}
