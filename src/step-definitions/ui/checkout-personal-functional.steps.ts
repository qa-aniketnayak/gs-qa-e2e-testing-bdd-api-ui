import { When, Then } from '@cucumber/cucumber'
import { CheckoutPage } from '../../ui/pages/checkout.page'

When('user fills personal information with member {string}', async function (member: string) {
  const checkoutPage = new CheckoutPage(this.page)
  await checkoutPage.fillPersonalInformationWithMember(member)
})

Then('user should be navigated to vehicle page', async function () {
  await this.page.waitForURL(/\/checkout\/vehicle/)
})

Then('Good Sam member default selection should be {string}', async function (member: string) {
  const checkoutPage = new CheckoutPage(this.page)
  await checkoutPage.verifyDefaultMemberSelection(member)
})

When('user clicks Good Sam logo', async function () {
  const checkoutPage = new CheckoutPage(this.page)
  await checkoutPage.clickLogo()
})

Then('user should be navigated to home page', async function () {
  const checkoutPage = new CheckoutPage(this.page)
  await checkoutPage.verifyHomePageNavigation()
})

Then('phone number link should be correct', async function () {
  const checkoutPage = new CheckoutPage(this.page)
  await checkoutPage.verifyPhoneLink()
})

When('user clicks retrieve quote button', async function () {
  const checkoutPage = new CheckoutPage(this.page)
  await checkoutPage.clickRetrieveQuote()
})

Then('retrieve quote button should be visible', async function () {
  const checkoutPage = new CheckoutPage(this.page)
  await checkoutPage.verifyRetrieveQuoteButtonVisible()
})