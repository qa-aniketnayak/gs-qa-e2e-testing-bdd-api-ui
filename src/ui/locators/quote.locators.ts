import { Page } from '@playwright/test'

export default class QuoteLocators {
  constructor(private page: Page) {}

  // ===== Step indicators =====
  stepFourIndicator = () =>
    this.page.getByText(/step 4 of 5/i)

  stepFiveIndicator = () =>
    this.page.getByText(/step 5 of 5/i)

  // ===== Tabs =====
  quarterlyTab = () =>
    this.page.getByRole('tab', {
      name: /quarterly/i
    })

  // ===== Term dropdown =====
  termDropdown = () =>
    this.page.locator('button#term')

  sixYearsOption = () =>
    this.page.getByRole('option', {
      name: /6\s*years/i
    })

  // ===== Actions =====
  secureCoverageButton = () =>
    this.page.getByRole('button', {
      name: /secure coverage/i
    })
}
