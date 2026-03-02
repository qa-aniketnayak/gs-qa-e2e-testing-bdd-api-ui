import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AddressValidateService } from '../../api/services/addressValidate.service';
import { AddressValidatePayload } from '../../api/payloads/addressValidate.payload';
import { vehicleContext } from './vehicle.common.steps';

let payload: Record<string, any>;
let response: any;

Given(
  'address validation request payload is prepared',
  async function () {
    payload = AddressValidatePayload.validAddress();
  }
);

Given(
  'address validation payload with URL encoded address is prepared',
  async function () {
    payload = AddressValidatePayload.urlEncodedAddress();
  }
);

Given(
  'address validation payload with blank address1 is prepared',
  async function () {
    payload = AddressValidatePayload.blankAddress1();
  }
);

Given(
  'address validation payload with blank zipCode is prepared',
  async function () {
    payload = AddressValidatePayload.blankZipCode();
  }
);

Given(
  'address validation payload with blank country is prepared',
  async function () {
    payload = AddressValidatePayload.blankCountry();
  }
);

Given(
  'address validation payload with invalid zipCode is prepared',
  async function () {
    payload = AddressValidatePayload.invalidZipCode();
  }
);

When('I call address validation API', async function () {
  const { apiClient, headers } = vehicleContext;
  const request = apiClient!.getContext();

  response =
    await new AddressValidateService(request).validateAddress(
      payload,
      headers!
    );
});

Then('address validation should be successful', async function () {
  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body.success).toBe(true);
  expect(body.mailabilityScore).toBeDefined();
  expect(body.requested).toBeDefined();
  expect(body.cleansed).toBeDefined();
});

Then(
  'address should be cleansed and decoded correctly',
  async function () {
    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.cleansed.address1).toBe(
      '650 Three Springs Rd'
    );
  }
);

Then(
  'address validation should fail with address1 required error',
  async function () {
    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.error).toBe('Validation failed');
    expect(Array.isArray(body.details)).toBe(true);
    expect(body.details.length).toBeGreaterThan(0);

    const firstError = body.details[0];

    expect(firstError.path).toContain('address1');
    expect(firstError.message).toContain('Address is required');
  }
);

Then(
  'address validation should fail with zipCode required error',
  async function () {
    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.error).toBe('Validation failed');
    expect(Array.isArray(body.details)).toBe(true);

    const firstError = body.details[0];

    expect(firstError.path).toContain('zipCode');
    expect(firstError.message.toLowerCase()).toContain('zip');
  }
);

Then(
  'address validation should fail with country required error',
  async function () {
    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.error).toBe('Validation failed');
    expect(Array.isArray(body.details)).toBe(true);

    const firstError = body.details[0];

    expect(firstError.path).toContain('country');
    expect(firstError.message.toLowerCase()).toContain('country');
  }
);

Then(
  'address validation should fail with invalid zipCode error',
  async function () {
    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.error).toBe('Validation failed');
    expect(Array.isArray(body.details)).toBe(true);

    const zipError = body.details.find(
      (err: any) =>
        Array.isArray(err.path) &&
        err.path.includes('zipCode')
    );

    expect(zipError).toBeDefined();
    expect(zipError.message).toContain('Invalid US ZIP code format');
  }
);
