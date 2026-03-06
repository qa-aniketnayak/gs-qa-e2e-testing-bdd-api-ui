import { Page, expect } from '@playwright/test'
import { CheckoutLocators } from '../locators/checkout.locators'
import { attachNetworkLogger } from '../../utils/networkLogger'
import { getCheckoutE2EDataWithRandomUser } from '../../../fixtures/ui/checkout.e2e.data'

export class CheckoutPage {
  private locators: CheckoutLocators

  constructor(private page: Page) {
    this.locators = new CheckoutLocators(this.page)

    // Attach API logger once for this page
    attachNetworkLogger(this.page, 'CheckoutPage')
  }

  async navigate(baseUrl: string) {
    await this.page.goto(`${baseUrl}/checkout`)
  }

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

  async fillPersonalInformation() {
    const { personal } = getCheckoutE2EDataWithRandomUser()

    await this.locators.firstNameInput().fill(personal.firstName)
    await this.locators.lastNameInput().fill(personal.lastName)
    await this.locators.emailInput().fill(personal.email)
    await this.locators.addressInput().fill(personal.address)
    await this.locators.phoneNumberInput().fill(personal.phone)
    await this.locators.zipCodeInput().fill(personal.zip)

    await this.locators.yesRadioButton().click()
    await this.locators.termsCheckbox().check()

    await Promise.all([
      this.page.waitForURL(/\/checkout\/vehicle/, { timeout: 30000 }),
      this.locators.startMyQuoteButton().click()
    ])
  }

  async fillPersonalInformationWithMember(member: string) {
    const { personal } = getCheckoutE2EDataWithRandomUser()

    await this.locators.firstNameInput().fill(personal.firstName)
    await this.locators.lastNameInput().fill(personal.lastName)
    await this.locators.emailInput().fill(personal.email)
    await this.locators.addressInput().fill(personal.address)
    await this.locators.phoneNumberInput().fill(personal.phone)
    await this.locators.zipCodeInput().fill(personal.zip)

    if (member.toLowerCase() === 'yes') {
      await this.locators.yesRadioButton().click()
    } else {
      await this.locators.noRadioButton().click()
    }

    await this.locators.termsCheckbox().check()

    await Promise.all([
      this.page.waitForURL(/\/checkout\/vehicle/, { timeout: 30000 }),
      this.locators.startMyQuoteButton().click()
    ])
  }

  async verifyDefaultMemberSelection(member: string) {
    if (member.toLowerCase() === 'no') {
      await expect(this.locators.noRadioButton()).toHaveAttribute(
        'aria-checked',
        'true'
      )
    }
  }

  async clickLogo() {
    await this.locators.logoLink().click()
  }

  async verifyHomePageNavigation() {
    await expect(this.page).toHaveURL(/\/$/)
  }

  async verifyPhoneLink() {
    const phoneLinks = this.page.locator('a[href^="tel:"]')

    await expect(phoneLinks).toHaveCount(2)

    await expect(phoneLinks.first()).toHaveAttribute('href', /tel:/)
  }

  async clickRetrieveQuote() {
    await expect(this.locators.retrieveQuoteButton()).toBeVisible()
    await this.locators.retrieveQuoteButton().click()
  }

  async verifyRetrieveQuoteButtonVisible() {
    await expect(this.locators.retrieveQuoteButton()).toBeVisible()
    await expect(this.locators.retrieveQuoteButton()).toBeEnabled()
  }
  async submitEmptyForm() {
  await this.locators.startMyQuoteButton().click()
}

async verifyAllRequiredFieldErrors() {
  await expect(this.locators.validationError('First name is required')).toBeVisible()
  await expect(this.locators.validationError('Last name is required')).toBeVisible()
  await expect(this.locators.validationError('Email is required')).toBeVisible()
  await expect(this.locators.validationError('Home street address is required')).toBeVisible()
  await expect(this.locators.validationError('Phone number is required')).toBeVisible()
  await expect(this.locators.validationError('ZIP Code is required')).toBeVisible()
}

async fillPersonalInfoExcept(field: string) {
  const { personal } = getCheckoutE2EDataWithRandomUser()

  if (field !== 'firstName')
    await this.locators.firstNameInput().fill(personal.firstName)

  if (field !== 'lastName')
    await this.locators.lastNameInput().fill(personal.lastName)

  if (field !== 'email')
    await this.locators.emailInput().fill(personal.email)

  if (field !== 'address')
    await this.locators.addressInput().fill(personal.address)

  if (field !== 'phone')
    await this.locators.phoneNumberInput().fill(personal.phone)

  if (field !== 'zip')
    await this.locators.zipCodeInput().fill(personal.zip)

  await this.locators.yesRadioButton().click()
}

async clickStartQuote() {
  await this.locators.startMyQuoteButton().click()
}

async verifyValidationMessage(message: string) {
  await expect(this.locators.validationError(message)).toBeVisible()
}
}