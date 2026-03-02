import { expect, APIResponse } from '@playwright/test';

export async function validateAutoYearsResponse(response: APIResponse) {
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toHaveProperty('years');
  expect(Array.isArray(body.years)).toBe(true);
  expect(body.years.length).toBeGreaterThan(0);

  // all values should be strings
  body.years.forEach((year: any) => {
    expect(typeof year).toBe('string');
  });

  // verify descending order
  const sortedYears = [...body.years].sort((a, b) => Number(b) - Number(a));
  expect(body.years).toEqual(sortedYears);
}
