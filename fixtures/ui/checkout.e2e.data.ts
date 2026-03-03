type CheckoutPersonalData = {
  firstName: string
  lastName: string
  email: string
  address: string
  phone: string
  zip: string
}

type VehicleOwnership = 'Own Vehicle' | 'Potential Purchase'
type TransmissionType = 'Automatic' | 'Manual'
type FuelType = 'Gasoline' | 'Diesel'

type AutoVehicleData = {
  year: string
  make: string
  model: string
  mileage: string
  transmission: TransmissionType
  fuel: FuelType
  ownership: VehicleOwnership
}

type RvVehicleData = {
  rvType: string
  year: string
  make: string
  model: string
  mileage: string
  ownership: VehicleOwnership
}

export type CheckoutE2EData = {
  personal: CheckoutPersonalData
  vehicle: {
    auto: AutoVehicleData
    rv: RvVehicleData
  }
}

export const checkoutE2EData: CheckoutE2EData = {
  personal: {
    firstName: 'Aniket',
    lastName: 'Nayak',
    email: 'aniket.nayak@gmail.com',
    address: '650 Three Springs Rd',
    phone: '+1 (234) 567-87654',
    zip: '42104'
  },
  vehicle: {
    auto: {
      year: '2023',
      make: 'Audi',
      model: 'A3',
      mileage: '1500',
      transmission: 'Automatic',
      fuel: 'Gasoline',
      ownership: 'Potential Purchase'
    },
    rv: {
      rvType: 'Travel Trailer',
      year: '2023',
      make: 'Keystone',
      model: 'Cougar',
      mileage: '1500',
      ownership: 'Potential Purchase'
    }
  }
}

function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('')
}

function generateRandomEmail(): string {
  const randomPart = generateRandomString(6)
  return `test.${randomPart}@example.com`
}

function generateRandomPhoneNumber(): string {
  const randomDigits = Math.floor(
    1000000000 + Math.random() * 9000000000
  ).toString()
  return `+1${randomDigits}`
}

export function getCheckoutE2EDataWithRandomUser(): CheckoutE2EData {
  return {
    ...checkoutE2EData,
    personal: {
      ...checkoutE2EData.personal,
      firstName: generateRandomString(6),
      lastName: generateRandomString(6),
      email: generateRandomEmail(),
      phone: generateRandomPhoneNumber()
    }
  }
}

export function getVehicleDataByType(vehicleType: string): AutoVehicleData | RvVehicleData {
  const type = vehicleType.trim().toLowerCase()

  if (type === 'auto' || type === 'autos') {
    return checkoutE2EData.vehicle.auto
  }

  if (type === 'rv' || type === 'rvs') {
    return checkoutE2EData.vehicle.rv
  }

  throw new Error(`Unsupported vehicle type for fixture data: ${vehicleType}`)
}
