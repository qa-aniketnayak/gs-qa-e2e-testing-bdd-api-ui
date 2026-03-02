import { Page, Locator } from '@playwright/test'

export default class VehicleLocators {
  constructor(private page: Page) {}

  // ===== VEHICLE TYPE =====
  autoTab = () => this.page.getByRole('button', { name: 'Autos' })
  rvTab = () => this.page.getByRole('button', { name: 'RVs' })

  // ===== DROPDOWNS =====
  dropdownByLabel = (labelText: string) =>
    this.page.locator('label', { hasText: labelText }).locator('..').getByRole('combobox')

  dropdownOption = (optionText: string) =>
    this.page.getByRole('option', { name: optionText, exact: true })

  // ===== INPUTS =====
  mileageInput = () => this.page.getByPlaceholder('Enter vehicle mileage')
  vinInput = () => this.page.getByPlaceholder('Enter vehicle VIN')

  // ===== RADIX RADIO BUTTONS (BY ID) =====
  automaticTransmission = () => this.page.locator('#trans-auto')
  manualTransmission = () => this.page.locator('#trans-manual')

  gasolineFuel = () => this.page.locator('#fuel-gas')
  dieselFuel = () => this.page.locator('#fuel-diesel')

  ownVehicle = () => this.page.locator('#ownership-own')
  potentialPurchase = () => this.page.locator('#ownership-potential')

  // ===== ACTION =====
  addVehicleButton = () =>
    this.page.getByRole('button', { name: 'Add vehicle' })
}