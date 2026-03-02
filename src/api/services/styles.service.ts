import { APIRequestContext } from '@playwright/test';

export class StylesService {
  constructor(private request: APIRequestContext) {}

  async getStyles(
    year: string,
    manufacturer: string,
    model: string,
    trim: string,
    headers: Record<string, string>,
    vehicleType: string
  ) {
    return this.request.get(
      `/api/esp/${vehicleType}/year/${year}/manufacturer/${manufacturer}/model/${model}/trim/${trim}`,
      { headers }
    );
  }
}
