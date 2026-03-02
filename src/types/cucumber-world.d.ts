import { Browser, BrowserContext, Page } from '@playwright/test'

declare module '@cucumber/cucumber' {
  interface World<Parameters = any> {
    browser?: Browser
    context?: BrowserContext
    page?: Page
  }
}
