/**
 * Localization Service
 * Handles multi-language voiceovers, captions, and cultural adaptation
 */

export interface Language {
  code: string
  name: string
  native_name: string
  rtl: boolean // Right-to-left
  voice_models: string[]
  cultural_notes?: string
}

export interface LocalizationSettings {
  target_languages: string[]
  auto_translate: boolean
  cultural_adaptation: boolean
  preserve_timing: boolean
  subtitle_style: 'netflix' | 'youtube' | 'universal'
}

export interface TranslatedContent {
  language: string
  script: string
  scenes: Array<{
    id: number
    narration: string
    on_screen_text: string
    audio_url?: string
    subtitle_url?: string
  }>
  cultural_adaptations?: string[]
}

/**
 * Supported languages with voice models
 */
export const SUPPORTED_LANGUAGES: Record<string, Language> = {
  en: {
    code: 'en',
    name: 'English',
    native_name: 'English',
    rtl: false,
    voice_models: ['eleven_multilingual_v2', 'eleven_monolingual_v1'],
  },
  es: {
    code: 'es',
    name: 'Spanish',
    native_name: 'Español',
    rtl: false,
    voice_models: ['eleven_multilingual_v2'],
    cultural_notes: 'Consider regional variations (Spain vs Latin America)',
  },
  fr: {
    code: 'fr',
    name: 'French',
    native_name: 'Français',
    rtl: false,
    voice_models: ['eleven_multilingual_v2'],
  },
  de: {
    code: 'de',
    name: 'German',
    native_name: 'Deutsch',
    rtl: false,
    voice_models: ['eleven_multilingual_v2'],
  },
  it: {
    code: 'it',
    name: 'Italian',
    native_name: 'Italiano',
    rtl: false,
    voice_models: ['eleven_multilingual_v2'],
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    native_name: 'Português',
    rtl: false,
    voice_models: ['eleven_multilingual_v2'],
    cultural_notes: 'Consider Brazilian vs European Portuguese',
  },
  pl: {
    code: 'pl',
    name: 'Polish',
    native_name: 'Polski',
    rtl: false,
    voice_models: ['eleven_multilingual_v2'],
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    native_name: '日本語',
    rtl: false,
    voice_models: ['eleven_multilingual_v2'],
    cultural_notes: 'Use formal/informal speech appropriately',
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    native_name: '한국어',
    rtl: false,
    voice_models: ['eleven_multilingual_v2'],
    cultural_notes: 'Honorifics are important',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    native_name: '中文',
    rtl: false,
    voice_models: ['eleven_multilingual_v2'],
    cultural_notes: 'Simplified vs Traditional characters',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    native_name: 'العربية',
    rtl: true,
    voice_models: ['eleven_multilingual_v2'],
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    native_name: 'हिन्दी',
    rtl: false,
    voice_models: ['eleven_multilingual_v2'],
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    native_name: 'Русский',
    rtl: false,
    voice_models: ['eleven_multilingual_v2'],
  },
  nl: {
    code: 'nl',
    name: 'Dutch',
    native_name: 'Nederlands',
    rtl: false,
    voice_models: ['eleven_multilingual_v2'],
  },
  sv: {
    code: 'sv',
    name: 'Swedish',
    native_name: 'Svenska',
    rtl: false,
    voice_models: ['eleven_multilingual_v2'],
  },
}

/**
 * Translate text using OpenAI GPT-4
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en',
  culturalAdaptation: boolean = false
): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY?.trim()

  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const targetLang = SUPPORTED_LANGUAGES[targetLanguage]
  if (!targetLang) {
    throw new Error(`Unsupported target language: ${targetLanguage}`)
  }

  try {
    const systemPrompt = culturalAdaptation
      ? `You are a professional translator and cultural adaptation expert. Translate the text from ${sourceLanguage} to ${targetLang.name} while adapting idioms, cultural references, and context to be appropriate for ${targetLang.name}-speaking audiences. Maintain the original tone and meaning.`
      : `You are a professional translator. Translate the text from ${sourceLanguage} to ${targetLang.name} accurately while maintaining the original tone and meaning.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3, // Lower temperature for more accurate translation
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Translation failed')
    }

    const data = await response.json()
    return data.choices[0].message.content.trim()
  } catch (error) {
    console.error('[Localization] Translation error:', error)
    throw error
  }
}

/**
 * Translate entire script with scenes
 */
export async function translateScript(
  script: any,
  scenes: any[],
  targetLanguage: string,
  culturalAdaptation: boolean = false
): Promise<TranslatedContent> {
  const translatedScenes = []
  const adaptations: string[] = []

  // Translate main script content
  const translatedScriptContent = await translateText(
    script.content,
    targetLanguage,
    'en',
    culturalAdaptation
  )

  // Translate each scene
  for (const scene of scenes) {
    const translatedNarration = await translateText(
      scene.narration || '',
      targetLanguage,
      'en',
      culturalAdaptation
    )

    const translatedOnScreenText = await translateText(
      scene.on_screen_text || '',
      targetLanguage,
      'en',
      false // Keep on-screen text literal
    )

    translatedScenes.push({
      id: scene.id,
      narration: translatedNarration,
      on_screen_text: translatedOnScreenText,
    })

    // Track cultural adaptations if enabled
    if (culturalAdaptation && scene.narration !== translatedNarration) {
      adaptations.push(
        `Scene ${scene.id}: Adapted cultural references for ${SUPPORTED_LANGUAGES[targetLanguage].name}`
      )
    }
  }

  return {
    language: targetLanguage,
    script: translatedScriptContent,
    scenes: translatedScenes,
    cultural_adaptations: adaptations.length > 0 ? adaptations : undefined,
  }
}

/**
 * Generate voiceover in target language using ElevenLabs
 */
export async function generateLocalizedVoiceover(
  text: string,
  language: string,
  voiceId: string = '21m00Tcm4TlvDq8ikWAM'
): Promise<string> {
  const elevenlabsKey = process.env.ELEVENLABS_API_KEY?.trim()

  if (!elevenlabsKey) {
    throw new Error('ElevenLabs API key not configured')
  }

  const lang = SUPPORTED_LANGUAGES[language]
  if (!lang) {
    throw new Error(`Unsupported language: ${language}`)
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
        model_id: lang.voice_models[0], // Use multilingual model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`ElevenLabs API error: ${error}`)
    }

    // Convert to base64 data URL
    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    return `data:audio/mpeg;base64,${base64Audio}`
  } catch (error) {
    console.error('[Localization] Voiceover generation error:', error)
    throw error
  }
}

/**
 * Generate subtitles in WebVTT format
 */
export function generateSubtitles(
  scenes: Array<{ id: number; narration: string; start_time: string; end_time: string }>,
  style: 'netflix' | 'youtube' | 'universal' = 'universal',
  rtl: boolean = false
): string {
  let vtt = 'WEBVTT\n\n'

  // Add styling based on platform
  if (style === 'netflix') {
    vtt += 'STYLE\n::cue {\n  background-color: rgba(0, 0, 0, 0.8);\n  color: white;\n  font-size: 1.2em;\n  font-family: Netflix Sans, Arial;\n}\n\n'
  } else if (style === 'youtube') {
    vtt += 'STYLE\n::cue {\n  background-color: rgba(0, 0, 0, 0.7);\n  color: white;\n  font-size: 1.1em;\n}\n\n'
  }

  scenes.forEach((scene, index) => {
    const startTime = timeToVTT(scene.start_time)
    const endTime = timeToVTT(scene.end_time)

    // Split long narrations into chunks
    const words = scene.narration.split(' ')
    const chunkSize = 8 // words per subtitle line
    
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ')
      const chunkDuration = parseTime(endTime) - parseTime(startTime)
      const chunkStart = parseTime(startTime) + (i / words.length) * chunkDuration
      const chunkEnd = parseTime(startTime) + ((i + chunkSize) / words.length) * chunkDuration

      vtt += `${index + 1}.${Math.floor(i / chunkSize) + 1}\n`
      vtt += `${formatVTTTime(chunkStart)} --> ${formatVTTTime(chunkEnd)}\n`
      
      if (rtl) {
        vtt += `<c.rtl>${chunk}</c>\n\n`
      } else {
        vtt += `${chunk}\n\n`
      }
    }
  })

  return vtt
}

/**
 * Convert time string to VTT format
 */
function timeToVTT(time: string): string {
  const parts = time.split(':')
  if (parts.length === 2) {
    return `00:${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}.000`
  } else if (parts.length === 3) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}.000`
  }
  return '00:00:00.000'
}

/**
 * Parse VTT time to seconds
 */
function parseTime(vttTime: string): number {
  const parts = vttTime.split(':')
  const hours = parseInt(parts[0])
  const minutes = parseInt(parts[1])
  const seconds = parseFloat(parts[2])
  return hours * 3600 + minutes * 60 + seconds
}

/**
 * Format seconds to VTT time
 */
function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`
}

/**
 * Batch translate and generate voiceovers for multiple languages
 */
export async function localizeContent(
  script: any,
  scenes: any[],
  targetLanguages: string[],
  settings: LocalizationSettings
): Promise<Record<string, TranslatedContent>> {
  const results: Record<string, TranslatedContent> = {}

  for (const language of targetLanguages) {
    try {
      console.log(`[Localization] Processing ${language}...`)

      // Translate script
      const translated = await translateScript(
        script,
        scenes,
        language,
        settings.cultural_adaptation
      )

      // Generate voiceovers if auto_translate is enabled
      if (settings.auto_translate) {
        const voiceoverScenes = []
        
        for (const scene of translated.scenes) {
          try {
            const audioUrl = await generateLocalizedVoiceover(
              scene.narration,
              language
            )
            voiceoverScenes.push({ ...scene, audio_url: audioUrl })
          } catch (error) {
            console.error(
              `[Localization] Failed to generate voiceover for scene ${scene.id}:`,
              error
            )
            voiceoverScenes.push(scene)
          }
        }

        translated.scenes = voiceoverScenes
      }

      // Generate subtitles
      const lang = SUPPORTED_LANGUAGES[language]
      const subtitles = generateSubtitles(
        scenes.map((s, idx) => ({
          ...s,
          narration: translated.scenes[idx].narration,
        })),
        settings.subtitle_style,
        lang.rtl
      )

      // Add subtitle URLs to scenes
      translated.scenes = translated.scenes.map((scene, idx) => ({
        ...scene,
        subtitle_url: `data:text/vtt;base64,${Buffer.from(subtitles).toString('base64')}`,
      }))

      results[language] = translated

      console.log(`[Localization] Completed ${language}`)
    } catch (error) {
      console.error(`[Localization] Error processing ${language}:`, error)
      throw error
    }
  }

  return results
}

/**
 * Detect cultural references that need adaptation
 */
export async function detectCulturalReferences(
  text: string,
  targetLanguage: string
): Promise<string[]> {
  const openaiKey = process.env.OPENAI_API_KEY?.trim()

  if (!openaiKey) {
    return []
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Identify cultural references, idioms, and phrases in the text that may not translate well to ${SUPPORTED_LANGUAGES[targetLanguage].name}. Return a JSON array of strings.`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()

    try {
      return JSON.parse(content)
    } catch {
      return []
    }
  } catch (error) {
    console.error('[Localization] Error detecting cultural references:', error)
    return []
  }
}
