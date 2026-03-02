import { APIRequestContext } from '@playwright/test';

export class AutoYearsService {
  constructor(private request: APIRequestContext) {}

  async getYears(
    headers: Record<string, string>,
    vehicleType: string
  ) {
    return this.request.get(
      `/api/esp/${vehicleType}/years`,
      { headers }
    );
  }
}
