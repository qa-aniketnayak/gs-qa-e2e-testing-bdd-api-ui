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

function maskAuthHeaders(headers: Record<string, string>) {
  const maskedHeaders: Record<string, string> = {}

  for (const key in headers) {
    if (key.toLowerCase().includes('authorization') || key.toLowerCase().includes('token')) {
      maskedHeaders[key] = '***MASKED***'
    } else {
      maskedHeaders[key] = headers[key]
    }
  }

  return maskedHeaders
}

export function attachNetworkLogger(page: Page, pageName?: string) {
  if (isAttached) return
  isAttached = true

  resetLogFileOnce()

  page.on('response', async (res: Response) => {
    try {
      const url = res.url()
      if (!url.includes('/api/')) return

      const req = res.request()
      const method = req.method()
      const status = res.status()
      const headers = req.headers()

      const timestamp = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false
      })

      const source = pageName ? `[${pageName}] ` : ''
      const urlObj = new URL(url)

      let logBlock =
        `${timestamp} | ${source}${method} | ${status} | ${urlObj.pathname}\n`

      // ---------------- AUTH HEADERS ----------------
      if (headers['authorization'] || headers['Authorization']) {
        logBlock += `Auth Used: YES\n`
        logBlock += `Request Headers: ${JSON.stringify(maskAuthHeaders(headers))}\n`
      }

      // ---------------- GET → Query Params ----------------
      if (method === 'GET' && urlObj.searchParams.toString()) {
        logBlock += `QueryParams: ${urlObj.searchParams.toString()}\n`
      }

      // ---------------- POST / PATCH / PUT → Payload ----------------
      if (['POST', 'PATCH', 'PUT'].includes(method)) {
        const postData = req.postData()
        if (postData) {
          try {
            logBlock += `Payload: ${JSON.stringify(req.postDataJSON())}\n`
          } catch {
            logBlock += `Payload: ${postData}\n`
          }
        }
      }

      // ---------------- RESPONSE BODY ----------------
      try {
        const contentType = res.headers()['content-type'] || ''
        if (contentType.includes('application/json')) {
          const responseBody = await res.json()
          logBlock += `Response: ${JSON.stringify(responseBody)}\n`
        } else {
          const responseText = await res.text()
          logBlock += `Response: ${responseText}\n`
        }
      } catch {
        logBlock += `Response: <Unable to read response body>\n`
      }

      logBlock += '--------------------------------------------------\n'

      fs.appendFileSync(LOG_FILE, logBlock)
    } catch {
      // logger must never break test execution
    }
  })
}