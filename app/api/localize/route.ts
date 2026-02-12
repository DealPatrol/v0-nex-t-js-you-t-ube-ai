import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import {
  localizeContent,
  SUPPORTED_LANGUAGES,
  type LocalizationSettings,
} from '@/lib/ai/localization'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const {
      resultId,
      targetLanguages,
      culturalAdaptation = true,
      autoGenerateVoiceovers = true,
      subtitleStyle = 'universal',
    } = await request.json()

    if (!resultId || !targetLanguages || targetLanguages.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: resultId, targetLanguages' },
        { status: 400 }
      )
    }

    // Validate languages
    const invalidLanguages = targetLanguages.filter(
      (lang: string) => !SUPPORTED_LANGUAGES[lang]
    )
    if (invalidLanguages.length > 0) {
      return NextResponse.json(
        {
          error: `Unsupported languages: ${invalidLanguages.join(', ')}`,
          supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
        },
        { status: 400 }
      )
    }

    // Get the original result
    const { data: result, error: resultError } = await supabase
      .from('results')
      .select('*')
      .eq('id', resultId)
      .single()

    if (resultError || !result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      )
    }

    if (!result.script || !result.scenes) {
      return NextResponse.json(
        { error: 'Result does not have script or scenes' },
        { status: 400 }
      )
    }

    // Prepare localization settings
    const settings: LocalizationSettings = {
      target_languages: targetLanguages,
      auto_translate: autoGenerateVoiceovers,
      cultural_adaptation: culturalAdaptation,
      preserve_timing: true,
      subtitle_style: subtitleStyle,
    }

    console.log('[Localization API] Starting localization for:', targetLanguages)

    // Localize content
    const localizedContent = await localizeContent(
      result.script,
      result.scenes,
      targetLanguages,
      settings
    )

    // Save localized versions to database
    const localizationRecords = []

    for (const [language, content] of Object.entries(localizedContent)) {
      const { data: localizationRecord, error: localizationError } = await supabase
        .from('localizations')
        .insert({
          result_id: resultId,
          language: language,
          script: content.script,
          scenes: content.scenes,
          cultural_adaptations: content.cultural_adaptations || [],
          status: 'completed',
        })
        .select()
        .single()

      if (localizationError) {
        console.error(
          `[Localization API] Error saving ${language} localization:`,
          localizationError
        )
      } else {
        localizationRecords.push(localizationRecord)
      }
    }

    console.log(
      `[Localization API] Completed localization for ${localizationRecords.length} languages`
    )

    return NextResponse.json({
      success: true,
      localizations: localizationRecords,
      languages: targetLanguages,
      message: `Content localized to ${targetLanguages.length} language(s)`,
    })
  } catch (error) {
    console.error('[Localization API] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Localization failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const resultId = searchParams.get('resultId')
    const language = searchParams.get('language')

    if (!resultId) {
      return NextResponse.json(
        { error: 'resultId parameter is required' },
        { status: 400 }
      )
    }

    let query = supabase.from('localizations').select('*').eq('result_id', resultId)

    if (language) {
      query = query.eq('language', language)
    }

    const { data: localizations, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      localizations,
      supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
    })
  } catch (error) {
    console.error('[Localization API] Error fetching localizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch localizations' },
      { status: 500 }
    )
  }
}
