import puppeteer from 'puppeteer'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mockData = JSON.parse(
  readFileSync(path.resolve(__dirname, '../../../mockData.json'), 'utf-8')
)

const outputDir = '/Users/adityasunildolas/.gemini/antigravity/brain/8b2ef4fa-119f-4aae-8588-014168599d48'

const testCases = [
  { projId: 'proj-001', updId: 'upd-001' },
  { projId: 'proj-002', updId: 'upd-002' },
  { projId: 'proj-005', updId: 'upd-005' },
]

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function run() {
  console.log('🚀 Starting Puppeteer browser test...')
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1280,1400']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 1400 })

  for (const tc of testCases) {
    const update = mockData.rawUpdates.find(u => u.id === tc.updId)
    console.log(`\n▶ Testing ${tc.projId} with ${tc.updId}...`)

    // 1. Navigate to internal view
    const internalUrl = `http://localhost:5173/project/${tc.projId}`
    await page.goto(internalUrl, { waitUntil: 'networkidle0' })
    await sleep(1000)

    // 2. Type into textarea
    await page.waitForSelector('.add-update-textarea')
    await page.type('.add-update-textarea', update.rawText)

    // 3. Click Parse & Add Update button
    console.log('  Submitting form...')
    await page.click('.add-update-btn')

    // 4. Wait for success or AI card to appear
    try {
      await page.waitForSelector('.ai-update-card', { timeout: 15000 })
      console.log('  ✅ AI card rendered successfully!')
    } catch (e) {
      console.error('  ❌ Timeout waiting for .ai-update-card. Checking errors on page...')
      const errorText = await page.evaluate(() => {
        const errEl = document.querySelector('.add-update-error')
        return errEl ? errEl.innerText : null
      })
      if (errorText) {
        console.error('  Page Error:', errorText)
      }
    }

    await sleep(1000)

    // 5. Screenshot internal view
    const internalPic = `${outputDir}/sc_live_${tc.projId}_internal.png`
    await page.screenshot({ path: internalPic })
    console.log(`  Saved screenshot: sc_live_${tc.projId}_internal.png`)

    // 6. Navigate to customer view via UI tab click to preserve React context state
    console.log('  Navigating to Customer View via tab click...')
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.nav-tab'))
      const customerTab = tabs.find(t => t.textContent.includes('Customer View'))
      if (customerTab) customerTab.click()
    })
    await sleep(1000)

    // 7. Screenshot customer view
    const customerPic = `${outputDir}/sc_live_${tc.projId}_customer.png`
    await page.screenshot({ path: customerPic })
    console.log(`  Saved screenshot: sc_live_${tc.projId}_customer.png`)

    await sleep(2000) // Pause between test cases for API rate limits
  }

  await browser.close()
  console.log('\n🎉 Live browser UI test completed successfully!')
}

run().catch(err => {
  console.error('Test run failed:', err)
  process.exit(1)
})
