import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CheckoutPage } from '../../ui/pages/checkout.page'

let checkoutPage: CheckoutPage
let currentResult: string = ''

When('user enters boundary data', async function (dataTable) {

  checkoutPage = new CheckoutPage(this.page)

  const data = dataTable.hashes()[0]

  const formattedData = {
    firstName:
      data.firstName === '<100_char_string>'
        ? 'A'.repeat(100)
        : data.firstName === '<101_char_string>'
        ? 'A'.repeat(101)
        : data.firstName,

    lastName:
      data.lastName === '<100_char_string>'
        ? 'B'.repeat(100)
        : data.lastName,

    email: data.email,
    address: data.address,
    phone: data.phone,
    zip: data.zip
  }

  await checkoutPage.enterPersonalBoundaryData(formattedData)

})

When('user selects Good Sam member {string}', async function (member: string) {

  checkoutPage = new CheckoutPage(this.page)

  await checkoutPage.selectMember(member)

})

Then('{string} should happen', async function (result: string) {

  checkoutPage = new CheckoutPage(this.page)

  if (result === 'error') {

    await checkoutPage.verifyValidationMessage(
      'First name must be less than 100 characters'
    )

  } else if (result === 'success') {

    await expect(this.page).toHaveURL(/checkout\/vehicle/)

  }

})