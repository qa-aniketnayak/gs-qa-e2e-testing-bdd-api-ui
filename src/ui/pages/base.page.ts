import { Page } from '@playwright/test'

export default class BasePage {
  protected page: Page

  constructor(page: Page) {
    this.page = page
    this.page.setDefaultTimeout(30_000) // 30s Playwright timeout
  }

  async navigate(url: string) {
    await this.page.goto(url, { waitUntil: 'networkidle' })
  }
}
