import { expect, Page } from '@playwright/test'
import PlanLocators from '../locators/plan.locators'
import { attachNetworkLogger } from '../../utils/networkLogger'

export default class PlanPage {
  private locators: PlanLocators

  constructor(private page: Page) {
    this.locators = new PlanLocators(this.page)

    // Attach API logger once for this page
    attachNetworkLogger(this.page, 'PlanPage')
  }

  async customizePlanAndGetPrice() {
    // Wait for "Choose Plan" button to appear
    const choosePlanBtn = this.locators.choosePlanButton().first()
    await expect(choosePlanBtn).toBeVisible({ timeout: 30000 })

    await this.page.waitForTimeout(500)

    // Correct sync: commit plan + wait for Quote page
    await Promise.all([
      this.locators.stepFourIndicator().waitFor({ timeout: 30000 }),
      choosePlanBtn.click()
    ])
  }
}