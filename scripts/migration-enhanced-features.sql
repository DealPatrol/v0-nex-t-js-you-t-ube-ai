-- Migration: Add tables for enhanced features
-- Date: 2026-02-12

-- Create campaign_schedules table for automation
CREATE TABLE IF NOT EXISTS campaign_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  platforms TEXT[] NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  optimal_time BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  uploaded_urls JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create localizations table for multi-language support
CREATE TABLE IF NOT EXISTS localizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES results(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  script TEXT,
  scenes JSONB,
  cultural_adaptations TEXT[],
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create templates table for video templates
CREATE TABLE IF NOT EXISTS video_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  template_config JSONB NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add new columns to existing tables
ALTER TABLE results 
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES video_templates(id),
  ADD COLUMN IF NOT EXISTS semantic_scores JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS voice_settings JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS platform_optimizations JSONB DEFAULT '{}';

-- Add clip duration columns if not exists (for existing schema compatibility)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS youtube_clip_duration INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tiktok_clip_duration INTEGER DEFAULT 15;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS campaign_schedules_project_id_idx ON campaign_schedules(project_id);
CREATE INDEX IF NOT EXISTS campaign_schedules_status_idx ON campaign_schedules(status);
CREATE INDEX IF NOT EXISTS campaign_schedules_scheduled_date_idx ON campaign_schedules(scheduled_date);

CREATE INDEX IF NOT EXISTS localizations_result_id_idx ON localizations(result_id);
CREATE INDEX IF NOT EXISTS localizations_language_idx ON localizations(language);
CREATE INDEX IF NOT EXISTS localizations_status_idx ON localizations(status);

CREATE INDEX IF NOT EXISTS video_templates_category_idx ON video_templates(category);
CREATE INDEX IF NOT EXISTS video_templates_user_id_idx ON video_templates(user_id);

-- Insert default video templates
INSERT INTO video_templates (id, name, category, description, template_config, is_custom)
VALUES
  (
    gen_random_uuid(),
    'Modern Tutorial',
    'tutorial',
    'Clean, professional template for educational content',
    '{
      "color_scheme": ["#4A90E2", "#FFFFFF", "#2C3E50"],
      "font_family": "Inter, sans-serif",
      "transitions": ["crossfade", "slide_up", "fade_in"],
      "animations": ["text_slide_in", "element_scale"],
      "layout": "split",
      "text_style": "bold"
    }',
    false
  ),
  (
    gen_random_uuid(),
    'Dynamic Explainer',
    'explainer',
    'Energetic template with smooth animations',
    '{
      "color_scheme": ["#FF6B6B", "#4ECDC4", "#45B7D1"],
      "font_family": "Poppins, sans-serif",
      "transitions": ["zoom_in", "wipe_left", "blur_transition"],
      "animations": ["text_bounce", "element_rotate", "camera_zoom_in"],
      "layout": "full",
      "text_style": "decorative"
    }',
    false
  ),
  (
    gen_random_uuid(),
    'Minimal Review',
    'review',
    'Simple, elegant template for product reviews',
    '{
      "color_scheme": ["#000000", "#FFFFFF", "#F5F5F5"],
      "font_family": "Helvetica, Arial, sans-serif",
      "transitions": ["fade_in", "fade_out", "crossfade"],
      "animations": ["text_fade_in", "element_scale"],
      "layout": "full",
      "text_style": "minimal"
    }',
    false
  )
ON CONFLICT DO NOTHING;

-- Create a function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_campaign_schedules_updated_at ON campaign_schedules;
CREATE TRIGGER update_campaign_schedules_updated_at
    BEFORE UPDATE ON campaign_schedules
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_localizations_updated_at ON localizations;
CREATE TRIGGER update_localizations_updated_at
    BEFORE UPDATE ON localizations
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_templates_updated_at ON video_templates;
CREATE TRIGGER update_video_templates_updated_at
    BEFORE UPDATE ON video_templates
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
