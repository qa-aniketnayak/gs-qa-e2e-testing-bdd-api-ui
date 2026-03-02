import { APIRequestContext } from '@playwright/test';

export class TrimsService {
  constructor(private request: APIRequestContext) {}

  async getTrims(
    year: string,
    manufacturer: string,
    model: string,
    headers: Record<string, string>,
    vehicleType: string
  ) {
    return this.request.get(
      `/api/esp/${vehicleType}/year/${year}/manufacturer/${manufacturer}/model/${model}`,
      { headers }
    );
  }
}
