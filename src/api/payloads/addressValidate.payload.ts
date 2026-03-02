export class AddressValidatePayload {
  static validAddress() {
    return {
      address1: '650 Three Springs Rd',
      zipCode: '42104',
      country: 'US'
    };
  }

  static urlEncodedAddress() {
    return {
      address1: '650+Three+Springs+Rd',
      zipCode: '42104',
      country: 'US',
      doQuickCheck: true
    };
  }

  static blankAddress1() {
    return {
      address1: '',
      zipCode: '42104',
      country: 'US'
    };
  }

  static blankZipCode() {
    return {
      address1: '650 Three Springs Rd',
      zipCode: '',
      country: 'US'
    };
  }

  static blankCountry() {
    return {
      address1: '650 Three Springs Rd',
      zipCode: '42104',
      country: ''
    };
  }

  static invalidZipCode() {
  return {
    address1: '650 Three Springs Rd',
    zipCode: 'ABCDE',
    country: 'US'
  };
}
}
