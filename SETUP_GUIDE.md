# Quick Setup Guide for Enhanced Features

This guide will help you set up and start using the new enhanced features.

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js 18+ installed
- ✅ A Supabase account and project
- ✅ OpenAI API key
- ✅ (Optional) ElevenLabs API key for enhanced voiceovers

## Step 1: Environment Setup

Create a `.env` or `.env.local` file in the root directory with the following variables:

```bash
# Required - OpenAI for script generation and embeddings
OPENAI_API_KEY=sk-your-openai-key-here

# Required - Supabase for database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Required - FAL.ai for video/image generation
FAL_KEY=your-fal-key-here

# Optional - ElevenLabs for enhanced voiceovers (falls back to OpenAI TTS)
ELEVENLABS_API_KEY=your-elevenlabs-key-here

# Optional - For development
NEXTAUTH_URL=http://localhost:3000
```

### Where to get API keys:

1. **OpenAI API Key**: https://platform.openai.com/api-keys
   - Create account → API keys → Create new secret key
   - Ensure you have GPT-4 Turbo access

2. **Supabase**: https://supabase.com/dashboard
   - Create new project → Settings → API
   - Copy URL and service_role key

3. **FAL.ai**: https://fal.ai/dashboard
   - Sign up → API Keys → Create new key

4. **ElevenLabs** (Optional): https://elevenlabs.io/
   - Sign up → Profile → API Keys
   - Free tier: 10,000 characters/month

## Step 2: Database Migration

Run the database migration to add the new tables:

### Using Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `scripts/migration-enhanced-features.sql`
4. Paste and run the query

### Using Supabase CLI:
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push scripts/migration-enhanced-features.sql
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the app.

## Step 5: Test the New Features

### Test 1: Generate a Video with Enhanced Features

1. Navigate to the home page
2. Fill in the video generation form:
   - Topic: "Benefits of AI in Healthcare"
   - Duration: 2 minutes
   - Tone: Professional
   - Platform: YouTube

3. The system will automatically:
   - ✅ Use GPT-4 Turbo for script generation
   - ✅ Apply semantic search to align visuals
   - ✅ Generate enhanced voiceovers with ElevenLabs
   - ✅ Apply appropriate video template

### Test 2: Schedule Multi-Platform Campaign

Once your video is generated:

```bash
curl -X POST http://localhost:3000/api/campaign \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "your-project-uuid",
    "platforms": ["youtube", "youtube-shorts", "instagram-reels"],
    "autoOptimize": true
  }'
```

This will:
- ✅ Schedule the video for optimal posting times
- ✅ Create platform-specific optimizations
- ✅ Queue batch processing

### Test 3: Localize Content

```bash
curl -X POST http://localhost:3000/api/localize \
  -H "Content-Type: application/json" \
  -d '{
    "resultId": "your-result-uuid",
    "targetLanguages": ["es", "fr", "de"],
    "culturalAdaptation": true,
    "autoGenerateVoiceovers": true
  }'
```

This will:
- ✅ Translate script and scenes to Spanish, French, and German
- ✅ Adapt cultural references and idioms
- ✅ Generate voiceovers in each language
- ✅ Create subtitles in WebVTT format

## Step 6: Verify Database Tables

Check that the new tables were created successfully:

```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('campaign_schedules', 'localizations', 'video_templates');
```

You should see all three tables listed.

## Feature Configuration

### Semantic Search Settings

The semantic search automatically refines visual prompts when alignment score is below 0.7. To adjust:

Edit `lib/ai/semantic-search.ts`:
```typescript
// Change threshold from 0.7 to your preference
if (score < 0.7) {  // Lower = more refinements
  refinedPrompt = await refineVisualPrompt(...)
}
```

### Voice Selection

Default voice selection is automatic based on tone and platform. To use a specific voice:

Edit `lib/video/video-generator.ts`:
```typescript
// Override automatic selection
import { VOICE_LIBRARY } from '@/lib/ai/enhanced-voiceover'
const voiceProfile = VOICE_LIBRARY[0] // Rachel (professional female)
```

### Template Selection

Default template is selected based on content category. To force a specific template:

```typescript
import { TEMPLATES } from '@/lib/ai/templates'
const template = TEMPLATES['modern_tutorial'] // or any other template ID
```

## Troubleshooting

### Issue: Semantic search not working
**Solution**: 
- Verify `OPENAI_API_KEY` is set correctly
- Check you have access to GPT-4 Turbo
- Review console logs for embedding errors

### Issue: ElevenLabs voiceover fails
**Solution**:
- Verify `ELEVENLABS_API_KEY` is set
- Check your ElevenLabs quota hasn't been exceeded
- System will automatically fall back to OpenAI TTS

### Issue: Campaign scheduling errors
**Solution**:
- Ensure database migration ran successfully
- Check `campaign_schedules` table exists
- Verify project_id exists in projects table

### Issue: Localization fails
**Solution**:
- Verify target language is in supported list
- Check OpenAI API rate limits
- Review translation API quotas

### Issue: "Module not found" errors
**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

## Production Deployment

### Recommended Stack:
- **Frontend**: Vercel (automatic deployments from GitHub)
- **Backend/Workers**: Railway, Render, or AWS EC2
- **Database**: Supabase (PostgreSQL)
- **Storage**: AWS S3 or Cloudflare R2
- **CDN**: Cloudflare

### Environment Variables for Production:
Ensure all environment variables are set in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Railway: Project → Variables
- AWS: Use AWS Secrets Manager

### Database for Production:
- Supabase handles scaling automatically
- Consider upgrading to Pro plan for production workloads
- Enable Point-in-Time Recovery for backups

### Monitoring:
- Enable Supabase logs and metrics
- Use Sentry or similar for error tracking
- Monitor API usage for OpenAI and ElevenLabs

## Cost Considerations

### OpenAI API Costs:
- GPT-4 Turbo: ~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens
- Embeddings (text-embedding-3-small): ~$0.00002 per 1K tokens
- Estimated cost per video: $0.05-$0.20 depending on duration

### ElevenLabs Costs:
- Free tier: 10,000 characters/month
- Starter: $5/month for 30,000 characters
- Creator: $22/month for 100,000 characters
- Fallback to OpenAI TTS if quota exceeded

### FAL.ai Costs:
- Video generation: ~$0.10-$0.30 per scene
- Image generation: ~$0.01 per image

### Total Estimated Cost:
- Per 2-minute video: $1-$3
- Per localized version: Additional $0.50-$1
- Per platform optimization: Minimal (~$0.10)

## Getting Help

1. **Documentation**: See `ENHANCED_FEATURES.md` for detailed feature documentation
2. **Issues**: Check console logs for detailed error messages
3. **Community**: Open an issue on GitHub for support

## Next Steps

Now that you're set up, explore:
- Customizing voice settings for different emotions
- Creating custom video templates
- Setting up recurring campaign schedules
- Building a content calendar for multiple platforms
- Experimenting with different languages and cultural adaptations

Happy video creating! 🎬
