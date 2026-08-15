/**
 * gemini.js — Gemini API Integration with Smart Fallback & Rule Engine
 */

const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

const REQUEST_TIMEOUT_MS = 15000

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
}`
}

/**
 * Smart Rule-Based Fallback Parser (guarantees zero UI crashes)
 */
function parseUpdateLocally(rawText, milestones = [], tasks = []) {
  const lower = rawText.toLowerCase()
  let inferredStatus = null
  if (lower.includes('complete') || lower.includes('done') || lower.includes('finish') || lower.includes('passed')) {
    inferredStatus = 'done'
  } else if (lower.includes('block') || lower.includes('stuck') || lower.includes('issue') || lower.includes('delay')) {
    inferredStatus = 'blocked'
  } else if (lower.includes('progress') || lower.includes('start') || lower.includes('working')) {
    inferredStatus = 'open'
  }

  // Match milestone by name keyword
  let matchedMs = milestones.find((m) =>
    m.name && lower.includes(m.name.toLowerCase().split(' ')[0])
  )
  if (!matchedMs && milestones.length > 0) {
    matchedMs = milestones[0]
  }

  // Match task
  let matchedTask = tasks.find((t) =>
    t.name && lower.includes(t.name.toLowerCase().split(' ')[0])
  )

  const cleanSummary = rawText.length > 100 ? `${rawText.substring(0, 97)}...` : rawText

  return {
    milestoneId: matchedMs ? matchedMs.id : null,
    milestoneName: matchedMs ? matchedMs.name : null,
    taskId: matchedTask ? matchedTask.id : null,
    taskName: matchedTask ? matchedTask.name : null,
    summary: cleanSummary,
    inferredStatus,
    confidence: 'medium',
  }
}

/**
 * Call the Gemini API and return the structured update object.
 * Includes local smart fallback if API key or endpoint fails.
 */
export async function parseUpdateWithGemini(rawText, milestones = [], tasks = []) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return parseUpdateLocally(rawText, milestones, tasks)
  }

  const prompt = buildPrompt(rawText, milestones, tasks)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_URL}?key=${apiKey}`, {
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

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}, falling back to smart rule parser.`)
      return parseUpdateLocally(rawText, milestones, tasks)
    }

    const data = await response.json()
    const rawOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    if (!rawOutput.trim()) {
      return parseUpdateLocally(rawText, milestones, tasks)
    }

    const cleaned = rawOutput
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const parsed = JSON.parse(cleaned)
    return {
      milestoneId: parsed.milestoneId || null,
      milestoneName: parsed.milestoneName || null,
      taskId: parsed.taskId || null,
      taskName: parsed.taskName || null,
      summary: parsed.summary || rawText,
      inferredStatus: ['open', 'blocked', 'done'].includes(parsed.inferredStatus) ? parsed.inferredStatus : null,
      confidence: parsed.confidence || 'medium',
    }
  } catch (err) {
    clearTimeout(timeoutId)
    console.warn('Gemini API call failed, using smart fallback parser:', err.message)
    return parseUpdateLocally(rawText, milestones, tasks)
  }
}
