import { When, Then } from '@cucumber/cucumber'
import { CheckoutPage } from '../../ui/pages/checkout.page'

let checkoutPage: CheckoutPage


When('user enters invalid email {string}', async function (email: string) {

  checkoutPage = new CheckoutPage(this.page)

  await checkoutPage.enterEmail(email)

})


When('user enters phone {string}', async function (phone: string) {

  checkoutPage = new CheckoutPage(this.page)

  await checkoutPage.enterPhone(phone)

})


When('user enters zip {string}', async function (zip: string) {

  checkoutPage = new CheckoutPage(this.page)

  await checkoutPage.enterZip(zip)

})


When('user enters first name {string}', async function (firstName: string) {

  checkoutPage = new CheckoutPage(this.page)

  await checkoutPage.enterFirstName(firstName)

})


When('user enters last name {string}', async function (lastName: string) {

  checkoutPage = new CheckoutPage(this.page)

  await checkoutPage.enterLastName(lastName)

})


Then('phone should accept only digits', async function () {

  checkoutPage = new CheckoutPage(this.page)

  await checkoutPage.verifyPhoneAcceptsOnlyDigits()

})


Then('zip should accept only digits', async function () {

  checkoutPage = new CheckoutPage(this.page)

  await checkoutPage.verifyZipAcceptsOnlyDigits()

})


Then('last name should not accept numbers', async function () {

  checkoutPage = new CheckoutPage(this.page)

  await checkoutPage.verifyLastNameHasNoNumbers()

})