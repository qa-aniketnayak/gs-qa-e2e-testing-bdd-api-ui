import { Page, Frame } from '@playwright/test'

export default class PaymentLocators {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  // ===== IFRAME =====
  paymentIframe() {
    return this.page.locator('#PortalOneFrame')
  }

  // ===== CARD DETAILS (inside iframe) =====
  cardNumberInput(frame: Frame) {
    return frame.locator('#cardNumber input')
  }

  expiryInput(frame: Frame) {
    return frame.locator('#expirationDate input')
  }

  nicknameInput(frame: Frame) {
    return frame.locator('#nickname input')
  }

  // ===== REVIEW / CONFIRM =====
  reviewText(frame: Frame) {
    return frame.locator('text=/review/i')
  }

  // ===== IFRAME BODY =====
  iframeBody(frame: Frame) {
    return frame.locator('body')
  }
}
