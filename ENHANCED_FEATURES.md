# Enhanced Video Generation Features

This document describes the new features added to enhance the video generation app to rival InVideo AI.

## Overview

The app has been enhanced with five major feature sets:
1. **Script and Pixel Matching** - Advanced GPT-4 with semantic visual alignment
2. **Enhanced Voiceovers** - ElevenLabs integration with pitch/tone modulation
3. **Automation Enhancements** - Campaign scheduling and platform optimization
4. **Video Transitions and Templates** - Cinematic effects and template library
5. **Localization** - Multi-language support with cultural adaptation

## 1. Script and Pixel Matching

### Features
- **GPT-4 Turbo Integration**: Upgraded from GPT-4o-mini to GPT-4 Turbo for higher-quality script generation
- **Semantic Search**: Uses OpenAI embeddings to match visuals with narration
- **Visual Refinement**: Automatically refines visual prompts that don't align well with narration
- **Quality Scoring**: Tracks semantic alignment scores for each scene

### Usage
```typescript
import { alignVisualWithNarration } from '@/lib/ai/semantic-search'

// Automatically called during scene generation
const alignment = await alignVisualWithNarration(
  narration,
  visualDescription
)

// Returns: { visual_description, score, refined_prompt }
```

### Configuration
- Semantic similarity threshold: 0.7 (prompts below this are refined)
- Model: `text-embedding-3-small` for embeddings
- Refinement model: `gpt-4-turbo-preview`

## 2. Enhanced Voiceovers

### Features
- **ElevenLabs Integration**: Primary TTS with natural-sounding voices
- **Voice Library**: 6 pre-configured voices for different use cases
- **Context-Aware Modulation**: Automatic pitch, tone, and speed adjustment
- **Multi-Voice Support**: Different voices for different speakers
- **Emotion Detection**: Analyzes text to determine optimal voice settings

### Voice Library
| Voice | Gender | Use Case | Best For |
|-------|--------|----------|----------|
| Rachel | Female | Professional | Educational content, news |
| Adam | Male | Professional | Narration, documentaries |
| Bella | Female | Expressive | Storytelling, tutorials |
| Antoni | Male | Casual | Social media, entertainment |
| Elli | Female | Character | Gaming, animation |
| Josh | Male | Energetic | Gaming, sports |

### Usage
```typescript
import { 
  selectVoiceForContext,
  generateEnhancedVoiceover 
} from '@/lib/ai/enhanced-voiceover'

// Automatic voice selection
const voice = selectVoiceForContext('professional', 'youtube')

// Generate with modulation
const audioUrl = await generateEnhancedVoiceover(
  text,
  voice.id,
  { stability: 0.5, pitch: 0, speed: 1.0 }
)
```

### Voice Settings
- **Stability** (0-1): Lower = more expressive
- **Similarity Boost** (0-1): Higher = closer to original voice
- **Style** (0-1): Exaggeration level
- **Pitch** (-1 to 1): Pitch shift
- **Speed** (0.5-2.0): Speed multiplier

### Fallback
- If ElevenLabs is unavailable, automatically falls back to OpenAI TTS
- Maintains compatibility with existing workflow

## 3. Automation Enhancements

### Features
- **Campaign Scheduling**: Pre-schedule videos for multiple platforms
- **Optimal Timing**: Automatic detection of best posting times per platform
- **Platform Optimization**: Platform-specific video settings and formatting
- **Batch Processing**: Process videos for multiple platforms simultaneously
- **Auto-Retry**: Exponential backoff retry for failed uploads
- **Content Calendar**: Generate recurring campaign schedules

### Platform Support
| Platform | Aspect Ratio | Max Duration | Optimal Time |
|----------|-------------|--------------|--------------|
| YouTube Shorts | 9:16 | 60s | 6:00 PM |
| Instagram Reels | 9:16 | 90s | 7:00 PM |
| TikTok | 9:16 | 180s | 7:30 PM |
| YouTube | 16:9 | 12 hours | 2:00 PM |
| Facebook | 16:9 | 240s | 1:00 PM |
| Twitter/X | 16:9 | 140s | 12:00 PM |

### API Endpoints

#### Schedule Campaign
```bash
POST /api/campaign
{
  "projectId": "uuid",
  "platforms": ["youtube-shorts", "instagram-reels"],
  "scheduledDate": "2026-02-15T18:00:00Z", // optional
  "autoOptimize": true
}
```

#### Get Campaigns
```bash
GET /api/campaign?projectId=uuid&status=pending
```

### Platform-Specific Hooks
Each platform gets customized hooks and CTAs:
- **YouTube Shorts**: "Wait, did you know about {topic}? 👀"
- **Instagram Reels**: "You won't believe this about {topic}! 🤯"
- **TikTok**: "POV: You just learned about {topic} 😱"

## 4. Video Transitions and Templates

### Features
- **Cinematic Transitions**: 9 pre-defined transition types
- **Animation Library**: 10+ animation effects
- **Template System**: 6 pre-made templates for different content types
- **Custom Templates**: Import/export custom template configurations
- **FFmpeg Integration**: Direct filter generation for transitions

### Transition Types
- **Fade**: fade_in, fade_out, crossfade
- **Wipe**: wipe_left, wipe_right
- **Zoom**: zoom_in, zoom_out
- **Slide**: slide_up, slide_down
- **Special**: blur_transition

### Animation Effects
- **Text**: fade_in, slide_in, typewriter, bounce
- **Element**: scale, rotate
- **Camera**: pan_right, zoom_in

### Pre-Made Templates

#### Modern Tutorial
- **Category**: Tutorial
- **Style**: Professional, clean
- **Colors**: Blue (#4A90E2), White, Dark Gray
- **Best For**: Educational content, how-tos

#### Dynamic Explainer
- **Category**: Explainer
- **Style**: Energetic, animated
- **Colors**: Red (#FF6B6B), Teal (#4ECDC4), Blue (#45B7D1)
- **Best For**: Product demos, concepts

#### Minimal Review
- **Category**: Review
- **Style**: Simple, elegant
- **Colors**: Black, White, Light Gray
- **Best For**: Product reviews, comparisons

#### News Broadcast
- **Category**: News
- **Style**: Professional, authoritative
- **Colors**: Red (#C41E3A), White, Dark Gray
- **Best For**: News, announcements

#### Casual Vlog
- **Category**: Vlog
- **Style**: Relaxed, personal
- **Colors**: Pink, Sky Blue, Gold
- **Best For**: Personal vlogs, lifestyle

#### High Energy Promo
- **Category**: Promo
- **Style**: Fast-paced, bold
- **Colors**: Hot Pink, Purple, Orange
- **Best For**: Promotions, ads, teasers

### Usage
```typescript
import { selectTemplate, applyTemplateToScenes } from '@/lib/ai/templates'

// Select template based on content
const template = selectTemplate('tutorial', 300, 'professional')

// Apply to scenes
const styledScenes = applyTemplateToScenes(scenes, template)
```

## 5. Localization

### Features
- **Multi-Language Translation**: 15+ supported languages
- **Cultural Adaptation**: Automatic adaptation of idioms and references
- **Localized Voiceovers**: ElevenLabs multilingual TTS
- **Subtitle Generation**: WebVTT format with platform-specific styling
- **RTL Support**: Right-to-left languages (Arabic)
- **Batch Localization**: Process multiple languages simultaneously

### Supported Languages
| Code | Language | Voice Model | Notes |
|------|----------|-------------|-------|
| en | English | Monolingual/Multilingual | - |
| es | Spanish | Multilingual | Regional variations |
| fr | French | Multilingual | - |
| de | German | Multilingual | - |
| it | Italian | Multilingual | - |
| pt | Portuguese | Multilingual | Brazilian/European |
| pl | Polish | Multilingual | - |
| ja | Japanese | Multilingual | Formal/informal |
| ko | Korean | Multilingual | Honorifics |
| zh | Chinese | Multilingual | Simplified/Traditional |
| ar | Arabic | Multilingual | RTL support |
| hi | Hindi | Multilingual | - |
| ru | Russian | Multilingual | - |
| nl | Dutch | Multilingual | - |
| sv | Swedish | Multilingual | - |

### API Endpoints

#### Localize Content
```bash
POST /api/localize
{
  "resultId": "uuid",
  "targetLanguages": ["es", "fr", "de"],
  "culturalAdaptation": true,
  "autoGenerateVoiceovers": true,
  "subtitleStyle": "universal"
}
```

#### Get Localizations
```bash
GET /api/localize?resultId=uuid&language=es
```

### Usage
```typescript
import { 
  localizeContent,
  SUPPORTED_LANGUAGES 
} from '@/lib/ai/localization'

// Localize to multiple languages
const localized = await localizeContent(
  script,
  scenes,
  ['es', 'fr', 'de'],
  {
    target_languages: ['es', 'fr', 'de'],
    auto_translate: true,
    cultural_adaptation: true,
    preserve_timing: true,
    subtitle_style: 'universal'
  }
)
```

### Subtitle Styles
- **Netflix**: Dark background, Netflix Sans font
- **YouTube**: Semi-transparent background
- **Universal**: Standard WebVTT format

### Cultural Adaptation
When enabled, the system:
1. Detects cultural references and idioms
2. Adapts them for target culture
3. Maintains original meaning and tone
4. Tracks adaptations made

Example:
- Original (EN): "It's raining cats and dogs"
- Adapted (ES): "Está lloviendo a cántaros" (culturally appropriate idiom)

## Database Schema

### New Tables

#### campaign_schedules
```sql
CREATE TABLE campaign_schedules (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects,
  platforms TEXT[],
  scheduled_date TIMESTAMP,
  optimal_time BOOLEAN,
  status TEXT,
  retry_count INTEGER,
  uploaded_urls JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### localizations
```sql
CREATE TABLE localizations (
  id UUID PRIMARY KEY,
  result_id UUID REFERENCES results,
  language TEXT,
  script TEXT,
  scenes JSONB,
  cultural_adaptations TEXT[],
  status TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### video_templates
```sql
CREATE TABLE video_templates (
  id UUID PRIMARY KEY,
  name TEXT,
  category TEXT,
  description TEXT,
  template_config JSONB,
  is_custom BOOLEAN,
  user_id TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Updated Tables

#### results (new columns)
- `template_id`: UUID reference to video_templates
- `semantic_scores`: JSONB array of scene alignment scores
- `voice_settings`: JSONB voice configuration used
- `platform_optimizations`: JSONB platform-specific settings

## Environment Variables

Add these to your `.env` file:

```bash
# Required for all features
OPENAI_API_KEY=sk-...

# Required for enhanced voiceovers (optional, falls back to OpenAI)
ELEVENLABS_API_KEY=...

# Existing variables
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
FAL_KEY=...
```

## Migration

To enable the new features, run the database migration:

```bash
# Using Supabase CLI
supabase db push scripts/migration-enhanced-features.sql

# Or execute directly in Supabase SQL Editor
cat scripts/migration-enhanced-features.sql | supabase db execute
```

## Integration Example

Here's how all features work together in a complete workflow:

```typescript
// 1. Generate script with GPT-4 Turbo (automatic)
const result = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    topic: 'AI in Healthcare',
    video_length_minutes: 2,
    tone: 'professional',
    platform: 'youtube'
  })
})

// 2. Scenes are generated with semantic alignment (automatic)
// Each scene gets a semantic score and refined visual prompt

// 3. Enhanced voiceovers are generated (automatic)
// Voice is selected based on tone and platform

// 4. Template is applied (automatic)
// Transitions and animations are added

// 5. Schedule campaign to multiple platforms
await fetch('/api/campaign', {
  method: 'POST',
  body: JSON.stringify({
    projectId: result.projectId,
    platforms: ['youtube', 'youtube-shorts', 'instagram-reels'],
    autoOptimize: true // Platform-specific optimization
  })
})

// 6. Localize to multiple languages
await fetch('/api/localize', {
  method: 'POST',
  body: JSON.stringify({
    resultId: result.resultId,
    targetLanguages: ['es', 'fr', 'de', 'pt'],
    culturalAdaptation: true,
    autoGenerateVoiceovers: true
  })
})
```

## Performance Considerations

### Semantic Search
- Embeddings cached in database to avoid regeneration
- Batch processing for multiple scenes
- Parallel execution where possible

### Voiceovers
- ElevenLabs has rate limits (check your plan)
- Fallback to OpenAI TTS ensures reliability
- Audio files cached as data URLs

### Localization
- Translation is CPU-intensive (use GPT-4 Turbo for speed)
- Process languages in parallel
- Consider queuing for large batches

### Platform Optimization
- Batch processing queued for background execution
- Results stored and tracked in database
- Retry logic handles transient failures

## Testing

### Test Semantic Search
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"topic":"AI Technology","video_length_minutes":1,"tone":"professional","platform":"youtube"}'
```

Check console logs for semantic alignment scores.

### Test Enhanced Voiceovers
Requires `ELEVENLABS_API_KEY` in environment.
Check audio quality and voice characteristics.

### Test Campaign Scheduling
```bash
curl -X POST http://localhost:3000/api/campaign \
  -H "Content-Type: application/json" \
  -d '{"projectId":"<uuid>","platforms":["youtube-shorts"],"autoOptimize":true}'
```

### Test Localization
```bash
curl -X POST http://localhost:3000/api/localize \
  -H "Content-Type: application/json" \
  -d '{"resultId":"<uuid>","targetLanguages":["es","fr"],"culturalAdaptation":true}'
```

## Troubleshooting

### Semantic search not working
- Verify `OPENAI_API_KEY` is set
- Check API rate limits
- Review console logs for errors

### ElevenLabs voiceover fails
- Verify `ELEVENLABS_API_KEY` is set
- Check API quota/balance
- System will fall back to OpenAI TTS

### Campaign scheduling issues
- Verify database migration ran successfully
- Check `campaign_schedules` table exists
- Review platform specifications

### Localization errors
- Verify target language is supported
- Check translation API rate limits
- Review cultural adaptation results

## Future Enhancements

Potential future additions:
- AI-powered video editing suggestions
- Real-time collaboration on video projects
- A/B testing for different video variants
- Advanced analytics and performance tracking
- Custom voice cloning
- More template categories
- Additional platform integrations

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Review this documentation
3. Check API rate limits and quotas
4. Verify environment variables are set correctly

## License

All new features maintain the same license as the base project.
