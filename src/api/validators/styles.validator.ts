import { expect, APIResponse } from '@playwright/test';

export async function validateRequiredVehicleStyle(response: APIResponse) {
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(Array.isArray(body.styles)).toBe(true);

  const expectedStyle = body.styles.find(
    (item: any) =>
      item.style === '4x2 SR5 4dr SUV' &&
      item.vehicleId === 400928143
  );

  expect(expectedStyle).toBeDefined();
}
