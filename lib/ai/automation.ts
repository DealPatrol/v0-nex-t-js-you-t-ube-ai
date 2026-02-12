/**
 * Automation and Platform Optimization Service
 * Handles campaign scheduling and platform-specific video optimization
 */

export interface PlatformSpecs {
  name: string
  aspect_ratio: string
  max_duration: number // seconds
  min_duration: number // seconds
  recommended_resolution: string
  video_codec: string
  audio_codec: string
  max_file_size_mb: number
  recommended_framerate: number
  caption_style: 'top' | 'bottom' | 'center'
  safe_zone_percent: number // Percentage from edges
}

export const PLATFORM_SPECS: Record<string, PlatformSpecs> = {
  'youtube-shorts': {
    name: 'YouTube Shorts',
    aspect_ratio: '9:16',
    max_duration: 60,
    min_duration: 1,
    recommended_resolution: '1080x1920',
    video_codec: 'h264',
    audio_codec: 'aac',
    max_file_size_mb: 100,
    recommended_framerate: 30,
    caption_style: 'center',
    safe_zone_percent: 10,
  },
  'instagram-reels': {
    name: 'Instagram Reels',
    aspect_ratio: '9:16',
    max_duration: 90,
    min_duration: 3,
    recommended_resolution: '1080x1920',
    video_codec: 'h264',
    audio_codec: 'aac',
    max_file_size_mb: 100,
    recommended_framerate: 30,
    caption_style: 'center',
    safe_zone_percent: 15,
  },
  'tiktok': {
    name: 'TikTok',
    aspect_ratio: '9:16',
    max_duration: 180,
    min_duration: 3,
    recommended_resolution: '1080x1920',
    video_codec: 'h264',
    audio_codec: 'aac',
    max_file_size_mb: 287,
    recommended_framerate: 30,
    caption_style: 'bottom',
    safe_zone_percent: 12,
  },
  youtube: {
    name: 'YouTube',
    aspect_ratio: '16:9',
    max_duration: 43200, // 12 hours
    min_duration: 1,
    recommended_resolution: '1920x1080',
    video_codec: 'h264',
    audio_codec: 'aac',
    max_file_size_mb: 256000, // 256 GB
    recommended_framerate: 30,
    caption_style: 'bottom',
    safe_zone_percent: 5,
  },
  facebook: {
    name: 'Facebook',
    aspect_ratio: '16:9',
    max_duration: 240,
    min_duration: 1,
    recommended_resolution: '1280x720',
    video_codec: 'h264',
    audio_codec: 'aac',
    max_file_size_mb: 4000,
    recommended_framerate: 30,
    caption_style: 'bottom',
    safe_zone_percent: 8,
  },
  twitter: {
    name: 'Twitter/X',
    aspect_ratio: '16:9',
    max_duration: 140,
    min_duration: 1,
    recommended_resolution: '1280x720',
    video_codec: 'h264',
    audio_codec: 'aac',
    max_file_size_mb: 512,
    recommended_framerate: 30,
    caption_style: 'bottom',
    safe_zone_percent: 10,
  },
}

export interface CampaignSchedule {
  id: string
  project_id: string
  platforms: string[]
  scheduled_date: Date
  optimal_time?: boolean // Auto-detect optimal posting time
  status: 'pending' | 'processing' | 'completed' | 'failed'
  retry_count: number
  created_at: Date
  uploaded_urls?: Record<string, string>
}

export interface OptimizationSettings {
  platform: string
  auto_crop: boolean
  auto_captions: boolean
  add_hooks: boolean // Add platform-specific hooks
  optimize_audio: boolean
  add_trending_sounds?: boolean
}

/**
 * Get optimal posting times for different platforms
 */
export function getOptimalPostingTime(platform: string): Date {
  const now = new Date()
  const dayOfWeek = now.getDay()
  
  // Platform-specific optimal times (based on engagement data)
  const optimalTimes: Record<string, { hour: number; minute: number }> = {
    'youtube-shorts': { hour: 18, minute: 0 }, // 6 PM
    'instagram-reels': { hour: 19, minute: 0 }, // 7 PM
    tiktok: { hour: 19, minute: 30 }, // 7:30 PM
    youtube: { hour: 14, minute: 0 }, // 2 PM
    facebook: { hour: 13, minute: 0 }, // 1 PM
    twitter: { hour: 12, minute: 0 }, // 12 PM
  }

  const time = optimalTimes[platform] || { hour: 15, minute: 0 }
  
  // Schedule for next occurrence of optimal time
  const scheduledDate = new Date(now)
  scheduledDate.setHours(time.hour, time.minute, 0, 0)
  
  // If time has passed today, schedule for tomorrow
  if (scheduledDate < now) {
    scheduledDate.setDate(scheduledDate.getDate() + 1)
  }
  
  // Avoid weekends for business content (optional)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const daysToAdd = dayOfWeek === 0 ? 1 : 2
    scheduledDate.setDate(scheduledDate.getDate() + daysToAdd)
  }
  
  return scheduledDate
}

/**
 * Optimize video settings for specific platform
 */
export function getOptimizedSettings(
  platform: string,
  duration: number
): OptimizationSettings {
  const specs = PLATFORM_SPECS[platform]
  
  if (!specs) {
    throw new Error(`Unknown platform: ${platform}`)
  }

  // Adjust duration if needed
  const adjustedDuration = Math.min(
    Math.max(duration, specs.min_duration),
    specs.max_duration
  )

  return {
    platform,
    auto_crop: specs.aspect_ratio !== '16:9', // Crop if not standard
    auto_captions: true, // Always add captions for accessibility
    add_hooks: ['youtube-shorts', 'instagram-reels', 'tiktok'].includes(platform),
    optimize_audio: true,
    add_trending_sounds: ['tiktok', 'instagram-reels'].includes(platform),
  }
}

/**
 * Generate platform-specific hooks and CTAs
 */
export function generatePlatformHooks(
  platform: string,
  topic: string
): { opening_hook: string; cta: string } {
  const hooks: Record<
    string,
    { opening_hook: string; cta: string }
  > = {
    'youtube-shorts': {
      opening_hook: `Wait, did you know about ${topic}? 👀`,
      cta: 'Like and follow for more!',
    },
    'instagram-reels': {
      opening_hook: `You won't believe this about ${topic}! 🤯`,
      cta: 'Save this and share with friends!',
    },
    tiktok: {
      opening_hook: `POV: You just learned about ${topic} 😱`,
      cta: 'Follow for part 2!',
    },
    youtube: {
      opening_hook: `In this video, we're diving deep into ${topic}.`,
      cta: 'Don\'t forget to like, subscribe, and hit the bell icon!',
    },
    facebook: {
      opening_hook: `Here's what you need to know about ${topic}.`,
      cta: 'Share this with your network!',
    },
    twitter: {
      opening_hook: `Let's talk about ${topic} 🧵`,
      cta: 'RT if you found this valuable!',
    },
  }

  return (
    hooks[platform] || {
      opening_hook: `Today we're exploring ${topic}.`,
      cta: 'Thanks for watching!',
    }
  )
}

/**
 * Create campaign schedule for multiple platforms
 */
export async function createCampaignSchedule(
  projectId: string,
  platforms: string[],
  baseDate?: Date
): Promise<CampaignSchedule[]> {
  const schedules: CampaignSchedule[] = []

  for (const platform of platforms) {
    const scheduledDate = baseDate || getOptimalPostingTime(platform)

    const schedule: CampaignSchedule = {
      id: `campaign_${Date.now()}_${platform}`,
      project_id: projectId,
      platforms: [platform],
      scheduled_date: scheduledDate,
      optimal_time: !baseDate, // True if we auto-detected optimal time
      status: 'pending',
      retry_count: 0,
      created_at: new Date(),
    }

    schedules.push(schedule)
  }

  return schedules
}

/**
 * Batch process videos for multiple platforms
 */
export async function batchProcessForPlatforms(
  resultId: string,
  platforms: string[],
  scenes: any[]
): Promise<Record<string, { status: string; videoUrl?: string }>> {
  const results: Record<string, { status: string; videoUrl?: string }> = {}

  for (const platform of platforms) {
    try {
      const specs = PLATFORM_SPECS[platform]
      const settings = getOptimizedSettings(platform, 60) // Default 60s

      console.log(`[Automation] Processing for ${platform}...`)

      // Here you would call the video processing API with platform-specific settings
      // For now, we'll simulate the process
      results[platform] = {
        status: 'queued',
        videoUrl: undefined, // Will be populated after processing
      }
    } catch (error) {
      console.error(`[Automation] Error processing for ${platform}:`, error)
      results[platform] = {
        status: 'failed',
      }
    }
  }

  return results
}

/**
 * Auto-retry logic for failed uploads
 */
export async function retryFailedCampaigns(
  maxRetries: number = 3
): Promise<void> {
  console.log('[Automation] Checking for failed campaigns...')
  
  // This would query your database for failed campaigns
  // and retry them with exponential backoff
  const failedCampaigns: CampaignSchedule[] = [] // Query from DB

  for (const campaign of failedCampaigns) {
    if (campaign.retry_count < maxRetries) {
      console.log(
        `[Automation] Retrying campaign ${campaign.id} (attempt ${campaign.retry_count + 1})`
      )
      
      // Exponential backoff: 5min, 15min, 45min
      const backoffMinutes = Math.pow(3, campaign.retry_count) * 5
      const retryDate = new Date(
        Date.now() + backoffMinutes * 60 * 1000
      )

      // Update campaign with new retry date
      campaign.scheduled_date = retryDate
      campaign.retry_count++
      
      // Save to DB and re-queue
    } else {
      console.log(
        `[Automation] Campaign ${campaign.id} exceeded max retries`
      )
      campaign.status = 'failed'
      // Save to DB
    }
  }
}

/**
 * Generate content calendar for recurring campaigns
 */
export function generateContentCalendar(
  startDate: Date,
  frequency: 'daily' | 'weekly' | 'biweekly',
  platforms: string[],
  count: number = 10
): Date[] {
  const dates: Date[] = []
  let currentDate = new Date(startDate)

  const incrementDays: Record<string, number> = {
    daily: 1,
    weekly: 7,
    biweekly: 14,
  }

  const days = incrementDays[frequency]

  for (let i = 0; i < count; i++) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + days)
  }

  return dates
}
