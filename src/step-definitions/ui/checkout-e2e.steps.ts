import { Given, When, Then } from '@cucumber/cucumber'
import type { Cookie } from '@playwright/test'
import { CheckoutPage } from '../../ui/pages/checkout.page'
import { VehiclePage } from '../../ui/pages/vehicle.page'
import PlanPage from '../../ui/pages/plan.page'
import QuotePage from '../../ui/pages/quote.page'
import PaymentPage from '../../ui/pages/payment.page'
import { BASE_URL } from '../../../config/urls'

let checkout: CheckoutPage
let vehicle: VehiclePage
let plan: PlanPage
let quote: QuotePage
let payment: PaymentPage

Given('user launches checkout application', async function () {
  checkout = new CheckoutPage(this.page!)
  await checkout.navigate(BASE_URL)
})

Then('checkout page UI should be displayed correctly', async function () {
  await checkout.verifyCheckoutPageUI()
})

When('user completes personal information', async function () {
  await checkout.fillPersonalInformation()

  vehicle = new VehiclePage(this.page!)
  plan = new PlanPage(this.page!)
  quote = new QuotePage(this.page!)
  payment = new PaymentPage(this.page!)
})

When(
  'user completes vehicle information for {string}',
  async function (vehicleType: string) {
    await vehicle.fillVehicleInformation(vehicleType)
  }
)

When('user customizes plan', async function () {
  await plan.customizePlanAndGetPrice()
})

When('user reviews and secures quote', async function () {
  await quote.selectQuarterlyAndSecureQuote()
})

Then('payment page should be displayed', async function () {
  await payment.verifyPaymentPage()
})

Then('user completes payment', async function () {
  await payment.enterMinimalCardDetails()
})

Then('order should be completed', async function () {
  // assertion handled inside payment flow
})