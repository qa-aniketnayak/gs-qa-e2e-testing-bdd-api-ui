import { Page, Response } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'api-network.txt')

let isAttached = false
let isFileInitialized = false

function resetLogFileOnce() {
  if (isFileInitialized) return
  isFileInitialized = true

  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR)
  }

  fs.writeFileSync(LOG_FILE, '')
}

export function attachNetworkLogger(page: Page, pageName?: string) {
  if (isAttached) return
  isAttached = true

  resetLogFileOnce()

  page.on('response', (res: Response) => {
    try {
      const url = res.url()
      if (!url.includes('/api/')) return

      const req = res.request()
      const method = req.method()
      const status = res.status()
      const timestamp = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false
    })
      const source = pageName ? `[${pageName}] ` : ''

      const logLine =
        `${timestamp} | ${source}${method} | ${status} | ${url}\n`

      fs.appendFileSync(LOG_FILE, logLine)
    } catch {
      // logging must never break test execution
    }
  })
}