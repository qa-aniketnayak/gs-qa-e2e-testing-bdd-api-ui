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

  // Radio & checkbox
  yesRadioButton = () =>
    this.page.getByRole('radio', { name: 'Yes' })

  termsCheckbox = () =>
    this.page.getByRole('checkbox')

  // Button
  startMyQuoteButton = () =>
    this.page.getByRole('button', { name: 'Start my quote' })
}
