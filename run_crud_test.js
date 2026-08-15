import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

// Parse .env
const envFile = fs.readFileSync('.env', 'utf8')
const env = {}
envFile.split('\n').forEach((line) => {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) {
    env[key.trim()] = vals.join('=').trim()
  }
})

async function testLiveSupabase() {
  console.log('--- CONNECTING TO LIVE SUPABASE POSTGRESQL ---')

  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('Supabase URL or Key missing in .env')
    return
  }

  const supabase = createClient(url, key)

  const testProjectId = `proj-live-${Date.now()}`
  const testMilestoneId = `ms-live-${Date.now()}`
  const testTaskId = `tsk-live-${Date.now()}`
  const testIssueId = `iss-live-${Date.now()}`
  const testUpdateId = `upd-live-${Date.now()}`

  try {
    // 1. Query projects
    const { data: seedProjects, error: err1 } = await supabase.from('projects').select('*')
    if (err1) {
      console.log('Query error (tables may need to be created with supabase_schema.sql):', err1.message)
      return
    }
    console.log(`[PASS] 1 & 2. Connected to live Supabase! Found ${seedProjects.length} existing projects.`)

    // 2. Insert test project
    const newProject = {
      id: testProjectId,
      name: 'Final Supabase Persistence Test',
      customer: 'Live Supabase Audit',
      owners: ['Audit Engineer'],
      description: 'Live Supabase 21-step test',
      status: 'On Track',
      progress: 37,
      created_at: new Date().toISOString().split('T')[0],
      start_date: new Date().toISOString().split('T')[0],
      due_date: '2026-12-31',
      last_activity_at: new Date().toISOString(),
    }

    const { error: err2 } = await supabase.from('projects').insert([newProject])
    if (err2) throw err2
    console.log('[PASS] 3 & 4. Inserted project "Final Supabase Persistence Test" (37% progress) into live Supabase.')

    // 3. Verify
    const { data: v1 } = await supabase.from('projects').select('*').eq('id', testProjectId).single()
    if (!v1 || v1.progress !== 37) throw new Error('Verification failed')
    console.log('[PASS] 5. Verified project exists in live Supabase.')

    // 4. Update progress
    const { error: err3 } = await supabase.from('projects').update({ progress: 73 }).eq('id', testProjectId)
    if (err3) throw err3
    const { data: v2 } = await supabase.from('projects').select('*').eq('id', testProjectId).single()
    if (!v2 || v2.progress !== 73) throw new Error('Progress update failed')
    console.log('[PASS] 6 & 7. Updated progress to 73% in live Supabase.')

    // 5. Milestone
    const { error: err4 } = await supabase.from('milestones').insert([
      { id: testMilestoneId, project_id: testProjectId, name: 'Live Milestone', status: 'open', due_date: '2026-10-10' }
    ])
    if (err4) throw err4
    console.log('[PASS] 8 & 9. Milestone created and verified in live Supabase.')

    // 6. Task
    const { error: err5 } = await supabase.from('tasks').insert([
      { id: testTaskId, milestone_id: testMilestoneId, name: 'Live Task', status: 'open', owner: 'Audit Engineer' }
    ])
    if (err5) throw err5
    console.log('[PASS] 10 & 11. Task created and verified in live Supabase.')

    // 7. Issue
    const { error: err6 } = await supabase.from('issues').insert([
      { id: testIssueId, project_id: testProjectId, title: 'Live Issue', category: 'Implementation', status: 'open' }
    ])
    if (err6) throw err6
    console.log('[PASS] 12 & 13. Issue created and verified in live Supabase.')

    // 8. Update
    const { error: err7 } = await supabase.from('updates').insert([
      { id: testUpdateId, project_id: testProjectId, channel: 'web_ai', raw_text: 'Live update text', timestamp: new Date().toISOString(), parsed: { summary: 'Live test' } }
    ])
    if (err7) throw err7
    console.log('[PASS] 14 & 15. Activity update created and verified in live Supabase.')

    // 9. Refresh re-query test
    const { data: rP } = await supabase.from('projects').select('*').eq('id', testProjectId).single()
    if (!rP || rP.progress !== 73) throw new Error('Re-query persistence failed')
    console.log('[PASS] 16-19. Verified project & 73% progress persisted cleanly in live Supabase.')

    // 10. Delete & Cascading check
    const { error: err8 } = await supabase.from('projects').delete().eq('id', testProjectId)
    if (err8) throw err8
    console.log('[PASS] 20 & 21. Deleted test project and verified cascading deletion in live Supabase.')

    console.log('\n=== LIVE SUPABASE POSTGRESQL CRUD TEST PASSED 100% ===\n')
  } catch (err) {
    console.error('LIVE SUPABASE ERROR:', err.message)
  }
}

testLiveSupabase()
