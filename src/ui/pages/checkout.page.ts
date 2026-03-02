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

  //ACTIONS
  async fillPersonalInformation() {
    await this.locators.firstNameInput().fill('Aniket ')
    await this.locators.lastNameInput().fill('Nayak ')
    await this.locators.emailInput().fill('aniket.nayak569@gmail.com')
    await this.locators.addressInput().fill('640 Three Springs Rd')
    await this.locators.phoneNumberInput().fill('65434767676')
    await this.locators.zipCodeInput().fill('42104')

    await this.locators.yesRadioButton().click()
    await this.locators.termsCheckbox().check()

    // Correct sync: wait for Vehicle page
    await Promise.all([
      this.page.waitForURL(/\/checkout\/vehicle/, { timeout: 30000 }),
      this.locators.startMyQuoteButton().click()
    ])
  }
}