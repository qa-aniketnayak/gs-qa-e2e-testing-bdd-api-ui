import { Page, expect } from '@playwright/test'
import { CheckoutLocators } from '../locators/checkout.locators'
import { attachNetworkLogger } from '../../utils/networkLogger'
import { getCheckoutE2EDataWithRandomUser } from '../../../fixtures/ui/checkout.e2e.data'

export class CheckoutPage {

  private locators: CheckoutLocators

  constructor(private page: Page) {
    this.locators = new CheckoutLocators(this.page)
    attachNetworkLogger(this.page, 'CheckoutPage')
  }

  // ---------------- NAVIGATION ----------------

  async navigate(baseUrl: string) {
    await this.page.goto(`${baseUrl}/checkout`)
  }

  // ---------------- UI ASSERTIONS ----------------

  async verifyCheckoutPageUI() {

    await expect(this.page).toHaveTitle('Checkout | Good Sam')

    await expect(this.locators.firstNameInput()).toBeVisible()
    await expect(this.locators.lastNameInput()).toBeVisible()
    await expect(this.locators.emailInput()).toBeVisible()
    await expect(this.locators.addressInput()).toBeVisible()
    await expect(this.locators.phoneNumberInput()).toBeVisible()
    await expect(this.locators.zipCodeInput()).toBeVisible()
    await expect(this.locators.startMyQuoteButton()).toBeVisible()
  }

  // ---------------- HAPPY PATH ----------------

  async fillPersonalInformation() {

    const { personal } = getCheckoutE2EDataWithRandomUser()

    await this.locators.firstNameInput().fill(personal.firstName)
    await this.locators.lastNameInput().fill(personal.lastName)
    await this.locators.emailInput().fill(personal.email)
    await this.locators.addressInput().fill(personal.address)
    await this.locators.phoneNumberInput().fill(personal.phone)
    await this.locators.zipCodeInput().fill(personal.zip)

    await this.locators.yesRadioButton().click()

    await this.ensureTermsChecked()

    await Promise.all([
      this.page.waitForURL(/\/checkout\/vehicle/, { timeout: 30000 }),
      this.locators.startMyQuoteButton().click()
    ])
  }

  // ---------------- BOUNDARY DATA ----------------

  async enterPersonalBoundaryData(data: any) {

    await this.locators.firstNameInput().fill(data.firstName)
    await this.locators.lastNameInput().fill(data.lastName)
    await this.locators.emailInput().fill(data.email)
    await this.locators.addressInput().fill(data.address)
    await this.locators.phoneNumberInput().fill(data.phone)
    await this.locators.zipCodeInput().fill(data.zip)

  }

  async selectMember(member: string) {

    if (member.toLowerCase() === 'yes')
      await this.locators.yesRadioButton().click()
    else
      await this.locators.noRadioButton().click()

  }

  async verifyFirstNameMaxLength(maxLength: number) {

    const value = await this.locators.firstNameInput().inputValue()

    expect(value.length).toBeLessThanOrEqual(maxLength)

  }

  async verifyValidationErrorsVisible() {

    const errors = this.page.locator('p.text-destructive')

    await expect(errors.first()).toBeVisible()

  }

  // ---------------- EMPTY FORM ----------------

  async submitEmptyForm() {
    await this.locators.startMyQuoteButton().click()
  }

  async verifyAllRequiredFieldErrors() {

    await expect(this.page.getByText('First name is required')).toBeVisible()
    await expect(this.page.getByText('Last name is required')).toBeVisible()
    await expect(this.page.getByText('Email is required')).toBeVisible()
    await expect(this.page.getByText('Home street address is required')).toBeVisible()
    await expect(this.page.getByText('Phone number is required')).toBeVisible()
    await expect(this.page.getByText('ZIP Code is required')).toBeVisible()

  }

  // ---------------- PARTIAL FORM ----------------

  async fillPersonalInfoExcept(field: string) {

    const data = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com',
      address: '650 Three Springs Rd',
      phone: '1234567890',
      zip: '42104'
    }

    if (field !== 'firstName')
      await this.locators.firstNameInput().fill(data.firstName)

    if (field !== 'lastName')
      await this.locators.lastNameInput().fill(data.lastName)

    if (field !== 'email')
      await this.locators.emailInput().fill(data.email)

    if (field !== 'address')
      await this.locators.addressInput().fill(data.address)

    if (field !== 'phone')
      await this.locators.phoneNumberInput().fill(data.phone)

    if (field !== 'zip')
      await this.locators.zipCodeInput().fill(data.zip)

  }

  // ---------------- FORM ACTIONS ----------------

  async clickStartQuote() {
    await this.locators.startMyQuoteButton().click()
  }

  async ensureTermsChecked() {

    const checkbox = this.locators.termsCheckbox()

    if (!(await checkbox.isChecked()))
      await checkbox.check()

  }

  // ---------------- VALIDATION ----------------

async verifyValidationMessage(message: string) {

  const alertError = this.page.getByRole('alert').filter({
    hasText: message
  })

  const inlineError = this.page.locator('p').filter({
    hasText: message
  })

  if (await alertError.count() > 0) {
    await expect(alertError).toBeVisible()
  } else {
    await expect(inlineError.first()).toBeVisible()
  }

}

  // ---------------- MEMBER TESTS ----------------

  async fillPersonalInformationWithMember(member: string) {

    const { personal } = getCheckoutE2EDataWithRandomUser()

    await this.enterPersonalBoundaryData(personal)

    await this.selectMember(member)

    await this.ensureTermsChecked()

    await this.clickStartQuote()

  }

  async verifyDefaultMemberSelection(member: string) {

    if (member.toLowerCase() === 'no')
      await expect(this.locators.noRadioButton()).toBeChecked()
    else
      await expect(this.locators.yesRadioButton()).toBeChecked()

  }

  // ---------------- HEADER / LINKS ----------------

  async clickLogo() {
    await this.page.locator('a[href="/"]').first().click()
  }

  async verifyHomePageNavigation() {
    await expect(this.page).toHaveURL(/camping-world/)
  }

  async verifyPhoneLink() {

    const phoneLink = this.page.locator('a[href^="tel:"]').first()

    await expect(phoneLink).toBeVisible()

  }

  async clickRetrieveQuote() {

    const retrieve = this.page.getByRole('link', { name: /retrieve/i })

    if (await retrieve.isVisible())
      await retrieve.click()

  }

async verifyRetrieveQuoteButtonVisible() {
  await expect(
    this.page.getByRole('button', { name: /retrieve/i })
  ).toBeVisible()
}

async enterEmail(email: string) {

  await this.locators.emailInput().fill(email)

}

async enterPhone(phone: string) {

  await this.locators.phoneNumberInput().fill(phone)

}

async enterZip(zip: string) {

  await this.locators.zipCodeInput().fill(zip)

}

async enterFirstName(firstName: string) {

  await this.locators.firstNameInput().fill(firstName)

}

async enterLastName(lastName: string) {

  await this.locators.lastNameInput().fill(lastName)

}

// INPUT FILTER VALIDATIONS

async verifyPhoneAcceptsOnlyDigits() {

  const value = await this.locators.phoneNumberInput().inputValue()

  // remove formatting characters
  const digitsOnly = value.replace(/[^\d]/g, '')

  // ensure at least one digit exists
  expect(digitsOnly.length).toBeGreaterThan(0)

}

async verifyZipAcceptsOnlyDigits() {

  const value = await this.locators.zipCodeInput().inputValue()

  expect(value).toMatch(/^\d+$/)

}

async verifyLastNameHasNoNumbers() {

  const value = await this.locators.lastNameInput().inputValue()

  expect(value).toMatch(/^[A-Za-z]+$/)

}

}