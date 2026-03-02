import { Page } from '@playwright/test'

export default class PlanLocators {
  constructor(private page: Page) {}

  choosePlanButton = () =>
    this.page.getByRole('button', {
      name: /choose plan/i
    })

  stepFourIndicator = () =>
    this.page.getByText(/step 4 of 5/i)
}
