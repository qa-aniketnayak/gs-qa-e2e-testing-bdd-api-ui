import { APIRequestContext } from '@playwright/test';

export class ModelsService {
  constructor(private request: APIRequestContext) {}

  async getModels(
    year: string,
    manufacturer: string,
    headers: Record<string, string>,
    vehicleType: string
  ) {
    return this.request.get(
      `/api/esp/${vehicleType}/year/${year}/manufacturer/${manufacturer}`,
      { headers }
    );
  }
}
