import {
  Before,
  After,
  AfterStep,
  Status,
  setDefaultTimeout
} from '@cucumber/cucumber'
import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// 👉 Page Objects
import { CheckoutPage } from '../ui/pages/checkout.page'
import { VehiclePage } from '../ui/pages/vehicle.page'
import PlanPage from '../ui/pages/plan.page'
import QuotePage from '../ui/pages/quote.page'
import PaymentPage from '../ui/pages/payment.page'

// ⏱ Increase default timeout for UI steps (60s)
setDefaultTimeout(60 * 1000)

/**
 * UI Setup
 */
Before({ tags: '@ui' }, async function () {
  this.browser = await chromium.launch({
    headless: false , slowMo:200
  })

  // ⭐ Solution 4: Disable automation detection
  this.context = await this.browser.newContext()

  await this.context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false
    })
  })

  this.page = await this.context.newPage()

  // ✅ Page Object initialization (UI ONLY)
  this.checkoutPage = new CheckoutPage(this.page)
  this.vehiclePage = new VehiclePage(this.page)
  this.planPage = new PlanPage(this.page)
  this.quotePage = new QuotePage(this.page)
  this.paymentPage = new PaymentPage(this.page)
})

/**
 * Screenshot per FAILED STEP
 */
AfterStep({ tags: '@ui' }, async function ({ pickleStep, result }) {
  if (result?.status === Status.FAILED && this.page) {
    const screenshotsDir = path.join(
      process.cwd(),
      'reports/screenshots/steps'
    )

    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true })
    }

    const stepName = pickleStep.text
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()

    const screenshot = await this.page.screenshot({ fullPage: true })
    await this.attach(screenshot, 'image/png')
  }
})

/**
 * UI Teardown
 */
After({ tags: '@ui' }, async function () {
  await this.page?.close()
  await this.context?.close()
  await this.browser?.close()
})
