/**
 * gemini.js — Wrapper around the Gemini REST API with strict JSON mode,
 * request timeout, and rate-limit handling.
 */

const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent'

const REQUEST_TIMEOUT_MS = 15000 // 15 second timeout

function buildPrompt(rawText, milestones, tasks) {
  const msLines = milestones.length
    ? milestones.map((m) => `  • [${m.id}] "${m.name}" — status: ${m.status}, due: ${m.dueDate}`).join('\n')
    : '  (none)'

  const taskLines = tasks.length
    ? tasks.map((t) => `  • [${t.id}] "${t.name}" — status: ${t.status}`).join('\n')
    : '  (none)'

  return `You are a project delivery assistant parsing a raw team update into structured JSON.

PROJECT MILESTONES:
${msLines}

PROJECT TASKS:
${taskLines}

RAW UPDATE TEXT:
"""
${rawText}
"""

Analyse the raw text above and return a JSON object with exactly these fields:

{
  "milestoneId":   "<id of the most relevant milestone, or null>",
  "milestoneName": "<name of that milestone, or null>",
  "taskId":        "<id of the most relevant task within that milestone, or null>",
  "taskName":      "<name of that task, or null>",
  "summary":       "<one professional sentence summarising the update — suitable for a customer-facing changelog; omit owner names and internal jargon>",
  "inferredStatus": "<new status implied for the matched milestone or task: one of open | blocked | done — or null if no status change is implied>",
  "confidence":    "<high | medium | low>"
}

Rules:
- Match milestoneId / taskId by semantic similarity to the update text — use the ids exactly as listed.
- If nothing matches, set milestoneId, milestoneName, taskId, taskName all to null.
- summary must be neutral, concise (≤ 20 words), and safe to show a customer (omit internal names/jargon).
- inferredStatus: determine if the update indicates a status state for the matched item. Use 'blocked' if stuck/kicked back/delayed, 'done' if finished/passed/complete, 'open' if in progress/started, or null if no status state is indicated.`
}

/**
 * Call the Gemini API and return the structured update object.
 * Includes 15s timeout and friendly 429 rate limit handling.
 */
export async function parseUpdateWithGemini(rawText, milestones, tasks) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'VITE_GEMINI_API_KEY is not set. Add it to your .env file and restart the dev server.'
    )
  }

  const prompt = buildPrompt(rawText, milestones, tasks)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response
  try {
    response = await fetch(`${API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    })
  } catch (networkErr) {
    clearTimeout(timeoutId)
    if (networkErr.name === 'AbortError') {
      throw new Error(
        'Request timed out (15s limit). Please check your internet connection or try again.'
      )
    }
    throw new Error(`Network error reaching Gemini API: ${networkErr.message}`)
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const errBody = await response.text()
    if (response.status === 429) {
      throw new Error(
        'Rate limit reached (Free Tier limit: ~15 requests/min). Please wait 10–15 seconds and click "Parse & Add Update" again.'
      )
    }
    throw new Error(`Gemini API error (${response.status}): ${errBody}`)
  }

  const data = await response.json()

  // Extract the model's text output
  const rawOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  if (!rawOutput.trim()) {
    throw new Error('Gemini returned an empty response.')
  }

  // Strip accidental markdown fences if any
  const cleaned = rawOutput
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(
      `Model output was not valid JSON.\n\nRaw output:\n${rawOutput}`
    )
  }

  // Validate required fields exist
  const required = ['milestoneId', 'milestoneName', 'taskId', 'taskName', 'summary', 'inferredStatus', 'confidence']
  for (const field of required) {
    if (!(field in parsed)) {
      throw new Error(`Parsed JSON is missing required field: "${field}"`)
    }
  }

  // Sanitise inferredStatus
  const validStatuses = ['open', 'blocked', 'done', null]
  if (!validStatuses.includes(parsed.inferredStatus)) {
    parsed.inferredStatus = null
  }

  return parsed
}
