import { Page, expect } from '@playwright/test'
import { CheckoutLocators } from '../locators/checkout.locators'
import { attachNetworkLogger } from '../../utils/networkLogger'

export class CheckoutPage {
  private locators: CheckoutLocators

  constructor(private page: Page) {
    this.locators = new CheckoutLocators(this.page)

    // Attach API logger once for this page
    attachNetworkLogger(this.page, 'CheckoutPage')
  }

  //  NAVIGATION

  async navigate(baseUrl: string) {
    await this.page.goto(`${baseUrl}/checkout`)
  }

  //  UI ASSERTIONS (PRE-SUBMIT)

  async verifyCheckoutPageUI() {
    await expect(this.page).toHaveTitle('Checkout | Good Sam')

    await expect(
      this.page.getByRole('heading', { name: 'More road trips, fewer worries' })
    ).toBeVisible()

    await expect(
      this.page.getByRole('heading', { name: 'Start protecting your vehicle' })
    ).toBeVisible()

    await expect(
      this.page.getByRole('textbox', { name: 'First name' })
    ).toBeVisible()

    await expect(
      this.page.getByRole('textbox', { name: 'Last name' })
    ).toBeVisible()

    await expect(
      this.page.getByRole('textbox', { name: 'Email' })
    ).toBeVisible()

    await expect(
      this.page.getByRole('textbox', { name: 'home street address' })
    ).toBeVisible()

    await expect(
      this.page.getByRole('textbox', { name: 'Phone number' })
    ).toBeVisible()

    await expect(
      this.page.getByRole('textbox', { name: 'ZIP Code' })
    ).toBeVisible()

    await expect(
      this.page.getByRole('button', { name: 'Start my quote' })
    ).toBeVisible()
  }

  // ---------------- RANDOM DATA HELPERS ----------------

  private generateRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('')
  }

  private generateRandomEmail(): string {
    const randomPart = this.generateRandomString(6)
    return `test.${randomPart}@example.com`
  }

  private generateRandomPhoneNumber(): string {
    const randomDigits = Math.floor(
      1000000000 + Math.random() * 9000000000
    ).toString()
    return `+1${randomDigits}`
  }

  // ---------------- ACTIONS ----------------

  async fillPersonalInformation() {
    const firstName = this.generateRandomString(6)
    const lastName = this.generateRandomString(6)
    const email = this.generateRandomEmail()
    const phone = this.generateRandomPhoneNumber()

    await this.locators.firstNameInput().fill(firstName)
    await this.locators.lastNameInput().fill(lastName)
    await this.locators.emailInput().fill(email)
    await this.locators.addressInput().fill('640 Three Springs Rd')
    await this.locators.phoneNumberInput().fill(phone)
    await this.locators.zipCodeInput().fill('42104')

    await this.locators.yesRadioButton().click()
    await this.locators.termsCheckbox().check()

    await Promise.all([
      this.page.waitForURL(/\/checkout\/vehicle/, { timeout: 30000 }),
      this.locators.startMyQuoteButton().click()
    ])
  }
}