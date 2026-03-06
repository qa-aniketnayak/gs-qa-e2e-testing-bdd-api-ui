import { Page } from '@playwright/test'

export class CheckoutLocators {
  constructor(private page: Page) {}

  // Textboxes
  firstNameInput = () =>
    this.page.getByRole('textbox', { name: 'First name' })

  lastNameInput = () =>
    this.page.getByRole('textbox', { name: 'Last name' })

  emailInput = () =>
    this.page.getByRole('textbox', { name: 'Email' })

  addressInput = () =>
    this.page.getByRole('textbox', {
      name: /shipping address|street address|home street address|address/i
    })

  phoneNumberInput = () =>
    this.page.getByRole('textbox', { name: 'Phone number' })

  zipCodeInput = () =>
    this.page.getByRole('textbox', { name: 'ZIP Code' })

  // Radio buttons
  yesRadioButton = () =>
    this.page.getByRole('radio', { name: 'Yes' })

  noRadioButton = () =>
    this.page.getByRole('radio', { name: 'No' })

  // Checkbox
  termsCheckbox = () =>
    this.page.getByRole('checkbox')

  // Buttons
  startMyQuoteButton = () =>
    this.page.getByRole('button', { name: 'Start my quote' })

  retrieveQuoteButton = () =>
    this.page.getByRole('button', { name: 'Retrieve a quote' })

  // Header elements
  logoLink = () =>
    this.page.locator('nav a[href="/"]')

  phoneLink = () =>
    this.page.locator('a[href^="tel:"]')
}