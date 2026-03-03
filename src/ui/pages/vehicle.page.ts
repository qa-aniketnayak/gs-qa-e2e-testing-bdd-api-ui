import { Page, expect, Locator } from '@playwright/test'
import VehicleLocators from '../locators/vehicle.locators'
import { attachNetworkLogger } from '../../utils/networkLogger'
import {getVehicleDataByType, type CheckoutE2EData } from '../../../fixtures/ui/checkout.e2e.data'

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
    const isAuto = type === 'auto' || type === 'autos'
    const isRv = type === 'rv' || type === 'rvs'

    if (!isAuto && !isRv) {
      throw new Error(`Unsupported vehicle type: ${vehicleType}`)
    }

    const vehicleData = getVehicleDataByType(vehicleType)

    //   VEHICLE TYPE  
    if (isAuto) {
      await this.locators.autoTab().click()
    } else {
      const rvData = vehicleData as CheckoutE2EData['vehicle']['rv']
      await this.locators.rvTab().click()
      await this.selectDropdownByLabel('RV Type', rvData.rvType)
    }

    //   COMMON DROPDOWNS  
    await this.selectDropdownByLabel('Year', vehicleData.year)
    await this.selectDropdownByLabel('Make', vehicleData.make)
    await this.selectDropdownByLabel('Model', vehicleData.model)

    //   INPUT  
    await this.locators.mileageInput().fill(vehicleData.mileage)
    await this.locators.vinInput().focus()

    //   AUTO ONLY  
    if (isAuto) {
      const autoData = vehicleData as CheckoutE2EData['vehicle']['auto']

      if (autoData.transmission === 'Automatic') {
        await this.clickRadixRadio(this.locators.automaticTransmission())
      } else {
        await this.clickRadixRadio(this.locators.manualTransmission())
      }

      if (autoData.fuel === 'Gasoline') {
        await this.clickRadixRadio(this.locators.gasolineFuel())
      } else {
        await this.clickRadixRadio(this.locators.dieselFuel())
      }
    }

    //  OWNERSHIP 
    if (vehicleData.ownership === 'Own Vehicle') {
      await this.clickRadixRadio(this.locators.ownVehicle())
    } else {
      await this.clickRadixRadio(this.locators.potentialPurchase())
    }

    //  SUBMIT 
    await Promise.all([
      this.page.waitForURL(/\/checkout\/plan/, { timeout: 30000 }),
      this.locators.addVehicleButton().click()
    ])
  }
}
