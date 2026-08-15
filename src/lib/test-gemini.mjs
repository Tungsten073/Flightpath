import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mockData = JSON.parse(
  readFileSync(path.resolve(__dirname, '../../../mockData.json'), 'utf-8')
)

// Read .env if present
let envKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
try {
  const envContent = readFileSync(path.resolve(__dirname, '../../.env'), 'utf-8')
  const match = envContent.match(/VITE_GEMINI_API_KEY\s*=\s*(.+)/)
  if (match && match[1] && match[1].trim() !== 'your_gemini_api_key_here') {
    envKey = match[1].trim()
  }
} catch (e) {}

const API_KEY = process.argv[2] || envKey
if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
  console.error('Error: VITE_GEMINI_API_KEY is not set in .env or passed as argument.')
  process.exit(1)
}

const API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${API_KEY}`

function buildPrompt(rawText, milestones, tasks) {
  const msLines = milestones.length
    ? milestones.map(m => `  • [${m.id}] "${m.name}" — status: ${m.status}, due: ${m.dueDate}`).join('\n')
    : '  (none)'
  const taskLines = tasks.length
    ? tasks.map(t => `  • [${t.id}] "${t.name}" — status: ${t.status}`).join('\n')
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

async function parseUpdate(rawUpdate) {
  const { projectId, rawText } = rawUpdate
  const milestones = mockData.milestones.filter(m => m.projectId === projectId)
  const milestoneIds = new Set(milestones.map(m => m.id))
  const tasks = mockData.tasks.filter(t => milestoneIds.has(t.milestoneId))

  const prompt = buildPrompt(rawText, milestones, tasks)

  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`API ${resp.status}: ${err}`)
  }

  const data = await resp.json()
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(cleaned)
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function run() {
  const testIds = ['upd-001', 'upd-002', 'upd-005']
  const testUpdates = mockData.rawUpdates.filter(u => testIds.includes(u.id))

  console.log('\n══════════════════════════════════════════')
  console.log('  Gemini Parsing Test — 3 rawUpdates (Real API)')
  console.log('══════════════════════════════════════════\n')

  for (let i = 0; i < testUpdates.length; i++) {
    const update = testUpdates[i]
    const project = mockData.projects.find(p => p.id === update.projectId)
    console.log(`▶ [${i+1}/3] ${update.id} — ${project?.name}`)
    console.log(`  Channel: ${update.channel}  |  ${update.timestamp}`)
    console.log(`  Raw: "${update.rawText.slice(0, 85)}…"\n`)

    try {
      const parsed = await parseUpdate(update)
      console.log('  ✅ Parsed JSON Output:')
      console.log(JSON.stringify(parsed, null, 4).split('\n').map(l => '    ' + l).join('\n'))
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`)
    }
    console.log()
    if (i < testUpdates.length - 1) {
      await sleep(2000) // 2s pause between requests
    }
  }
}

run()
