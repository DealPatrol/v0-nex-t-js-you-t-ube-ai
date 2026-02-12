import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import {
  createCampaignSchedule,
  batchProcessForPlatforms,
  getOptimalPostingTime,
} from '@/lib/ai/automation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const { projectId, platforms, scheduledDate, autoOptimize } = await request.json()

    if (!projectId || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, platforms' },
        { status: 400 }
      )
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Create campaign schedules
    const baseDate = scheduledDate ? new Date(scheduledDate) : undefined
    const schedules = await createCampaignSchedule(projectId, platforms, baseDate)

    // Save schedules to database
    const schedulesToInsert = schedules.map(schedule => ({
      project_id: schedule.project_id,
      platforms: schedule.platforms,
      scheduled_date: schedule.scheduled_date.toISOString(),
      optimal_time: schedule.optimal_time,
      status: schedule.status,
      retry_count: schedule.retry_count,
    }))

    const { data: savedSchedules, error: insertError } = await supabase
      .from('campaign_schedules')
      .insert(schedulesToInsert)
      .select()

    if (insertError) {
      console.error('[Campaign API] Error saving schedules:', insertError)
      return NextResponse.json(
        { error: 'Failed to save campaign schedules' },
        { status: 500 }
      )
    }

    // Get result for this project
    const { data: result, error: resultError } = await supabase
      .from('results')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (resultError || !result || !result.scenes) {
      return NextResponse.json(
        { error: 'No completed video found for this project' },
        { status: 404 }
      )
    }

    // Batch process for platforms if auto-optimize is enabled
    let processingResults = {}
    if (autoOptimize) {
      console.log('[Campaign API] Starting batch processing for platforms...')
      processingResults = await batchProcessForPlatforms(
        result.id,
        platforms,
        result.scenes
      )
    }

    return NextResponse.json({
      success: true,
      schedules: savedSchedules,
      processingResults,
      message: autoOptimize
        ? 'Campaign scheduled and platform optimization queued'
        : 'Campaign scheduled successfully',
    })
  } catch (error) {
    console.error('[Campaign API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule campaign' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    let query = supabase.from('campaign_schedules').select('*')

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: schedules, error } = await query.order('scheduled_date', {
      ascending: true,
    })

    if (error) {
      throw error
    }

    return NextResponse.json({ schedules })
  } catch (error) {
    console.error('[Campaign API] Error fetching schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign schedules' },
      { status: 500 }
    )
  }
}
