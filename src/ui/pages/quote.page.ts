import { expect, Page } from '@playwright/test'
import QuoteLocators from '../locators/quote.locators'
import { attachNetworkLogger } from '../../utils/networkLogger'

export default class QuotePage {
  private locators: QuoteLocators

  constructor(private page: Page) {
    this.locators = new QuoteLocators(this.page)

    // ✅ Attach API logger once for this page
    attachNetworkLogger(this.page, 'QuotePage')
  }

  // Temporary backend race-condition guard
  private async waitForBackendStabilization() {
    // Payment page auto-triggers update-payment-plan on mount
    // Backend is not ready immediately in automation
    await this.page.waitForTimeout(1500)
  }

  async selectQuarterlyAndSecureQuote() {
    // Ensure Quote page is visible
    await expect(
      this.locators.stepFourIndicator()
    ).toBeVisible({ timeout: 30000 })

    // Click Quarterly tab
    const quarterlyTab = this.locators.quarterlyTab()
    await expect(quarterlyTab).toBeVisible()
    await quarterlyTab.click()

    // UI settle (pricing recalculation)
    await this.page.waitForTimeout(500)

    // ===== TERM SELECTION (UI-DRIVEN) =====
    const termDropdown = this.locators.termDropdown()
    await expect(termDropdown).toBeVisible()
    await termDropdown.click()

    const termOptions = this.page.getByRole('option')
    const optionCount = await termOptions.count()

    if (optionCount > 1) {
      const firstOption = termOptions.first()
      await expect(firstOption).toBeVisible({ timeout: 10000 })
      await firstOption.click()
    }

    await this.page.keyboard.press('Escape')

    // ===== SECURE COVERAGE =====
    const secureCoverageBtn = this.locators.secureCoverageButton()
    await expect(secureCoverageBtn).toBeEnabled({ timeout: 30000 })

    // Click ONCE
    await secureCoverageBtn.click()

    // CLEAN, SINGLE, ISOLATED DELAY
    await this.waitForBackendStabilization()

    // Validate Payment page reached
    await expect(
      this.locators.stepFiveIndicator()
    ).toBeVisible({ timeout: 30000 })
  }
}