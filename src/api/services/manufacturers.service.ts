import { APIRequestContext } from '@playwright/test';

export class ManufacturersService {
  constructor(private request: APIRequestContext) {}

  async getManufacturers(
    year: string,
    headers: Record<string, string>,
    vehicleType: string
  ) {
    return this.request.get(
      `/api/esp/${vehicleType}/year/${year}`,
      { headers }
    );
  }
}
