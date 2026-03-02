import { Page, expect, Locator } from '@playwright/test'
import VehicleLocators from '../locators/vehicle.locators'
import { attachNetworkLogger } from '../../utils/networkLogger'

export class VehiclePage {
  private locators: VehicleLocators

  constructor(private page: Page) {
    this.locators = new VehicleLocators(this.page)

    // Attach API logger once for this page
    attachNetworkLogger(this.page, 'VehiclePage')
  }

  private async selectDropdownByLabel(label: string, option: string) {
    const dropdown = this.locators.dropdownByLabel(label)
    await expect(dropdown).toBeVisible({ timeout: 30000 })
    await dropdown.click()
    await this.locators.dropdownOption(option).click()
  }

  private async clickRadixRadio(locator: Locator) {
    await expect(locator).toBeVisible({ timeout: 30000 })
    await locator.scrollIntoViewIfNeeded()
    await locator.click({ force: true })
    await expect(locator).toHaveAttribute('aria-checked', 'true')
  }

  async fillVehicleInformation(vehicleType: string) {
    const type = vehicleType.toLowerCase()

    //   VEHICLE TYPE  
    if (type === 'auto') {
      await this.locators.autoTab().click()
    } else {
      await this.locators.rvTab().click()
      await this.selectDropdownByLabel('RV Type', 'Travel Trailer')
    }

    //   COMMON DROPDOWNS  
    await this.selectDropdownByLabel('Year', '2025')
    await this.selectDropdownByLabel('Make', type === 'auto' ? 'Audi' : 'Keystone')
    await this.selectDropdownByLabel('Model', type === 'auto' ? 'A4' : 'Cougar')

    //   INPUT  
    await this.locators.mileageInput().fill('15001')
    await this.locators.vinInput().focus()

    //   AUTO ONLY  
    if (type === 'auto') {
      await this.clickRadixRadio(this.locators.automaticTransmission())
      await this.clickRadixRadio(this.locators.gasolineFuel())
    }

    //  OWNERSHIP 
    await this.clickRadixRadio(this.locators.potentialPurchase())

    //  SUBMIT 
    await Promise.all([
      this.page.waitForURL(/\/checkout\/plan/, { timeout: 30000 }),
      this.locators.addVehicleButton().click()
    ])
  }
}