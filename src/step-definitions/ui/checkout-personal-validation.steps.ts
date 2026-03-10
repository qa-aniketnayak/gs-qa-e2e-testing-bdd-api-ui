import { When, Then } from '@cucumber/cucumber'
import { CheckoutPage } from '../../ui/pages/checkout.page'

When('user clicks Start my quote without entering data', async function () {
  const checkoutPage = new CheckoutPage(this.page)
  await checkoutPage.submitEmptyForm()
})

Then('all required field validation errors should be displayed', async function () {
  const checkoutPage = new CheckoutPage(this.page)
  await checkoutPage.verifyAllRequiredFieldErrors()
})

When('user fills personal information except {string}', async function (field: string) {
  const checkoutPage = new CheckoutPage(this.page)
  await checkoutPage.fillPersonalInfoExcept(field)
})

When('user clicks Start my quote', async function () {
  const checkoutPage = new CheckoutPage(this.page)

  await checkoutPage.ensureTermsChecked()
  await checkoutPage.clickStartQuote()
})

Then('{string} validation message should be displayed', async function (error: string) {
  const checkoutPage = new CheckoutPage(this.page)
  await checkoutPage.verifyValidationMessage(error)
})