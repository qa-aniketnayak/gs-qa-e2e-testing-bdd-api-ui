import BasePage from './base.page'
import { expect, Page } from '@playwright/test'
import PaymentLocators from '../locators/payment.locators'
import { attachNetworkLogger } from '../../utils/networkLogger'

export default class PaymentPage extends BasePage {
  private locators: PaymentLocators

  constructor(page: Page) {
    super(page)
    this.locators = new PaymentLocators(this.page)

    // Attach API logger once for this page
    attachNetworkLogger(this.page, 'PaymentPage')
  }

  async verifyPaymentPage(): Promise<void> {
    await expect(
      this.locators.paymentIframe()
    ).toBeVisible({ timeout: 60000 })
  }

  async enterMinimalCardDetails(): Promise<void> {
    // Let PortalOne fully load
    await this.page.waitForTimeout(12000)

    const iframeLocator = this.locators.paymentIframe()
    const frame = await iframeLocator.elementHandle().then(h => h?.contentFrame())
    if (!frame) throw new Error('Payment iframe not loaded')

    //  CARD NUMBER 
    const cardInput = this.locators.cardNumberInput(frame)
    await expect(cardInput).toBeVisible({ timeout: 45000 })
    await cardInput.click()

    const card = '4111111111111111'
    for (let i = 0; i < card.length; i++) {
      await cardInput.pressSequentially(card[i])
      await this.page.waitForTimeout(180)
      if ((i + 1) % 4 === 0) await this.page.waitForTimeout(500)
    }
    await this.page.waitForTimeout(2000)
    await cardInput.press('Tab')
    await this.page.waitForTimeout(2000)

    //  EXPIRY 
    const expiry = this.locators.expiryInput(frame)
    await expect(expiry).toBeVisible()
    await expiry.fill('1127')
    await expiry.press('Tab')
    await this.page.waitForTimeout(2000)

    //  NICK NAME 
    const nickname = this.locators.nicknameInput(frame)
    await expect(nickname).toBeVisible()
    await nickname.click()
    await nickname.fill('Test Visa')
    await this.page.waitForTimeout(2000)

    // IMPORTANT: focus must be inside iframe
    await nickname.focus()

    // Capture iframe src BEFORE submit
    const previousSrc = await iframeLocator.getAttribute('src')

    //  REAL KEYBOARD NAVIGATION 
    for (let i = 0; i < 5; i++) {
      await this.page.keyboard.press('Tab')
      await this.page.waitForTimeout(300)
    }

    await this.page.keyboard.press('Enter')

    //  WAIT FOR IFRAME REFRESH 
    await expect
      .poll(async () => iframeLocator.getAttribute('src'), {
        timeout: 60000,
        message: 'Waiting for payment iframe to refresh'
      })
      .not.toBe(previousSrc)

    // Rebind frame after refresh
    const newFrame = await iframeLocator.elementHandle().then(h => h?.contentFrame())
    if (!newFrame) throw new Error('Updated iframe not available')

    // Optional sanity check
    await expect(
      this.locators.reviewText(newFrame)
    ).toBeVisible({ timeout: 30000 })
  }

  async acceptAndSubmitFinalPayment(): Promise<void> {
    // intentionally left unchanged
  }
}