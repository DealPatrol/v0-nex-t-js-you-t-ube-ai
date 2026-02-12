/**
 * Semantic Search Service
 * Uses OpenAI embeddings to match visuals with script content
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export interface SemanticMatch {
  visual_description: string
  score: number
  refined_prompt: string
}

/**
 * Generate embeddings for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const openaiKey = process.env.OPENAI_API_KEY?.trim()
  
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to generate embedding')
    }

    const data = await response.json()
    return data.data[0].embedding
  } catch (error) {
    console.error('[SemanticSearch] Error generating embedding:', error)
    throw error
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Enhance visual description to align with narration using semantic search
 */
export async function alignVisualWithNarration(
  narration: string,
  visualDescription: string
): Promise<SemanticMatch> {
  try {
    // Generate embeddings for both texts
    const [narrationEmbedding, visualEmbedding] = await Promise.all([
      generateEmbedding(narration),
      generateEmbedding(visualDescription),
    ])

    // Calculate similarity score
    const score = cosineSimilarity(narrationEmbedding, visualEmbedding)

    // If similarity is low, refine the visual description
    let refinedPrompt = visualDescription
    if (score < 0.7) {
      refinedPrompt = await refineVisualPrompt(narration, visualDescription)
    }

    return {
      visual_description: visualDescription,
      score,
      refined_prompt: refinedPrompt,
    }
  } catch (error) {
    console.error('[SemanticSearch] Error aligning visual with narration:', error)
    // Return original description on error
    return {
      visual_description: visualDescription,
      score: 0,
      refined_prompt: visualDescription,
    }
  }
}

/**
 * Refine visual prompt to better match narration using GPT-4
 */
async function refineVisualPrompt(
  narration: string,
  visualDescription: string
): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY?.trim()
  
  if (!openaiKey) {
    return visualDescription
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
            content: `You are an expert at creating visual descriptions for video generation. Given a narration and an initial visual description, refine the visual description to perfectly match the narration's content, mood, and message. Keep it concise (under 100 words) and highly visual.`,
          },
          {
            role: 'user',
            content: `Narration: "${narration}"\n\nInitial Visual: "${visualDescription}"\n\nRefine the visual description to perfectly align with the narration:`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      console.error('[SemanticSearch] Failed to refine prompt')
      return visualDescription
    }

    const data = await response.json()
    return data.choices[0].message.content.trim()
  } catch (error) {
    console.error('[SemanticSearch] Error refining visual prompt:', error)
    return visualDescription
  }
}

/**
 * Score and select best visual from multiple options
 */
export async function selectBestVisual(
  narration: string,
  visualOptions: string[]
): Promise<{ visual: string; score: number }> {
  try {
    const narrationEmbedding = await generateEmbedding(narration)
    
    // Generate embeddings for all visual options
    const visualEmbeddings = await Promise.all(
      visualOptions.map(visual => generateEmbedding(visual))
    )
    
    // Calculate scores
    const scores = visualEmbeddings.map(embedding => 
      cosineSimilarity(narrationEmbedding, embedding)
    )
    
    // Find best match
    const bestIndex = scores.indexOf(Math.max(...scores))
    
    return {
      visual: visualOptions[bestIndex],
      score: scores[bestIndex],
    }
  } catch (error) {
    console.error('[SemanticSearch] Error selecting best visual:', error)
    // Return first option on error
    return {
      visual: visualOptions[0] || '',
      score: 0,
    }
  }
}
