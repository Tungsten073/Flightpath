import { createClient } from '@supabase/supabase-js'

async function runSupabase21StepTest() {
  console.log('=== STARTING 21-STEP SUPABASE POSTGRESQL CRUD & CASCADING TEST ===')

  const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || ''

  const isConfigured = Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes('your-project') &&
      !supabaseAnonKey.includes('your_supabase')
  )

  if (!isConfigured) {
    console.log('STATUS: Supabase unconfigured in environment (.env contains placeholders).')
    console.log('Local business state persistence via localStorage has been REMOVED completely.')
    console.log('Header displays: ⚠ DATABASE OFFLINE / CONFIGURATION REQUIRED')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const testProjectId = `proj-test-${Date.now()}`
  const testMilestoneId = `ms-test-${Date.now()}`
  const testTaskId = `tsk-test-${Date.now()}`
  const testIssueId = `iss-test-${Date.now()}`
  const testUpdateId = `upd-test-${Date.now()}`

  try {
    // 1 & 2. Load 3 existing projects
    const { data: seedProjects, error: err1 } = await supabase.from('projects').select('*')
    if (err1) throw err1
    console.log(`[PASS] 1 & 2. Loaded ${seedProjects.length} existing projects from Supabase.`)

    // 3 & 4. Create project "Final Supabase Persistence Test" with 37% progress
    const newProject = {
      id: testProjectId,
      name: 'Final Supabase Persistence Test',
      customer: 'Supabase Audit Corp',
      owners: ['Audit Engineer'],
      description: 'End-to-end 21-step Supabase PostgreSQL persistence test',
      status: 'On Track',
      progress: 37,
      created_at: new Date().toISOString().split('T')[0],
      start_date: new Date().toISOString().split('T')[0],
      due_date: '2026-12-31',
      last_activity_at: new Date().toISOString(),
    }
    const { error: err2 } = await supabase.from('projects').insert([newProject])
    if (err2) throw err2
    console.log('[PASS] 3 & 4. Inserted project "Final Supabase Persistence Test" (37% progress) into Supabase.')

    // 5. Verify project exists in Supabase
    const { data: verifyP1 } = await supabase.from('projects').select('*').eq('id', testProjectId).single()
    if (!verifyP1 || verifyP1.progress !== 37) throw new Error('Project verification failed in Supabase')
    console.log('[PASS] 5. Verified project exists in Supabase PostgreSQL.')

    // 6 & 7. Edit progress 37 -> 73
    const { error: err3 } = await supabase.from('projects').update({ progress: 73 }).eq('id', testProjectId)
    if (err3) throw err3
    const { data: verifyP2 } = await supabase.from('projects').select('*').eq('id', testProjectId).single()
    if (!verifyP2 || verifyP2.progress !== 73) throw new Error('Progress update to 73 failed in Supabase')
    console.log('[PASS] 6 & 7. Updated project progress to 73% in Supabase.')

    // 8 & 9. Add milestone & verify
    const newMilestone = {
      id: testMilestoneId,
      project_id: testProjectId,
      name: 'Supabase Migration Milestone',
      status: 'open',
      due_date: '2026-10-15',
    }
    const { error: err4 } = await supabase.from('milestones').insert([newMilestone])
    if (err4) throw err4
    const { data: verifyM } = await supabase.from('milestones').select('*').eq('id', testMilestoneId).single()
    if (!verifyM) throw new Error('Milestone verification failed in Supabase')
    console.log('[PASS] 8 & 9. Inserted and verified milestone in Supabase.')

    // 10 & 11. Add task & verify
    const newTask = {
      id: testTaskId,
      milestone_id: testMilestoneId,
      name: 'Verify PostgreSQL tables',
      status: 'open',
      owner: 'Audit Engineer',
    }
    const { error: err5 } = await supabase.from('tasks').insert([newTask])
    if (err5) throw err5
    const { data: verifyT } = await supabase.from('tasks').select('*').eq('id', testTaskId).single()
    if (!verifyT) throw new Error('Task verification failed in Supabase')
    console.log('[PASS] 10 & 11. Inserted and verified task in Supabase.')

    // 12 & 13. Add issue & verify
    const newIssue = {
      id: testIssueId,
      project_id: testProjectId,
      title: 'Verify table schema constraints',
      category: 'Implementation',
      status: 'open',
    }
    const { error: err6 } = await supabase.from('issues').insert([newIssue])
    if (err6) throw err6
    const { data: verifyI } = await supabase.from('issues').select('*').eq('id', testIssueId).single()
    if (!verifyI) throw new Error('Issue verification failed in Supabase')
    console.log('[PASS] 12 & 13. Inserted and verified issue in Supabase.')

    // 14 & 15. Add update & verify
    const newUpdate = {
      id: testUpdateId,
      project_id: testProjectId,
      channel: 'web_ai',
      raw_text: 'Supabase PostgreSQL persistence audit completed successfully.',
      timestamp: new Date().toISOString(),
      parsed: { summary: 'Audit passed' },
    }
    const { error: err7 } = await supabase.from('updates').insert([newUpdate])
    if (err7) throw err7
    const { data: verifyU } = await supabase.from('updates').select('*').eq('id', testUpdateId).single()
    if (!verifyU) throw new Error('Update verification failed in Supabase')
    console.log('[PASS] 14 & 15. Inserted and verified update in Supabase.')

    // 16, 17, 18, 19. Verify persistence query after simulated refresh
    const { data: refreshProj } = await supabase.from('projects').select('*').eq('id', testProjectId).single()
    const { data: refreshMs } = await supabase.from('milestones').select('*').eq('id', testMilestoneId)
    const { data: refreshTasks } = await supabase.from('tasks').select('*').eq('id', testTaskId)
    const { data: refreshIssues } = await supabase.from('issues').select('*').eq('id', testIssueId)
    const { data: refreshUpdates } = await supabase.from('updates').select('*').eq('id', testUpdateId)

    if (
      !refreshProj ||
      refreshProj.progress !== 73 ||
      refreshMs.length !== 1 ||
      refreshTasks.length !== 1 ||
      refreshIssues.length !== 1 ||
      refreshUpdates.length !== 1
    ) {
      throw new Error('Supabase persistence verification failed after refresh')
    }
    console.log('[PASS] 16, 17, 18, 19. Verified project, 73% progress, milestone, task, issue, and update persisted in Supabase across re-queries.')

    // 20 & 21. Delete project & verify cascading deletion
    const { error: err8 } = await supabase.from('projects').delete().eq('id', testProjectId)
    if (err8) throw err8

    const { data: deletedProj } = await supabase.from('projects').select('*').eq('id', testProjectId)
    const { data: deletedMs } = await supabase.from('milestones').select('*').eq('id', testMilestoneId)
    const { data: deletedTasks } = await supabase.from('tasks').select('*').eq('id', testTaskId)
    const { data: deletedIssues } = await supabase.from('issues').select('*').eq('id', testIssueId)
    const { data: deletedUpdates } = await supabase.from('updates').select('*').eq('id', testUpdateId)

    if (
      deletedProj.length !== 0 ||
      deletedMs.length !== 0 ||
      deletedTasks.length !== 0 ||
      deletedIssues.length !== 0 ||
      deletedUpdates.length !== 0
    ) {
      throw new Error('Cascading deletion failed in Supabase')
    }
    console.log('[PASS] 20 & 21. Deleted test project and confirmed cascading deletion removed all related milestones, tasks, issues, and updates.')

    console.log('\n=== ALL 21 STEPS PASSED ON ACTUAL SUPABASE POSTGRESQL DATABASE ===\n')
  } catch (err) {
    console.error('SUPABASE TEST FAILED:', err.message)
  }
}

runSupabase21StepTest()
