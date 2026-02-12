/**
 * Enhanced Voiceover Service
 * Optimizes ElevenLabs TTS with pitch, tone modulation, and multi-voice support
 */

export interface VoiceSettings {
  stability?: number // 0-1, lower = more expressive
  similarity_boost?: number // 0-1, higher = closer to original voice
  style?: number // 0-1, exaggeration level
  use_speaker_boost?: boolean
  pitch?: number // -1 to 1, pitch shift
  speed?: number // 0.5-2.0, speed multiplier
}

export interface VoiceProfile {
  id: string
  name: string
  language: string
  gender: 'male' | 'female' | 'neutral'
  age: 'young' | 'middle' | 'old'
  accent: string
  use_case: string[]
}

export const VOICE_LIBRARY: VoiceProfile[] = [
  // Professional voices
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    language: 'en',
    gender: 'female',
    age: 'middle',
    accent: 'American',
    use_case: ['professional', 'educational', 'news'],
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    language: 'en',
    gender: 'male',
    age: 'middle',
    accent: 'American',
    use_case: ['professional', 'narration', 'documentary'],
  },
  // Expressive voices
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    language: 'en',
    gender: 'female',
    age: 'young',
    accent: 'American',
    use_case: ['storytelling', 'entertainment', 'tutorial'],
  },
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    language: 'en',
    gender: 'male',
    age: 'young',
    accent: 'American',
    use_case: ['casual', 'social media', 'entertainment'],
  },
  // Character voices
  {
    id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    language: 'en',
    gender: 'female',
    age: 'young',
    accent: 'American',
    use_case: ['character', 'gaming', 'animation'],
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    language: 'en',
    gender: 'male',
    age: 'young',
    accent: 'American',
    use_case: ['energetic', 'gaming', 'sports'],
  },
]

export interface ContextualVoiceModulation {
  emotion: 'neutral' | 'excited' | 'serious' | 'calm' | 'urgent'
  emphasis_words?: string[]
  pause_before?: string[]
}

/**
 * Select optimal voice based on content context
 */
export function selectVoiceForContext(
  tone: string,
  platform: string,
  contentType: string = 'general'
): VoiceProfile {
  // Map tone and platform to use cases
  const useCaseMap: Record<string, string[]> = {
    professional: ['professional', 'educational', 'news'],
    casual: ['casual', 'social media', 'entertainment'],
    educational: ['educational', 'tutorial', 'narration'],
    entertaining: ['storytelling', 'entertainment', 'character'],
    youtube: ['narration', 'professional', 'storytelling'],
    'youtube-shorts': ['casual', 'social media', 'energetic'],
    instagram: ['casual', 'social media', 'entertainment'],
    tiktok: ['casual', 'energetic', 'entertainment'],
  }

  const targetUseCases = [
    ...(useCaseMap[tone.toLowerCase()] || []),
    ...(useCaseMap[platform.toLowerCase()] || []),
  ]

  // Find best matching voice
  const matchedVoice = VOICE_LIBRARY.find(voice =>
    targetUseCases.some(useCase => voice.use_case.includes(useCase))
  )

  return matchedVoice || VOICE_LIBRARY[0] // Default to Rachel
}

/**
 * Generate context-aware voice settings
 */
export function getContextualVoiceSettings(
  modulation: ContextualVoiceModulation
): VoiceSettings {
  const settings: VoiceSettings = {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0,
    use_speaker_boost: true,
    pitch: 0,
    speed: 1.0,
  }

  // Adjust based on emotion
  switch (modulation.emotion) {
    case 'excited':
      settings.stability = 0.3 // More expressive
      settings.style = 0.6
      settings.pitch = 0.1 // Slightly higher pitch
      settings.speed = 1.1 // Faster
      break
    case 'serious':
      settings.stability = 0.7 // More stable
      settings.style = 0.2
      settings.pitch = -0.05 // Slightly lower pitch
      settings.speed = 0.95 // Slightly slower
      break
    case 'calm':
      settings.stability = 0.8 // Very stable
      settings.style = 0.1
      settings.pitch = -0.1 // Lower pitch
      settings.speed = 0.9 // Slower
      break
    case 'urgent':
      settings.stability = 0.4
      settings.style = 0.5
      settings.pitch = 0.05
      settings.speed = 1.15 // Faster
      break
    default: // neutral
      settings.stability = 0.5
      settings.style = 0.3
      break
  }

  return settings
}

/**
 * Add SSML markers for emphasis and pauses
 */
export function enhanceTextWithSSML(
  text: string,
  modulation: ContextualVoiceModulation
): string {
  let enhancedText = text

  // Add emphasis to specific words
  if (modulation.emphasis_words && modulation.emphasis_words.length > 0) {
    modulation.emphasis_words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      enhancedText = enhancedText.replace(
        regex,
        `<emphasis level="strong">${word}</emphasis>`
      )
    })
  }

  // Add pauses before specific words
  if (modulation.pause_before && modulation.pause_before.length > 0) {
    modulation.pause_before.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      enhancedText = enhancedText.replace(regex, `<break time="500ms"/>${word}`)
    })
  }

  return enhancedText
}

/**
 * Generate voiceover with ElevenLabs using advanced settings
 */
export async function generateEnhancedVoiceover(
  text: string,
  voiceId: string,
  settings: VoiceSettings,
  modelId: string = 'eleven_multilingual_v2'
): Promise<string> {
  const elevenlabsKey = process.env.ELEVENLABS_API_KEY?.trim()

  if (!elevenlabsKey) {
    throw new Error('ElevenLabs API key not configured')
  }

  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: modelId,
        voice_settings: {
          stability: settings.stability || 0.5,
          similarity_boost: settings.similarity_boost || 0.75,
          style: settings.style || 0,
          use_speaker_boost: settings.use_speaker_boost ?? true,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`ElevenLabs API error: ${error}`)
    }

    // Convert response to base64 data URL
    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    return `data:audio/mpeg;base64,${base64Audio}`
  } catch (error) {
    console.error('[EnhancedVoiceover] Error generating voiceover:', error)
    throw error
  }
}

/**
 * Generate multi-voice narration for different speakers
 */
export async function generateMultiVoiceNarration(
  segments: Array<{ speaker: string; text: string; emotion?: string }>,
  voiceMap: Record<string, string> // Map speaker names to voice IDs
): Promise<Array<{ speaker: string; audioUrl: string }>> {
  const results = []

  for (const segment of segments) {
    const voiceId = voiceMap[segment.speaker] || VOICE_LIBRARY[0].id
    const modulation: ContextualVoiceModulation = {
      emotion: (segment.emotion as any) || 'neutral',
    }
    const settings = getContextualVoiceSettings(modulation)

    try {
      const audioUrl = await generateEnhancedVoiceover(
        segment.text,
        voiceId,
        settings
      )

      results.push({
        speaker: segment.speaker,
        audioUrl,
      })
    } catch (error) {
      console.error(
        `[EnhancedVoiceover] Failed to generate audio for ${segment.speaker}:`,
        error
      )
      throw error
    }
  }

  return results
}

/**
 * Analyze text to detect optimal emotion and modulation
 */
export function analyzeTextEmotion(text: string): ContextualVoiceModulation {
  const lowerText = text.toLowerCase()
  
  // Simple keyword-based emotion detection
  const emotionKeywords = {
    excited: ['amazing', 'incredible', 'wow', 'fantastic', 'awesome', '!'],
    serious: ['important', 'critical', 'must', 'serious', 'warning'],
    calm: ['relax', 'peaceful', 'gentle', 'calm', 'soothing'],
    urgent: ['now', 'hurry', 'quick', 'immediately', 'urgent', 'breaking'],
  }

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return { emotion: emotion as any }
    }
  }

  return { emotion: 'neutral' }
}
