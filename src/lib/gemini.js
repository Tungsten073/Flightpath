/**
 * gemini.js — Gemini Multi-Entity AI Parser & Smart Rule Engine
 * Decodes raw team updates into Milestones, Tasks, Issues, and Project Statuses.
 */

const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

const REQUEST_TIMEOUT_MS = 15000

function buildPrompt(rawText, milestones = [], tasks = [], issues = []) {
  const msLines = milestones.length
    ? milestones.map((m) => `  • [${m.id}] "${m.name}" — status: ${m.status}, due: ${m.dueDate || 'none'}`).join('\n')
    : '  (none)'

  const taskLines = tasks.length
    ? tasks.map((t) => `  • [${t.id}] "${t.name}" — status: ${t.status}`).join('\n')
    : '  (none)'

  const issueLines = issues.length
    ? issues.map((i) => `  • [${i.id}] "${i.title}" — category: ${i.category}, status: ${i.status}`).join('\n')
    : '  (none)'

  return `You are a project delivery intelligence assistant parsing a raw team message into structured multi-entity JSON updates.

EXISTING MILESTONES:
${msLines}

EXISTING TASKS:
${taskLines}

EXISTING ISSUES:
${issueLines}

RAW UPDATE TEXT:
"""
${rawText}
"""

Analyse the message and extract updates for ALL relevant sections. Return a JSON object with this EXACT schema:

{
  "milestones": [
    {
      "id": "<existing milestone id if matched, or null>",
      "name": "<name of milestone>",
      "status": "<open | blocked | done | null>",
      "dueDate": "<YYYY-MM-DD format if mentioned, or null>"
    }
  ],
  "tasks": [
    {
      "id": "<existing task id if matched, or null>",
      "milestoneName": "<name of target milestone>",
      "name": "<task name>",
      "status": "<open | blocked | done>",
      "owner": "<owner name if mentioned, or null>"
    }
  ],
  "issues": [
    {
      "id": "<existing issue id if matched, or null>",
      "title": "<issue or blocker title>",
      "category": "<Bug | Feature Request | Question | Support | Implementation>",
      "status": "<open | closed>"
    }
  ],
  "projectStatus": "<On Track | At Risk | Blocked | Completed | null>",
  "summary": "<one concise professional customer-facing summary sentence>",
  "confidence": "<high | medium | low>"
}

Rules:
1. Match existing IDs if the text refers to existing items.
2. If text introduces a new milestone, task, or issue, set "id" to null so it will be created.
3. If an issue or blocker is mentioned (e.g. "blocked by legal", "packet loss", "surveys stuck"), include an item in "issues" array.
4. "summary" must be neutral and customer-facing.`
}

/**
 * Smart Multi-Entity Fallback Rule Parser
 */
function parseUpdateLocally(rawText, milestones = [], tasks = [], issues = []) {
  const lower = rawText.toLowerCase()

  let inferredStatus = 'open'
  if (lower.includes('complete') || lower.includes('done') || lower.includes('finish') || lower.includes('passed')) {
    inferredStatus = 'done'
  } else if (lower.includes('block') || lower.includes('stuck') || lower.includes('issue') || lower.includes('delay') || lower.includes('kicked back')) {
    inferredStatus = 'blocked'
  }

  // 1. Milestone matching
  let matchedMs = milestones.find((m) =>
    m.name && lower.includes(m.name.toLowerCase().split(' ')[0])
  )
  const msList = []
  if (matchedMs) {
    msList.push({
      id: matchedMs.id,
      name: matchedMs.name,
      status: inferredStatus,
      dueDate: matchedMs.dueDate || null,
    })
  } else if (milestones.length > 0) {
    msList.push({
      id: milestones[0].id,
      name: milestones[0].name,
      status: inferredStatus,
      dueDate: milestones[0].dueDate || null,
    })
  }

  // 2. Task extraction
  const taskList = []
  let matchedTask = tasks.find((t) => t.name && lower.includes(t.name.toLowerCase().split(' ')[0]))
  const taskTitle = matchedTask ? matchedTask.name : rawText.trim()
  const targetMsName = matchedMs ? matchedMs.name : (milestones[0]?.name || 'General Phase')

  taskList.push({
    id: matchedTask ? matchedTask.id : null,
    milestoneName: targetMsName,
    name: taskTitle,
    status: inferredStatus,
    owner: null,
  })

  // 3. Issue extraction
  const issueList = []
  if (inferredStatus === 'blocked' || lower.includes('issue') || lower.includes('bug') || lower.includes('legal') || lower.includes('stuck')) {
    let matchedIssue = issues.find((i) => i.title && lower.includes(i.title.toLowerCase().split(' ')[0]))
    issueList.push({
      id: matchedIssue ? matchedIssue.id : null,
      title: matchedIssue ? matchedIssue.title : rawText.trim(),
      category: lower.includes('bug') ? 'Bug' : lower.includes('feature') ? 'Feature Request' : lower.includes('question') ? 'Question' : 'Implementation',
      status: 'open',
    })
  }

  // 4. Project overall status
  let projectStatus = null
  if (inferredStatus === 'blocked') projectStatus = 'Blocked'
  else if (inferredStatus === 'done') projectStatus = 'On Track'

  return {
    milestoneId: msList[0]?.id || null,
    milestoneName: targetMsName,
    taskId: taskList[0]?.id || null,
    taskName: taskTitle,
    milestones: msList,
    tasks: taskList,
    issues: issueList,
    projectStatus,
    summary: rawText.length > 90 ? `${rawText.substring(0, 87)}...` : rawText,
    inferredStatus,
    confidence: 'medium',
  }
}

/**
 * Call the Gemini API and return structured multi-entity updates.
 */
export async function parseUpdateWithGemini(rawText, milestones = [], tasks = [], issues = []) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return parseUpdateLocally(rawText, milestones, tasks, issues)
  }

  const prompt = buildPrompt(rawText, milestones, tasks, issues)
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
      console.warn(`Gemini API status ${response.status}, using smart fallback rule engine.`)
      return parseUpdateLocally(rawText, milestones, tasks, issues)
    }

    const data = await response.json()
    const rawOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    if (!rawOutput.trim()) {
      return parseUpdateLocally(rawText, milestones, tasks, issues)
    }

    const cleaned = rawOutput
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    const milestoneList = Array.isArray(parsed.milestones) ? parsed.milestones : []
    const taskList = Array.isArray(parsed.tasks) ? parsed.tasks : []
    const issueList = Array.isArray(parsed.issues) ? parsed.issues : []

    const firstMs = milestoneList[0] || {}
    const firstTask = taskList[0] || {}

    return {
      milestoneId: firstMs.id || parsed.milestoneId || (milestones[0]?.id || null),
      milestoneName: firstMs.name || parsed.milestoneName || (milestones[0]?.name || null),
      taskId: firstTask.id || parsed.taskId || null,
      taskName: firstTask.name || parsed.taskName || rawText,
      milestones: milestoneList,
      tasks: taskList,
      issues: issueList,
      projectStatus: parsed.projectStatus || null,
      summary: parsed.summary || rawText,
      inferredStatus: firstMs.status || firstTask.status || 'open',
      confidence: parsed.confidence || 'high',
    }
  } catch (err) {
    clearTimeout(timeoutId)
    console.warn('Gemini API call failed, using fallback parser:', err.message)
    return parseUpdateLocally(rawText, milestones, tasks, issues)
  }
}
